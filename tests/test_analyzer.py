# -*- coding: utf-8 -*-
"""
トレンド分析モジュールのテスト
"""

from pathlib import Path

import pandas as pd
import pytest

from analyzer import TrendAnalyzer, TrendItem


class TestTrendAnalyzer:
    """TrendAnalyzerのテスト"""

    @pytest.fixture
    def sample_data(self, tmp_path: Path) -> Path:
        """テスト用サンプルデータを作成"""
        data_dir = tmp_path / "data" / "raw"
        data_dir.mkdir(parents=True)

        csv_content = """asin,name,category,current_rank,previous_rank,rank_change,rank_change_percent,price,currency,review_count,rating,affiliate_url,timestamp,source
B001,テスト商品A,家電,1,,100,100.0,12980,JPY,500,4.5,https://amazon.co.jp/dp/B001?tag=test,2026-01-05T10:00:00,amazon_movers_shakers
B002,テスト商品B,家電,2,,80,80.0,9800,JPY,1200,4.2,https://amazon.co.jp/dp/B002?tag=test,2026-01-05T10:00:00,amazon_movers_shakers
B003,テスト商品C,ゲーム,3,,150,150.0,5980,JPY,300,4.8,https://amazon.co.jp/dp/B003?tag=test,2026-01-05T10:00:00,amazon_movers_shakers
B004,テスト商品D,ゲーム,4,,30,30.0,3980,JPY,50,3.9,https://amazon.co.jp/dp/B004?tag=test,2026-01-05T10:00:00,amazon_movers_shakers
B005,テスト商品E,パソコン,5,,200,200.0,29800,JPY,2000,4.6,https://amazon.co.jp/dp/B005?tag=test,2026-01-05T10:00:00,amazon_movers_shakers
"""
        csv_path = data_dir / "products_20260105_100000.csv"
        csv_path.write_text(csv_content, encoding="utf-8-sig")

        return data_dir

    def test_load_latest_data(self, sample_data: Path):
        """最新データ読み込みテスト"""
        analyzer = TrendAnalyzer(data_dir=sample_data)
        df = analyzer.load_latest_data()

        assert df is not None
        assert len(df) == 5
        assert "asin" in df.columns
        assert "trend_score" not in df.columns  # まだ計算されていない

    def test_calculate_trend_score(self, sample_data: Path):
        """トレンドスコア計算テスト"""
        analyzer = TrendAnalyzer(data_dir=sample_data)

        # 高スコアケース: 高ランク変動 + 多レビュー + 高評価
        row1 = pd.Series({
            "rank_change_percent": 100,
            "review_count": 1000,
            "rating": 4.5,
        })
        score1 = analyzer.calculate_trend_score(row1)
        assert score1 > 0

        # 低スコアケース
        row2 = pd.Series({
            "rank_change_percent": 10,
            "review_count": 10,
            "rating": 3.5,
        })
        score2 = analyzer.calculate_trend_score(row2)

        # 高スコアの方が大きい
        assert score1 > score2

    def test_analyze_trends(self, sample_data: Path):
        """トレンド分析テスト"""
        analyzer = TrendAnalyzer(data_dir=sample_data)
        trends = analyzer.analyze_trends(top_n=3)

        assert len(trends) == 3
        assert all(isinstance(t, TrendItem) for t in trends)

        # スコア降順になっている
        scores = [t.trend_score for t in trends]
        assert scores == sorted(scores, reverse=True)

    def test_analyze_by_category(self, sample_data: Path):
        """カテゴリ別分析テスト"""
        analyzer = TrendAnalyzer(data_dir=sample_data)
        category_trends = analyzer.analyze_by_category()

        assert "家電" in category_trends
        assert "ゲーム" in category_trends
        assert len(category_trends["家電"]) == 2
        assert len(category_trends["ゲーム"]) == 2

    def test_detect_significant_movers(self, sample_data: Path):
        """大幅変動検出テスト"""
        analyzer = TrendAnalyzer(data_dir=sample_data)

        # 閾値100%以上
        significant = analyzer.detect_significant_movers(threshold=100.0)
        assert len(significant) >= 2  # B001(100%), B003(150%), B005(200%)

        # 閾値200%以上
        significant_high = analyzer.detect_significant_movers(threshold=200.0)
        assert len(significant_high) >= 1  # B005(200%)

    def test_empty_data(self, tmp_path: Path):
        """空データの場合のテスト"""
        empty_dir = tmp_path / "empty"
        empty_dir.mkdir()

        analyzer = TrendAnalyzer(data_dir=empty_dir)
        df = analyzer.load_latest_data()

        assert df is None

        trends = analyzer.analyze_trends()
        assert trends == []


