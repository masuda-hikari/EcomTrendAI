# -*- coding: utf-8 -*-
"""
main.pyモジュールのテスト

統合実行スクリプトの機能テスト
"""

import sys
from io import StringIO
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest


class TestRunScraperUnit:
    """run_scraper関数のユニットテスト（関数内インポートのため個別モック）"""

    def test_run_scraper_returns_zero_when_no_products(self):
        """商品が取得できなかった場合は0を返す"""
        from main import run_scraper

        with patch("scraper.AmazonScraper") as mock_scraper_class:
            mock_scraper = MagicMock()
            mock_scraper.fetch_movers_shakers.return_value = []
            mock_scraper_class.return_value = mock_scraper

            with patch("scraper.DataSaver"):
                result = run_scraper(["electronics"], limit=10)

        assert result == 0


class TestRunAnalyzerUnit:
    """run_analyzer関数のユニットテスト"""

    def test_run_analyzer_returns_tuple(self):
        """分析結果がタプルで返される"""
        from main import run_analyzer

        with patch("analyzer.TrendAnalyzer") as mock_analyzer_class:
            mock_analyzer = MagicMock()
            mock_analyzer.analyze_trends.return_value = []
            mock_analyzer.analyze_by_category.return_value = {}
            mock_analyzer.detect_significant_movers.return_value = []
            mock_analyzer_class.return_value = mock_analyzer

            trends, category_trends = run_analyzer()

        assert isinstance(trends, list)
        assert isinstance(category_trends, dict)


class TestRunReporterUnit:
    """run_reporter関数のユニットテスト"""

    def test_run_reporter_returns_paths(self):
        """レポートパスが返される"""
        from main import run_reporter

        with patch("analyzer.ReportGenerator") as mock_md_class:
            with patch("reporter.HTMLReportGenerator") as mock_html_class:
                mock_md = MagicMock()
                mock_md.generate_markdown_report.return_value = Path("/tmp/report.md")
                mock_md_class.return_value = mock_md

                mock_html = MagicMock()
                mock_html.generate.return_value = Path("/tmp/report.html")
                mock_html_class.return_value = mock_html

                reports, md_path, html_path = run_reporter([], {})

        assert len(reports) == 2


class TestRunDistributorUnit:
    """run_distributor関数のユニットテスト"""

    def test_run_distributor_returns_empty_when_no_distributors(self):
        """配信先が設定されていない場合は空辞書を返す"""
        from main import run_distributor

        with patch("distributor.ReportDistributor") as mock_dist_class:
            mock_dist = MagicMock()
            mock_dist.distributors = []
            mock_dist_class.return_value = mock_dist

            result = run_distributor([])

        assert result == {}


class TestMain:
    """main関数のテスト"""

    def test_main_full_workflow(self):
        """完全なワークフロー実行"""
        from main import main

        with patch("main.argparse.ArgumentParser.parse_args") as mock_args:
            with patch("main.run_scraper") as mock_scraper:
                with patch("main.run_analyzer") as mock_analyzer:
                    with patch("main.run_reporter") as mock_reporter:
                        with patch("main.run_distributor"):
                            # args設定
                            mock_args.return_value = MagicMock(
                                categories=["electronics"],
                                limit=10,
                                skip_scrape=False,
                                distribute=False,
                                skip_distribute=True,
                            )

                            # モック設定
                            mock_scraper.return_value = 5

                            mock_trend = MagicMock()
                            mock_trend.name = "テスト商品"
                            mock_trend.rank_change_percent = 50.0
                            mock_analyzer.return_value = ([mock_trend], {"electronics": [mock_trend]})

                            mock_reporter.return_value = (
                                [Path("/tmp/report.md")],
                                Path("/tmp/report.md"),
                                Path("/tmp/report.html"),
                            )

                            # 標準出力をキャプチャ
                            captured_output = StringIO()
                            sys.stdout = captured_output

                            try:
                                result = main()
                            finally:
                                sys.stdout = sys.__stdout__

                            assert result == 0
                            mock_scraper.assert_called_once()
                            mock_analyzer.assert_called_once()
                            mock_reporter.assert_called_once()

    def test_main_skip_scrape(self):
        """スクレイピングをスキップ"""
        from main import main

        with patch("main.argparse.ArgumentParser.parse_args") as mock_args:
            with patch("main.run_scraper") as mock_scraper:
                with patch("main.run_analyzer") as mock_analyzer:
                    mock_args.return_value = MagicMock(
                        categories=["electronics"],
                        limit=10,
                        skip_scrape=True,
                        distribute=False,
                        skip_distribute=True,
                    )

                    mock_analyzer.return_value = ([], {})

                    result = main()

                    assert result == 1  # データなしで失敗
                    mock_scraper.assert_not_called()

    def test_main_scraper_failure(self):
        """スクレイピング失敗"""
        from main import main

        with patch("main.argparse.ArgumentParser.parse_args") as mock_args:
            with patch("main.run_scraper") as mock_scraper:
                mock_args.return_value = MagicMock(
                    categories=["electronics"],
                    limit=10,
                    skip_scrape=False,
                    distribute=False,
                    skip_distribute=True,
                )

                mock_scraper.return_value = 0

                result = main()

                assert result == 1

    def test_main_analyzer_failure(self):
        """分析データなし"""
        from main import main

        with patch("main.argparse.ArgumentParser.parse_args") as mock_args:
            with patch("main.run_analyzer") as mock_analyzer:
                with patch("main.run_reporter") as mock_reporter:
                    mock_args.return_value = MagicMock(
                        categories=["electronics"],
                        limit=10,
                        skip_scrape=True,
                        distribute=False,
                        skip_distribute=True,
                    )

                    mock_analyzer.return_value = ([], {})

                    result = main()

                    assert result == 1
                    mock_reporter.assert_not_called()

    def test_main_with_distribution(self):
        """配信あり"""
        from main import main

        with patch("main.argparse.ArgumentParser.parse_args") as mock_args:
            with patch("main.run_scraper") as mock_scraper:
                with patch("main.run_analyzer") as mock_analyzer:
                    with patch("main.run_reporter") as mock_reporter:
                        with patch("main.run_distributor") as mock_distributor:
                            mock_args.return_value = MagicMock(
                                categories=["electronics"],
                                limit=10,
                                skip_scrape=False,
                                distribute=True,
                                skip_distribute=False,
                            )

                            mock_scraper.return_value = 5
                            mock_trend = MagicMock()
                            mock_trend.name = "テスト商品"
                            mock_trend.rank_change_percent = 50.0
                            mock_analyzer.return_value = ([mock_trend], {})
                            mock_reporter.return_value = ([Path("/tmp/report.md")], Path("/tmp/report.md"), None)
                            mock_distributor.return_value = {"email": True}

                            captured_output = StringIO()
                            sys.stdout = captured_output

                            try:
                                result = main()
                            finally:
                                sys.stdout = sys.__stdout__

                            assert result == 0
                            mock_distributor.assert_called_once()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
