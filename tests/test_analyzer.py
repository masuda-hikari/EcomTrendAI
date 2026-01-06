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


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