class TestTrendItem:
    """TrendItemのテスト"""

    def test_trend_item_creation(self):
        """TrendItem生成テスト"""
        item = TrendItem(
            asin="B001",
            name="テスト商品",
            category="家電",
            rank_change_percent=50.0,
            current_rank=10,
            price=9800.0,
            review_count=100,
            rating=4.5,
            affiliate_url="https://amazon.co.jp/dp/B001?tag=test",
            trend_score=75.5,
        )

        assert item.asin == "B001"
        assert item.rank_change_percent == 50.0
        assert item.trend_score == 75.5


class TestReportGenerator:
    """ReportGeneratorのテスト"""

    @pytest.fixture
    def generator(self, tmp_path: Path):
        """ReportGeneratorのフィクスチャ"""
        from analyzer import ReportGenerator
        return ReportGenerator(output_dir=tmp_path)

    @pytest.fixture
    def sample_trends(self) -> list[TrendItem]:
        """サンプルトレンドデータ"""
        return [
            TrendItem(
                asin=f"B00{i}",
                name=f"テスト商品{i}",
                category="家電",
                rank_change_percent=100.0 - (i * 10),
                current_rank=i,
                price=10000.0 - (i * 1000),
                review_count=500 - (i * 50),
                rating=4.5 - (i * 0.1),
                affiliate_url=f"https://amazon.co.jp/dp/B00{i}?tag=test",
                trend_score=80.0 - (i * 5),
            )
            for i in range(12)
        ]

    @pytest.fixture
    def sample_category_trends(self, sample_trends) -> dict[str, list[TrendItem]]:
        """サンプルカテゴリ別トレンドデータ"""
        return {
            "家電": sample_trends[:4],
            "ゲーム": sample_trends[4:8],
            "パソコン": sample_trends[8:],
        }

    def test_init_creates_output_dir(self, tmp_path: Path):
        """出力ディレクトリが作成される"""
        from analyzer import ReportGenerator
        output_dir = tmp_path / "reports"
        generator = ReportGenerator(output_dir=output_dir)

        assert output_dir.exists()
        assert generator.output_dir == output_dir

    def test_generate_markdown_report(self, generator, sample_trends, sample_category_trends, tmp_path):
        """Markdownレポートが生成される"""
        filepath = generator.generate_markdown_report(sample_trends, sample_category_trends)

        assert filepath.exists()
        assert filepath.suffix == ".md"
        assert filepath.parent == tmp_path

    def test_markdown_content(self, generator, sample_trends, sample_category_trends):
        """Markdownの内容を検証"""
        filepath = generator.generate_markdown_report(sample_trends, sample_category_trends)
        content = filepath.read_text(encoding="utf-8")

        # 基本構造
        assert "# EcomTrendAI トレンドレポート" in content
        assert "## 急上昇商品 TOP 10" in content
        assert "## カテゴリ別トレンド" in content

        # 商品情報（最初の10件のみ）
        assert "テスト商品0" in content
        assert "テスト商品9" in content

        # カテゴリセクション
        assert "### 家電" in content
        assert "### ゲーム" in content
        assert "### パソコン" in content

        # フッター
        assert "自動生成" in content
        assert "アフィリエイト" in content

    def test_markdown_with_none_values(self, generator):
        """価格や評価がNoneの場合"""
        trend = TrendItem(
            asin="B999",
            name="価格不明商品",
            category="テスト",
            rank_change_percent=50.0,
            current_rank=1,
            price=None,
            review_count=None,
            rating=None,
            affiliate_url="https://amazon.co.jp/dp/B999?tag=test",
            trend_score=50.0,
        )

        filepath = generator.generate_markdown_report([trend], {})
        content = filepath.read_text(encoding="utf-8")

        assert "価格不明商品" in content
        assert "価格不明" in content

    def test_markdown_empty_trends(self, generator):
        """空のトレンドリスト"""
        filepath = generator.generate_markdown_report([], {})
        content = filepath.read_text(encoding="utf-8")

        assert "# EcomTrendAI トレンドレポート" in content
        assert "## 急上昇商品 TOP 10" in content

    def test_markdown_no_category_trends(self, generator, sample_trends):
        """カテゴリ別トレンドなし"""
        filepath = generator.generate_markdown_report(sample_trends, {})
        content = filepath.read_text(encoding="utf-8")

        # カテゴリセクションが追加されない
        assert "## カテゴリ別トレンド" not in content

    def test_print_console_report(self, generator, sample_trends, capsys):
        """コンソールレポート出力"""
        generator.print_console_report(sample_trends)

        captured = capsys.readouterr()
        assert "EcomTrendAI トレンドレポート" in captured.out
        assert "急上昇商品 TOP 10" in captured.out
        assert "テスト商品0" in captured.out

    def test_print_console_report_empty(self, generator, capsys):
        """空リストでのコンソール出力"""
        generator.print_console_report([])

        captured = capsys.readouterr()
        assert "EcomTrendAI トレンドレポート" in captured.out

    def test_print_console_long_name_truncated(self, generator, capsys):
        """長い商品名が切り詰められる"""
        trend = TrendItem(
            asin="B999",
            name="A" * 100,  # 長い商品名
            category="テスト",
            rank_change_percent=50.0,
            current_rank=1,
            price=10000.0,
            review_count=100,
            rating=4.5,
            affiliate_url="https://test.com",
            trend_score=50.0,
        )

        generator.print_console_report([trend])

        captured = capsys.readouterr()
        # 35文字 + "..." に切り詰められる
        assert "A" * 35 + "..." in captured.out
        assert "A" * 100 not in captured.out


