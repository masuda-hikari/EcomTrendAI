# -*- coding: utf-8 -*-
"""
スクレイパーモジュールのテスト
"""

from pathlib import Path

import pytest

from scraper import AmazonScraper, DataSaver, ProductData


class TestAmazonScraper:
    """AmazonScraperのテスト"""

    @pytest.fixture
    def scraper(self):
        return AmazonScraper()

    def test_parse_rank_change(self, scraper):
        """ランク変動パーステスト"""
        assert scraper._parse_rank_change("+150%") == 150
        assert scraper._parse_rank_change("150%") == 150
        assert scraper._parse_rank_change("1,234%") == 1234
        assert scraper._parse_rank_change("") is None
        assert scraper._parse_rank_change(None) is None

    def test_parse_price(self, scraper):
        """価格パーステスト"""
        assert scraper._parse_price("¥12,345") == 12345.0
        assert scraper._parse_price("¥999") == 999.0
        assert scraper._parse_price("") is None
        assert scraper._parse_price(None) is None

    def test_parse_review_count(self, scraper):
        """レビュー数パーステスト"""
        assert scraper._parse_review_count("1,234") == 1234
        assert scraper._parse_review_count("500") == 500
        assert scraper._parse_review_count("") is None

    def test_parse_rating(self, scraper):
        """評価パーステスト"""
        assert scraper._parse_rating("4.5") == 4.5
        assert scraper._parse_rating("5つ星のうち4.2") == 4.2
        assert scraper._parse_rating("") is None

    def test_calc_change_percent(self, scraper):
        """変動率計算テスト"""
        assert scraper._calc_change_percent(100, 10) == 100.0
        assert scraper._calc_change_percent(None, 10) is None


class TestProductData:
    """ProductDataのテスト"""

    def test_product_data_creation(self):
        """ProductData生成テスト"""
        product = ProductData(
            asin="B001234567",
            name="テスト商品",
            category="家電",
            current_rank=5,
            previous_rank=15,
            rank_change=200,
            rank_change_percent=200.0,
            price=9800.0,
            currency="JPY",
            review_count=500,
            rating=4.3,
            affiliate_url="https://amazon.co.jp/dp/B001234567?tag=test",
            timestamp="2026-01-05T10:00:00",
            source="amazon_movers_shakers",
        )

        assert product.asin == "B001234567"
        assert product.name == "テスト商品"
        assert product.rank_change_percent == 200.0


class TestDataSaver:
    """DataSaverのテスト"""

    @pytest.fixture
    def sample_products(self) -> list[ProductData]:
        """テスト用商品データ"""
        return [
            ProductData(
                asin="B001",
                name="商品A",
                category="家電",
                current_rank=1,
                previous_rank=None,
                rank_change=100,
                rank_change_percent=100.0,
                price=9800.0,
                currency="JPY",
                review_count=500,
                rating=4.5,
                affiliate_url="https://amazon.co.jp/dp/B001?tag=test",
                timestamp="2026-01-05T10:00:00",
                source="test",
            ),
            ProductData(
                asin="B002",
                name="商品B",
                category="ゲーム",
                current_rank=2,
                previous_rank=None,
                rank_change=50,
                rank_change_percent=50.0,
                price=5980.0,
                currency="JPY",
                review_count=200,
                rating=4.2,
                affiliate_url="https://amazon.co.jp/dp/B002?tag=test",
                timestamp="2026-01-05T10:00:00",
                source="test",
            ),
        ]

    def test_save_to_csv(self, tmp_path: Path, sample_products):
        """CSV保存テスト"""
        saver = DataSaver(output_dir=tmp_path)
        filepath = saver.save_to_csv(sample_products, "test_products.csv")

        assert filepath.exists()
        assert filepath.name == "test_products.csv"

        # ファイル内容確認
        content = filepath.read_text(encoding="utf-8-sig")
        assert "B001" in content
        assert "商品A" in content
        assert "B002" in content

    def test_save_empty_list(self, tmp_path: Path):
        """空リスト保存テスト"""
        saver = DataSaver(output_dir=tmp_path)
        filepath = saver.save_to_csv([], "empty.csv")

        # 空の場合はPathオブジェクト（空）を返す
        assert filepath == Path()


