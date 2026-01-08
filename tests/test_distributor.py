# -*- coding: utf-8 -*-
"""
レポート配信モジュールのテスト
"""

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from distributor import (
    DiscordDistributor,
    DistributionConfig,
    EmailDistributor,
    ReportDistributor,
    SlackDistributor,
    create_summary_for_notification,
)


class TestDistributionConfig:
    """DistributionConfigのテスト"""

    def test_from_env_defaults(self):
        """デフォルト値のテスト"""
        with patch.dict("os.environ", {}, clear=True):
            config = DistributionConfig.from_env()

            assert config.smtp_host == "smtp.gmail.com"
            assert config.smtp_port == 587
            assert config.smtp_use_tls is True
            assert config.email_to == []

    def test_from_env_with_values(self):
        """環境変数からの読み込みテスト"""
        env_vars = {
            "SMTP_HOST": "smtp.test.com",
            "SMTP_PORT": "465",
            "SMTP_USER": "test@test.com",
            "SMTP_PASSWORD": "secret",
            "SMTP_USE_TLS": "false",
            "EMAIL_FROM": "from@test.com",
            "EMAIL_TO": "to1@test.com, to2@test.com",
            "SLACK_WEBHOOK_URL": "https://hooks.slack.com/test",
            "DISCORD_WEBHOOK_URL": "https://discord.com/test",
        }

        with patch.dict("os.environ", env_vars, clear=True):
            config = DistributionConfig.from_env()

            assert config.smtp_host == "smtp.test.com"
            assert config.smtp_port == 465
            assert config.smtp_user == "test@test.com"
            assert config.smtp_use_tls is False
            assert config.email_to == ["to1@test.com", "to2@test.com"]
            assert config.slack_webhook_url == "https://hooks.slack.com/test"
            assert config.discord_webhook_url == "https://discord.com/test"

    def test_is_email_configured(self):
        """Email設定チェックテスト"""
        # 設定あり
        config_full = DistributionConfig(
            smtp_host="smtp.test.com",
            smtp_port=587,
            smtp_user="user@test.com",
            smtp_password="pass",
            smtp_use_tls=True,
            email_from="from@test.com",
            email_to=["to@test.com"],
            slack_webhook_url="",
            discord_webhook_url="",
        )
        assert config_full.is_email_configured() is True

        # 設定なし
        config_empty = DistributionConfig(
            smtp_host="",
            smtp_port=587,
            smtp_user="",
            smtp_password="",
            smtp_use_tls=True,
            email_from="",
            email_to=[],
            slack_webhook_url="",
            discord_webhook_url="",
        )
        assert config_empty.is_email_configured() is False

    def test_is_slack_configured(self):
        """Slack設定チェックテスト"""
        config = DistributionConfig(
            smtp_host="",
            smtp_port=587,
            smtp_user="",
            smtp_password="",
            smtp_use_tls=True,
            email_from="",
            email_to=[],
            slack_webhook_url="https://hooks.slack.com/test",
            discord_webhook_url="",
        )
        assert config.is_slack_configured() is True
        assert config.is_discord_configured() is False


class TestEmailDistributor:
    """EmailDistributorのテスト"""

    def test_send_not_configured(self):
        """未設定時のテスト"""
        config = DistributionConfig(
            smtp_host="",
            smtp_port=587,
            smtp_user="",
            smtp_password="",
            smtp_use_tls=True,
            email_from="",
            email_to=[],
            slack_webhook_url="",
            discord_webhook_url="",
        )
        distributor = EmailDistributor(config)

        result = distributor.send("Test Subject", "Test Content")
        assert result is False

    @patch("distributor.smtplib.SMTP")
    def test_send_success(self, mock_smtp):
        """送信成功テスト"""
        config = DistributionConfig(
            smtp_host="smtp.test.com",
            smtp_port=587,
            smtp_user="user@test.com",
            smtp_password="pass",
            smtp_use_tls=True,
            email_from="from@test.com",
            email_to=["to@test.com"],
            slack_webhook_url="",
            discord_webhook_url="",
        )
        distributor = EmailDistributor(config)

        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server

        result = distributor.send("Test Subject", "Test Content", "<p>HTML</p>")

        assert result is True
        mock_server.starttls.assert_called_once()
        mock_server.login.assert_called_once_with("user@test.com", "pass")
        mock_server.sendmail.assert_called_once()