class TestLoadHistoricalData:
    """load_historical_dataのテスト"""

    @pytest.fixture
    def historical_data(self, tmp_path: Path) -> Path:
        """過去データを複数作成"""
        data_dir = tmp_path / "data" / "raw"
        data_dir.mkdir(parents=True)

        csv_content = """asin,name,category,current_rank,previous_rank,rank_change,rank_change_percent,price,currency,review_count,rating,affiliate_url,timestamp,source
B001,商品A,家電,1,,100,100.0,10000,JPY,500,4.5,https://test.com,2026-01-01T10:00:00,test
"""
        # 複数日分のファイルを作成
        for i in range(5):
            date = f"2026010{i+1}"
            csv_path = data_dir / f"products_{date}_100000.csv"
            csv_path.write_text(csv_content, encoding="utf-8-sig")

        return data_dir

    def test_load_historical_data_all_days(self, historical_data: Path):
        """全日分のデータを読み込み"""
        analyzer = TrendAnalyzer(data_dir=historical_data)
        df = analyzer.load_historical_data(days=7)

        assert df is not None
        # 5ファイル × 1レコード = 5レコード
        assert len(df) == 5

    def test_load_historical_data_limited_days(self, historical_data: Path):
        """指定日数分のみ読み込み"""
        analyzer = TrendAnalyzer(data_dir=historical_data)
        df = analyzer.load_historical_data(days=3)

        assert df is not None
        # 最新3ファイル × 1レコード = 3レコード
        assert len(df) == 3

    def test_load_historical_data_empty(self, tmp_path: Path):
        """空ディレクトリの場合"""
        empty_dir = tmp_path / "empty"
        empty_dir.mkdir()

        analyzer = TrendAnalyzer(data_dir=empty_dir)
        df = analyzer.load_historical_data(days=7)

        assert df is None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