class TestAmazonScraperRequest:
    """AmazonScraperのHTTPリクエストテスト"""

    @pytest.fixture
    def scraper(self):
        return AmazonScraper()

    def test_request_success(self, scraper):
        """正常なHTTPリクエスト"""
        from unittest.mock import patch, MagicMock

        mock_response = MagicMock()
        mock_response.text = "<html><body>Test</body></html>"
        mock_response.raise_for_status = MagicMock()

        with patch.object(scraper.session, "get", return_value=mock_response):
            with patch("scraper.time.sleep"):
                soup = scraper._request("https://test.com")

        assert soup is not None
        assert soup.find("body") is not None

    def test_request_failure_with_retry(self, scraper):
        """リトライ付きリクエスト失敗"""
        from unittest.mock import patch
        import requests

        with patch.object(scraper.session, "get", side_effect=requests.RequestException("Error")):
            with patch("scraper.time.sleep"):
                soup = scraper._request("https://test.com")

        assert soup is None

    def test_fetch_movers_shakers_returns_empty_on_request_failure(self, scraper):
        """リクエスト失敗時は空リストを返す"""
        from unittest.mock import patch

        with patch.object(scraper, "_request", return_value=None):
            products = scraper.fetch_movers_shakers("electronics", limit=10)

        assert products == []


class TestAmazonScraperParsing:
    """AmazonScraperのパーステスト"""

    @pytest.fixture
    def scraper(self):
        return AmazonScraper()

    def test_parse_product_card_returns_none_without_asin(self, scraper):
        """ASINが取得できない場合はNoneを返す"""
        from bs4 import BeautifulSoup

        html = """<div class="p13n-grid-content">
            <a href="/some-page">No ASIN</a>
        </div>"""
        card = BeautifulSoup(html, "lxml").find("div")

        result = scraper._parse_product_card(card, "家電", "2026-01-01T00:00:00", 1)

        assert result is None

    def test_parse_product_card_with_valid_asin(self, scraper):
        """有効なASINがある場合はProductDataを返す"""
        from bs4 import BeautifulSoup

        html = """<div class="p13n-grid-content">
            <a href="/dp/B001234567">商品リンク</a>
            <span class="_cDEzb_p13n-sc-css-line-clamp-3_g3dy1">テスト商品名</span>
            <span class="zg-grid-pct-change">+150%</span>
            <span class="p13n-sc-price">¥12,345</span>
            <span class="a-icon-star-small"><span class="a-icon-alt">5つ星のうち4.5</span></span>
            <a class="a-link-normal">500</a>
        </div>"""
        card = BeautifulSoup(html, "lxml").find("div")

        result = scraper._parse_product_card(card, "家電", "2026-01-01T00:00:00", 1)

        assert result is not None
        assert result.asin == "B001234567"
        assert result.category == "家電"

    def test_parse_product_card_with_rank_metadata(self, scraper):
        """ランクメタデータがある場合"""
        from bs4 import BeautifulSoup

        html = """<div class="p13n-grid-content">
            <a href="/dp/B001234567">商品リンク</a>
            <span class="zg-grid-rank-metadata">ランキング: 17</span>
        </div>"""
        card = BeautifulSoup(html, "lxml").find("div")

        result = scraper._parse_product_card(card, "家電", "2026-01-01T00:00:00", 1)

        assert result is not None
        assert result.current_rank == 17


