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


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
