# -*- coding: utf-8 -*-
"""
トレンド分析モジュール

収集したデータからトレンドを検出・分析
"""

import math
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional

import pandas as pd
from loguru import logger

from config import config


@dataclass
class TrendItem:
    """トレンド分析結果"""
    asin: str
    name: str
    category: str
    rank_change_percent: float
    current_rank: int
    price: Optional[float]
    review_count: Optional[int]
    rating: Optional[float]
    affiliate_url: str
    trend_score: float  # 総合トレンドスコア


class TrendAnalyzer:
    """トレンド分析エンジン"""

    def __init__(self, data_dir: Optional[Path] = None):
        self.data_dir = data_dir or config.paths.raw_data_dir

    def load_latest_data(self) -> Optional[pd.DataFrame]:
        """
        最新のデータファイルを読み込み

        Returns:
            DataFrameまたはNone
        """
        csv_files = list(self.data_dir.glob("products_*.csv"))
        if not csv_files:
            logger.warning("データファイルが見つかりません")
            return None

        latest_file = max(csv_files, key=lambda f: f.stat().st_mtime)
        logger.info(f"データ読み込み: {latest_file}")

        df = pd.read_csv(latest_file, encoding="utf-8-sig")
        return df

    def load_historical_data(self, days: int = 7) -> Optional[pd.DataFrame]:
        """
        過去N日分のデータを読み込み

        Args:
            days: 遡る日数

        Returns:
            結合されたDataFrame
        """
        csv_files = sorted(self.data_dir.glob("products_*.csv"))
        if not csv_files:
            return None

        # 最新N件を取得（日次実行想定）
        recent_files = csv_files[-days:] if len(csv_files) >= days else csv_files

        dfs = []
        for f in recent_files:
            df = pd.read_csv(f, encoding="utf-8-sig")
            dfs.append(df)

        return pd.concat(dfs, ignore_index=True) if dfs else None

    def calculate_trend_score(self, row: pd.Series) -> float:
        """
        トレンドスコアを計算

        重み付け:
        - ランク変動率: 50%
        - レビュー数: 30%
        - 評価: 20%
        """
        score = 0.0

        # ランク変動（正規化: 0-100%を0-50ポイントに）
        rank_change = row.get("rank_change_percent", 0) or 0
        score += min(rank_change / 2, 50)  # 最大50ポイント

        # レビュー数（対数スケール）
        review_count = row.get("review_count", 0) or 0
        if review_count > 0:
            score += min(math.log10(review_count) * 10, 30)  # 最大30ポイント

        # 評価（4.0以上で加点）
        rating = row.get("rating", 0) or 0
        if rating >= 4.0:
            score += (rating - 4.0) * 20  # 4.5なら+10, 5.0なら+20

        return round(score, 2)

    def analyze_trends(self, top_n: int = 20) -> list[TrendItem]:
        """
        トレンド分析を実行

        Args:
            top_n: 上位N件を返す

        Returns:
            トレンドアイテムリスト
        """
        df = self.load_latest_data()
        if df is None or df.empty:
            logger.warning("分析対象データがありません")
            return []

        # トレンドスコア計算
        df["trend_score"] = df.apply(self.calculate_trend_score, axis=1)

        # スコア順にソート
        df_sorted = df.sort_values("trend_score", ascending=False).head(top_n)

        # TrendItemリストに変換
        trends = []
        for _, row in df_sorted.iterrows():
            trend = TrendItem(
                asin=row["asin"],
                name=row["name"],
                category=row["category"],
                rank_change_percent=row.get("rank_change_percent", 0) or 0,
                current_rank=row["current_rank"],
                price=row.get("price"),
                review_count=row.get("review_count"),
                rating=row.get("rating"),
                affiliate_url=row["affiliate_url"],
                trend_score=row["trend_score"],
            )
            trends.append(trend)

        logger.info(f"トレンド分析完了: {len(trends)}件")
        return trends

    def analyze_by_category(self) -> dict[str, list[TrendItem]]:
        """
        カテゴリ別トレンド分析

        Returns:
            カテゴリ名 -> トレンドリストの辞書
        """
        df = self.load_latest_data()
        if df is None or df.empty:
            return {}

        df["trend_score"] = df.apply(self.calculate_trend_score, axis=1)

        result = {}
        for category in df["category"].unique():
            category_df = df[df["category"] == category]
            category_df = category_df.sort_values("trend_score", ascending=False).head(10)

            trends = []
            for _, row in category_df.iterrows():
                trend = TrendItem(
                    asin=row["asin"],
                    name=row["name"],
                    category=row["category"],
                    rank_change_percent=row.get("rank_change_percent", 0) or 0,
                    current_rank=row["current_rank"],
                    price=row.get("price"),
                    review_count=row.get("review_count"),
                    rating=row.get("rating"),
                    affiliate_url=row["affiliate_url"],
                    trend_score=row["trend_score"],
                )
                trends.append(trend)

            result[category] = trends

        return result

    def detect_significant_movers(self, threshold: float = 50.0) -> list[TrendItem]:
        """
        大幅変動商品を検出

        Args:
            threshold: ランク変動率の閾値（%）

        Returns:
            閾値を超える変動があった商品リスト
        """
        trends = self.analyze_trends(top_n=100)
        return [t for t in trends if t.rank_change_percent >= threshold]