class TestAmazonScraperFetchMoversShakers:
    """fetch_movers_shakersのテスト"""

    @pytest.fixture
    def scraper(self):
        return AmazonScraper()

    def test_fetch_movers_shakers_with_products(self, scraper):
        """商品が取得できる場合"""
        from bs4 import BeautifulSoup
        from unittest.mock import patch

        html = """<html><body>
            <div class="p13n-grid-content">
                <a href="/dp/B001">商品1</a>
                <span class="_cDEzb_p13n-sc-css-line-clamp-3_g3dy1">テスト商品1</span>
            </div>
            <div class="p13n-grid-content">
                <a href="/dp/B002">商品2</a>
                <span class="_cDEzb_p13n-sc-css-line-clamp-3_g3dy1">テスト商品2</span>
            </div>
        </body></html>"""
        soup = BeautifulSoup(html, "lxml")

        with patch.object(scraper, "_request", return_value=soup):
            products = scraper.fetch_movers_shakers("electronics", limit=10)

        # ASINが4文字しかないのでNoneになる
        assert len(products) == 0  # B001, B002は10桁未満なのでスキップ

    def test_fetch_movers_shakers_with_valid_asins(self, scraper):
        """有効なASIN（10桁）がある場合"""
        from bs4 import BeautifulSoup
        from unittest.mock import patch

        html = """<html><body>
            <div class="p13n-grid-content">
                <a href="/dp/B001234567">商品1</a>
                <span class="_cDEzb_p13n-sc-css-line-clamp-3_g3dy1">テスト商品1の名前です</span>
            </div>
            <div class="p13n-grid-content">
                <a href="/dp/B009876543">商品2</a>
                <span class="_cDEzb_p13n-sc-css-line-clamp-3_g3dy1">テスト商品2の名前です</span>
            </div>
        </body></html>"""
        soup = BeautifulSoup(html, "lxml")

        with patch.object(scraper, "_request", return_value=soup):
            products = scraper.fetch_movers_shakers("electronics", limit=10)

        assert len(products) == 2
        assert products[0].asin == "B001234567"
        assert products[1].asin == "B009876543"

    def test_fetch_movers_shakers_limit(self, scraper):
        """取得件数制限が機能する"""
        from bs4 import BeautifulSoup
        from unittest.mock import patch

        # 5件の商品を生成
        cards = ""
        for i in range(5):
            cards += f"""<div class="p13n-grid-content">
                <a href="/dp/B00000000{i}">商品{i}</a>
                <span class="_cDEzb_p13n-sc-css-line-clamp-3_g3dy1">テスト商品{i}の名前です</span>
            </div>"""
        html = f"<html><body>{cards}</body></html>"
        soup = BeautifulSoup(html, "lxml")

        with patch.object(scraper, "_request", return_value=soup):
            products = scraper.fetch_movers_shakers("electronics", limit=3)

        assert len(products) == 3


class TestDataSaverAdditional:
    """DataSaverの追加テスト"""

    @pytest.fixture
    def sample_products(self) -> list[ProductData]:
        """テスト用商品データ"""
        return [
            ProductData(
                asin="B001",
                name="商品A",
                category="家電",
                current_rank=1,
                previous_rank=None,
                rank_change=100,
                rank_change_percent=100.0,
                price=9800.0,
                currency="JPY",
                review_count=500,
                rating=4.5,
                affiliate_url="https://amazon.co.jp/dp/B001?tag=test",
                timestamp="2026-01-05T10:00:00",
                source="test",
            ),
        ]

    def test_save_to_csv_auto_filename(self, tmp_path: Path, sample_products):
        """ファイル名自動生成テスト"""
        saver = DataSaver(output_dir=tmp_path)
        filepath = saver.save_to_csv(sample_products)

        assert filepath.exists()
        assert filepath.name.startswith("products_")
        assert filepath.name.endswith(".csv")

    def test_save_creates_directory(self, tmp_path: Path, sample_products):
        """ディレクトリが自動作成される"""
        new_dir = tmp_path / "new_data" / "raw"
        saver = DataSaver(output_dir=new_dir)
        filepath = saver.save_to_csv(sample_products, "test.csv")

        assert new_dir.exists()
        assert filepath.exists()


class TestScraperMain:
    """scraper.pyのmain関数テスト"""

    def test_main_function_exists(self):
        """main関数が存在する"""
        from scraper import main

        assert callable(main)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
