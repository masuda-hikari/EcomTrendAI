# -*- coding: utf-8 -*-
"""
reporter.pyモジュールのテスト

HTMLレポート生成機能のテスト
"""

from pathlib import Path
from unittest.mock import MagicMock

import pytest

from reporter import HTMLReportGenerator


class TestHTMLReportGenerator:
    """HTMLReportGeneratorのテスト"""

    @pytest.fixture
    def generator(self, tmp_path):
        """HTMLレポートジェネレータのフィクスチャ"""
        return HTMLReportGenerator(output_dir=tmp_path)

    @pytest.fixture
    def sample_trends(self):
        """サンプルトレンドデータ"""
        trends = []
        for i in range(5):
            trend = MagicMock()
            trend.name = f"商品{i+1}"
            trend.price = 1000.0 * (i + 1)
            trend.rating = 4.0 + (i * 0.2)
            trend.affiliate_url = f"https://amazon.co.jp/dp/B00{i}?tag=test"
            trend.category = "テストカテゴリ"
            trend.rank_change_percent = 50.0 + (i * 10)
            trend.trend_score = 80.0 - (i * 5)
            trends.append(trend)
        return trends

    @pytest.fixture
    def sample_category_trends(self, sample_trends):
        """サンプルカテゴリ別トレンドデータ"""
        return {
            "家電": sample_trends[:3],
            "ゲーム": sample_trends[2:],
        }

    def test_init_creates_output_dir(self, tmp_path):
        """出力ディレクトリが作成される"""
        output_dir = tmp_path / "reports"
        generator = HTMLReportGenerator(output_dir=output_dir)

        assert output_dir.exists()
        assert generator.output_dir == output_dir

    def test_generate_creates_html_file(self, generator, sample_trends, sample_category_trends, tmp_path):
        """HTMLファイルが正常に生成される"""
        filepath = generator.generate(sample_trends, sample_category_trends)

        assert filepath.exists()
        assert filepath.suffix == ".html"
        assert filepath.parent == tmp_path

    def test_generate_html_content(self, generator, sample_trends, sample_category_trends):
        """生成されたHTMLの内容を検証"""
        filepath = generator.generate(sample_trends, sample_category_trends)

        content = filepath.read_text(encoding="utf-8")

        # 基本構造の確認
        assert "<!DOCTYPE html>" in content
        assert "<html lang=\"ja\">" in content
        assert "EcomTrendAI" in content
        assert "トレンドレポート" in content

        # 商品情報の確認
        assert "商品1" in content
        assert "商品2" in content
        assert "amazon.co.jp" in content

        # カテゴリの確認
        assert "家電" in content
        assert "ゲーム" in content

        # スタイルの確認
        assert "<style>" in content
        assert ".card" in content

    def test_generate_empty_trends(self, generator):
        """空のトレンドでも生成可能"""
        filepath = generator.generate([], {})

        assert filepath.exists()
        content = filepath.read_text(encoding="utf-8")
        assert "EcomTrendAI" in content

    def test_generate_with_none_price(self, generator):
        """価格がNoneの商品"""
        trend = MagicMock()
        trend.name = "価格不明商品"
        trend.price = None
        trend.rating = None
        trend.affiliate_url = "https://amazon.co.jp/dp/B001?tag=test"
        trend.category = "テスト"
        trend.rank_change_percent = 50.0
        trend.trend_score = 70.0

        filepath = generator.generate([trend], {})

        content = filepath.read_text(encoding="utf-8")
        assert "価格不明商品" in content
        assert "-" in content  # 価格なしの表示

    def test_generate_long_name_truncated(self, generator):
        """長い商品名が切り詰められる"""
        trend = MagicMock()
        trend.name = "A" * 100  # 長い商品名
        trend.price = 1000.0
        trend.rating = 4.5
        trend.affiliate_url = "https://amazon.co.jp/dp/B001?tag=test"
        trend.category = "テスト"
        trend.rank_change_percent = 50.0
        trend.trend_score = 70.0

        filepath = generator.generate([trend], {})

        content = filepath.read_text(encoding="utf-8")
        # 商品名が50文字以下に切り詰められている
        assert "A" * 50 in content
        assert "A" * 100 not in content

    def test_build_html_returns_string(self, generator, sample_trends, sample_category_trends):
        """_build_htmlがHTML文字列を返す"""
        html = generator._build_html(sample_trends, sample_category_trends)

        assert isinstance(html, str)
        assert "<!DOCTYPE html>" in html
        assert "</html>" in html

    def test_generate_filename_format(self, generator, sample_trends, sample_category_trends):
        """ファイル名が日付フォーマットに従う"""
        filepath = generator.generate(sample_trends, sample_category_trends)

        # trends_YYYYMMDD.html形式を確認
        assert filepath.name.startswith("trends_")
        assert filepath.name.endswith(".html")
        # 日付部分が8桁
        date_part = filepath.name.replace("trends_", "").replace(".html", "")
        assert len(date_part) == 8
        assert date_part.isdigit()

    def test_multiple_categories(self, generator, sample_trends):
        """複数カテゴリの表示"""
        category_trends = {
            "カテゴリA": sample_trends[:2],
            "カテゴリB": sample_trends[2:4],
            "カテゴリC": sample_trends[4:],
        }

        filepath = generator.generate(sample_trends, category_trends)
        content = filepath.read_text(encoding="utf-8")

        assert "カテゴリA" in content
        assert "カテゴリB" in content
        assert "カテゴリC" in content

    def test_html_responsive_styles(self, generator, sample_trends, sample_category_trends):
        """レスポンシブスタイルが含まれる"""
        filepath = generator.generate(sample_trends, sample_category_trends)
        content = filepath.read_text(encoding="utf-8")

        assert "@media" in content
        assert "max-width" in content

    def test_affiliate_links_present(self, generator, sample_trends, sample_category_trends):
        """アフィリエイトリンクが含まれる"""
        filepath = generator.generate(sample_trends, sample_category_trends)
        content = filepath.read_text(encoding="utf-8")

        assert 'target="_blank"' in content
        assert "amazon.co.jp" in content

    def test_footer_disclaimer(self, generator, sample_trends, sample_category_trends):
        """フッターの免責事項が含まれる"""
        filepath = generator.generate(sample_trends, sample_category_trends)
        content = filepath.read_text(encoding="utf-8")

        assert "自動生成" in content
        assert "アフィリエイト" in content


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