class ReportGenerator:
    """レポート生成クラス"""

    def __init__(self, output_dir: Optional[Path] = None):
        self.output_dir = output_dir or config.paths.reports_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate_markdown_report(
        self, trends: list[TrendItem], category_trends: dict[str, list[TrendItem]]
    ) -> Path:
        """
        Markdownレポートを生成

        Args:
            trends: 全体トレンド
            category_trends: カテゴリ別トレンド

        Returns:
            レポートファイルパス
        """
        date_str = datetime.now().strftime("%Y%m%d")
        filename = f"trends_{date_str}.md"
        filepath = self.output_dir / filename

        lines = [
            f"# EcomTrendAI トレンドレポート",
            f"",
            f"**生成日時**: {datetime.now().strftime('%Y年%m月%d日 %H:%M')}",
            f"",
            f"---",
            f"",
            f"## 急上昇商品 TOP 10",
            f"",
        ]

        for i, trend in enumerate(trends[:10], 1):
            price_str = f"¥{trend.price:,.0f}" if trend.price else "価格不明"
            rating_str = f"★{trend.rating:.1f}" if trend.rating else ""
            lines.append(
                f"{i}. **[{trend.name[:40]}]({trend.affiliate_url})**  "
            )
            lines.append(
                f"   - ランク変動: +{trend.rank_change_percent:.0f}% | "
                f"スコア: {trend.trend_score} | {price_str} {rating_str}"
            )
            lines.append(f"   - カテゴリ: {trend.category}")
            lines.append("")

        # カテゴリ別セクション
        if category_trends:
            lines.append("---")
            lines.append("")
            lines.append("## カテゴリ別トレンド")
            lines.append("")

            for category, items in category_trends.items():
                lines.append(f"### {category}")
                lines.append("")
                for i, trend in enumerate(items[:5], 1):
                    lines.append(
                        f"{i}. [{trend.name[:30]}...]({trend.affiliate_url}) "
                        f"(+{trend.rank_change_percent:.0f}%)"
                    )
                lines.append("")

        # フッター
        lines.extend([
            "---",
            "",
            "*このレポートは EcomTrendAI によって自動生成されました。*",
            "",
            "*商品リンクにはアフィリエイトIDが含まれています。*",
        ])

        with open(filepath, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))

        logger.info(f"レポート生成完了: {filepath}")
        return filepath

    def print_console_report(self, trends: list[TrendItem]) -> None:
        """コンソールにレポートを出力"""
        print("\n" + "=" * 60)
        print("  EcomTrendAI トレンドレポート")
        print(f"  {datetime.now().strftime('%Y年%m月%d日 %H:%M')}")
        print("=" * 60 + "\n")

        print("【急上昇商品 TOP 10】\n")
        for i, trend in enumerate(trends[:10], 1):
            name_display = trend.name[:35] + "..." if len(trend.name) > 35 else trend.name
            price_str = f"¥{trend.price:,.0f}" if trend.price else ""
            print(f"{i:2}. {name_display}")
            print(f"    +{trend.rank_change_percent:.0f}% | スコア: {trend.trend_score} | {price_str}")
            print(f"    カテゴリ: {trend.category}")
            print()

        print("=" * 60)
        print("詳細レポート: reports/trends_YYYYMMDD.md")
        print("=" * 60 + "\n")


def main():
    """メイン実行"""
    logger.info("=== EcomTrendAI トレンド分析開始 ===")

    analyzer = TrendAnalyzer()
    reporter = ReportGenerator()

    # 全体トレンド分析
    trends = analyzer.analyze_trends(top_n=20)

    if not trends:
        logger.warning("分析対象のデータがありません。先にscraper.pyを実行してください。")
        return

    # カテゴリ別分析
    category_trends = analyzer.analyze_by_category()

    # 大幅変動検出
    significant = analyzer.detect_significant_movers(threshold=80.0)
    if significant:
        logger.info(f"大幅変動商品を {len(significant)} 件検出")

    # レポート生成
    report_path = reporter.generate_markdown_report(trends, category_trends)
    reporter.print_console_report(trends)

    logger.info(f"レポート保存先: {report_path}")
    logger.info("=== トレンド分析完了 ===")


if __name__ == "__main__":
    main()