class TestSlackDistributor:
    """SlackDistributorのテスト"""

    def test_send_not_configured(self):
        """未設定時のテスト"""
        config = DistributionConfig(
            smtp_host="",
            smtp_port=587,
            smtp_user="",
            smtp_password="",
            smtp_use_tls=True,
            email_from="",
            email_to=[],
            slack_webhook_url="",
            discord_webhook_url="",
        )
        distributor = SlackDistributor(config)

        result = distributor.send("Test Subject", "Test Content")
        assert result is False

    @patch("distributor.requests.post")
    def test_send_success(self, mock_post):
        """送信成功テスト"""
        config = DistributionConfig(
            smtp_host="",
            smtp_port=587,
            smtp_user="",
            smtp_password="",
            smtp_use_tls=True,
            email_from="",
            email_to=[],
            slack_webhook_url="https://hooks.slack.com/test",
            discord_webhook_url="",
        )
        distributor = SlackDistributor(config)

        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_post.return_value = mock_response

        result = distributor.send("Test Subject", "Test Content")

        assert result is True
        mock_post.assert_called_once()


class TestDiscordDistributor:
    """DiscordDistributorのテスト"""

    @patch("distributor.requests.post")
    def test_send_success(self, mock_post):
        """送信成功テスト"""
        config = DistributionConfig(
            smtp_host="",
            smtp_port=587,
            smtp_user="",
            smtp_password="",
            smtp_use_tls=True,
            email_from="",
            email_to=[],
            slack_webhook_url="",
            discord_webhook_url="https://discord.com/test",
        )
        distributor = DiscordDistributor(config)

        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_post.return_value = mock_response

        result = distributor.send("Test Subject", "Test Content")

        assert result is True
        mock_post.assert_called_once()


class TestReportDistributor:
    """ReportDistributorのテスト"""

    def test_no_distributors_configured(self):
        """配信先未設定時のテスト"""
        config = DistributionConfig(
            smtp_host="",
            smtp_port=587,
            smtp_user="",
            smtp_password="",
            smtp_use_tls=True,
            email_from="",
            email_to=[],
            slack_webhook_url="",
            discord_webhook_url="",
        )
        manager = ReportDistributor(config)

        results = manager.distribute("Test", "Content")
        assert results == {}

    def test_distribute_from_files(self, tmp_path: Path):
        """ファイルから配信テスト"""
        # テストファイル作成
        md_path = tmp_path / "test_report.md"
        md_path.write_text("# Test Report\nContent here.", encoding="utf-8")

        config = DistributionConfig(
            smtp_host="",
            smtp_port=587,
            smtp_user="",
            smtp_password="",
            smtp_use_tls=True,
            email_from="",
            email_to=[],
            slack_webhook_url="",
            discord_webhook_url="",
        )
        manager = ReportDistributor(config)

        # 配信先なしでもエラーにならない
        results = manager.distribute_from_files(md_path)
        assert results == {}

    def test_distribute_file_not_found(self, tmp_path: Path):
        """ファイル不存在時のテスト"""
        config = DistributionConfig(
            smtp_host="",
            smtp_port=587,
            smtp_user="",
            smtp_password="",
            smtp_use_tls=True,
            email_from="",
            email_to=[],
            slack_webhook_url="",
            discord_webhook_url="",
        )
        manager = ReportDistributor(config)

        results = manager.distribute_from_files(tmp_path / "nonexistent.md")
        assert results == {}


class TestCreateSummaryForNotification:
    """create_summary_for_notification関数のテスト"""

    def test_empty_trends(self):
        """空リストのテスト"""
        summary = create_summary_for_notification([])
        assert "本日のトレンドデータはありません" in summary

    def test_with_trends(self):
        """トレンドありのテスト"""
        # TrendItemのモック
        class MockTrend:
            def __init__(self, name, rank_change_percent, category, affiliate_url):
                self.name = name
                self.rank_change_percent = rank_change_percent
                self.category = category
                self.affiliate_url = affiliate_url

        trends = [
            MockTrend("テスト商品A", 150.0, "家電", "https://amazon.co.jp/dp/B001?tag=test"),
            MockTrend("テスト商品B", 100.0, "ゲーム", "https://amazon.co.jp/dp/B002?tag=test"),
        ]

        summary = create_summary_for_notification(trends, top_n=2)

        assert "本日の急上昇商品" in summary
        assert "テスト商品A" in summary
        assert "+150%" in summary
        assert "合計 2 件" in summary


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
