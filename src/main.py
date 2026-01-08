# -*- coding: utf-8 -*-
"""
EcomTrendAI 統合実行スクリプト

データ収集 → トレンド分析 → レポート生成 を一括実行
日次自動実行用のエントリポイント
"""

import argparse
import sys
import time
from datetime import datetime
from pathlib import Path

from loguru import logger

# ログ設定
log_dir = Path(__file__).parent.parent / "logs"
log_dir.mkdir(exist_ok=True)
log_file = log_dir / f"ecomtrend_{datetime.now().strftime('%Y%m%d')}.log"

logger.remove()  # デフォルトハンドラ削除
logger.add(sys.stderr, level="INFO", format="{time:HH:mm:ss} | {level} | {message}")
logger.add(log_file, level="DEBUG", rotation="10 MB", encoding="utf-8")


def run_scraper(categories: list[str], limit: int) -> int:
    """
    データ収集を実行

    Args:
        categories: 収集対象カテゴリ
        limit: カテゴリあたりの取得件数

    Returns:
        収集した商品数
    """
    from scraper import AmazonScraper, DataSaver

    logger.info("=== データ収集開始 ===")
    scraper = AmazonScraper()
    saver = DataSaver()

    all_products = []

    for category in categories:
        logger.info(f"カテゴリ: {category}")
        products = scraper.fetch_movers_shakers(category, limit=limit)
        all_products.extend(products)
        time.sleep(3)  # カテゴリ間の待機

    if all_products:
        filepath = saver.save_to_csv(all_products)
        logger.info(f"データ保存完了: {filepath} ({len(all_products)}件)")
    else:
        logger.warning("データを収集できませんでした")

    return len(all_products)


def run_analyzer() -> tuple[list, dict]:
    """
    トレンド分析を実行

    Returns:
        (全体トレンド, カテゴリ別トレンド)
    """
    from analyzer import TrendAnalyzer

    logger.info("=== トレンド分析開始 ===")
    analyzer = TrendAnalyzer()

    trends = analyzer.analyze_trends(top_n=20)
    category_trends = analyzer.analyze_by_category()

    significant = analyzer.detect_significant_movers(threshold=80.0)
    if significant:
        logger.info(f"大幅変動商品: {len(significant)}件")

    logger.info(f"トレンド分析完了: {len(trends)}件")
    return trends, category_trends


def run_reporter(trends: list, category_trends: dict) -> list[Path]:
    """
    レポート生成を実行

    Args:
        trends: 全体トレンド
        category_trends: カテゴリ別トレンド

    Returns:
        生成されたレポートファイルパス
    """
    from analyzer import ReportGenerator
    from reporter import HTMLReportGenerator

    logger.info("=== レポート生成開始 ===")
    reports = []

    # Markdownレポート
    md_reporter = ReportGenerator()
    md_path = md_reporter.generate_markdown_report(trends, category_trends)
    reports.append(md_path)

    # HTMLレポート
    html_reporter = HTMLReportGenerator()
    html_path = html_reporter.generate(trends, category_trends)
    reports.append(html_path)

    logger.info(f"レポート生成完了: {len(reports)}件")
    return reports


def main():
    """メインエントリポイント"""
    parser = argparse.ArgumentParser(description="EcomTrendAI 統合実行")
    parser.add_argument(
        "--categories",
        nargs="+",
        default=["electronics", "computers", "videogames", "toys"],
        help="収集対象カテゴリ（デフォルト: electronics computers videogames toys）",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=20,
        help="カテゴリあたりの取得件数（デフォルト: 20）",
    )
    parser.add_argument(
        "--skip-scrape",
        action="store_true",
        help="データ収集をスキップ（既存データで分析のみ）",
    )

    args = parser.parse_args()

    start_time = datetime.now()
    logger.info("=" * 60)
    logger.info(f"EcomTrendAI 日次実行開始: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 60)

    try:
        # Step 1: データ収集
        product_count = 0
        if not args.skip_scrape:
            product_count = run_scraper(args.categories, args.limit)
            if product_count == 0:
                logger.error("データ収集失敗。処理を中止します。")
                return 1
        else:
            logger.info("データ収集をスキップ（--skip-scrape）")

        # Step 2: トレンド分析
        trends, category_trends = run_analyzer()
        if not trends:
            logger.error("分析対象データがありません。")
            return 1

        # Step 3: レポート生成
        reports = run_reporter(trends, category_trends)

        # 完了サマリー
        elapsed = (datetime.now() - start_time).total_seconds()
        logger.info("=" * 60)
        logger.info("実行完了サマリー")
        logger.info(f"  収集商品数: {product_count}")
        logger.info(f"  トレンド件数: {len(trends)}")
        logger.info(f"  生成レポート: {len(reports)}件")
        logger.info(f"  実行時間: {elapsed:.1f}秒")
        logger.info("=" * 60)

        # コンソール出力（簡易）
        print("\n【本日のトップ5】")
        for i, t in enumerate(trends[:5], 1):
            print(f"{i}. {t.name[:40]}... (+{t.rank_change_percent:.0f}%)")
        print(f"\n詳細レポート: {reports[0] if reports else 'なし'}")

        return 0

    except Exception as e:
        logger.exception(f"実行エラー: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
