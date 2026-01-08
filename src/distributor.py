# -*- coding: utf-8 -*-
"""
レポート配信モジュール

トレンドレポートをEmail/Webhook経由で配信
"""

import json
import os
import smtplib
from abc import ABC, abstractmethod
from dataclasses import dataclass
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Optional

import requests
from loguru import logger


@dataclass
class DistributionConfig:
    """配信設定"""
    # Email設定
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    smtp_use_tls: bool
    email_from: str
    email_to: list[str]

    # Webhook設定
    slack_webhook_url: str
    discord_webhook_url: str

    @classmethod
    def from_env(cls) -> "DistributionConfig":
        """環境変数から設定を読み込み"""
        email_to_str = os.getenv("EMAIL_TO", "")
        email_to = [e.strip() for e in email_to_str.split(",") if e.strip()]

        return cls(
            smtp_host=os.getenv("SMTP_HOST", "smtp.gmail.com"),
            smtp_port=int(os.getenv("SMTP_PORT", "587")),
            smtp_user=os.getenv("SMTP_USER", ""),
            smtp_password=os.getenv("SMTP_PASSWORD", ""),
            smtp_use_tls=os.getenv("SMTP_USE_TLS", "true").lower() == "true",
            email_from=os.getenv("EMAIL_FROM", ""),
            email_to=email_to,
            slack_webhook_url=os.getenv("SLACK_WEBHOOK_URL", ""),
            discord_webhook_url=os.getenv("DISCORD_WEBHOOK_URL", ""),
        )

    def is_email_configured(self) -> bool:
        """Email配信が設定されているか"""
        return bool(
            self.smtp_host
            and self.smtp_user
            and self.smtp_password
            and self.email_from
            and self.email_to
        )

    def is_slack_configured(self) -> bool:
        """Slack配信が設定されているか"""
        return bool(self.slack_webhook_url)

    def is_discord_configured(self) -> bool:
        """Discord配信が設定されているか"""
        return bool(self.discord_webhook_url)


class Distributor(ABC):
    """配信基底クラス"""

    @abstractmethod
    def send(self, subject: str, content: str, html_content: Optional[str] = None) -> bool:
        """
        レポートを配信

        Args:
            subject: 件名/タイトル
            content: テキストコンテンツ
            html_content: HTMLコンテンツ（オプション）

        Returns:
            配信成功フラグ
        """
        pass


class EmailDistributor(Distributor):
    """Email配信"""

    def __init__(self, config: DistributionConfig):
        self.config = config

    def send(self, subject: str, content: str, html_content: Optional[str] = None) -> bool:
        """Email送信"""
        if not self.config.is_email_configured():
            logger.warning("Email配信が設定されていません")
            return False

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.config.email_from
            msg["To"] = ", ".join(self.config.email_to)

            # テキストパート
            text_part = MIMEText(content, "plain", "utf-8")
            msg.attach(text_part)

            # HTMLパート（あれば）
            if html_content:
                html_part = MIMEText(html_content, "html", "utf-8")
                msg.attach(html_part)

            # SMTP接続・送信
            with smtplib.SMTP(self.config.smtp_host, self.config.smtp_port) as server:
                if self.config.smtp_use_tls:
                    server.starttls()
                server.login(self.config.smtp_user, self.config.smtp_password)
                server.sendmail(
                    self.config.email_from,
                    self.config.email_to,
                    msg.as_string()
                )

            logger.info(f"Email送信成功: {self.config.email_to}")
            return True

        except smtplib.SMTPException as e:
            logger.error(f"Email送信失敗（SMTP）: {e}")
            return False
        except Exception as e:
            logger.error(f"Email送信失敗: {e}")
            return False


class SlackDistributor(Distributor):
    """Slack Webhook配信"""

    def __init__(self, config: DistributionConfig):
        self.config = config

    def send(self, subject: str, content: str, html_content: Optional[str] = None) -> bool:
        """Slack送信"""
        if not self.config.is_slack_configured():
            logger.warning("Slack配信が設定されていません")
            return False

        try:
            # Slackメッセージ形式
            payload = {
                "text": f"*{subject}*",
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": subject,
                            "emoji": True
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": self._format_for_slack(content)
                        }
                    }
                ]
            }

            response = requests.post(
                self.config.slack_webhook_url,
                json=payload,
                timeout=30
            )
            response.raise_for_status()

            logger.info("Slack送信成功")
            return True

        except requests.RequestException as e:
            logger.error(f"Slack送信失敗: {e}")
            return False

    def _format_for_slack(self, content: str) -> str:
        """Slack用にMarkdownを調整"""
        # Slackは標準Markdownと若干異なる
        formatted = content
        # リンクはそのまま動作
        # 太字は*で囲む
        return formatted[:3000]  # Slackのテキスト制限


class DiscordDistributor(Distributor):
    """Discord Webhook配信"""

    def __init__(self, config: DistributionConfig):
        self.config = config

    def send(self, subject: str, content: str, html_content: Optional[str] = None) -> bool:
        """Discord送信"""
        if not self.config.is_discord_configured():
            logger.warning("Discord配信が設定されていません")
            return False

        try:
            # Discord Embed形式
            payload = {
                "embeds": [
                    {
                        "title": subject,
                        "description": self._format_for_discord(content),
                        "color": 6570404,  # 紫系
                        "footer": {
                            "text": "EcomTrendAI - 自動生成レポート"
                        }
                    }
                ]
            }

            response = requests.post(
                self.config.discord_webhook_url,
                json=payload,
                timeout=30
            )
            response.raise_for_status()

            logger.info("Discord送信成功")
            return True

        except requests.RequestException as e:
            logger.error(f"Discord送信失敗: {e}")
            return False

    def _format_for_discord(self, content: str) -> str:
        """Discord用にフォーマット"""
        # Discordは標準Markdownをサポート
        return content[:4096]  # Discordのdescription制限


class ReportDistributor:
    """
    レポート配信マネージャー

    複数の配信先に一括配信
    """

    def __init__(self, config: Optional[DistributionConfig] = None):
        self.config = config or DistributionConfig.from_env()
        self.distributors: list[Distributor] = []

        # 設定された配信先を登録
        if self.config.is_email_configured():
            self.distributors.append(EmailDistributor(self.config))
        if self.config.is_slack_configured():
            self.distributors.append(SlackDistributor(self.config))
        if self.config.is_discord_configured():
            self.distributors.append(DiscordDistributor(self.config))

    def distribute(
        self,
        subject: str,
        content: str,
        html_content: Optional[str] = None
    ) -> dict[str, bool]:
        """
        全配信先にレポートを配信

        Args:
            subject: 件名
            content: テキストコンテンツ
            html_content: HTMLコンテンツ（オプション）

        Returns:
            配信先ごとの成功/失敗
        """
        results = {}

        if not self.distributors:
            logger.warning("有効な配信先がありません。.envを確認してください。")
            return results

        for distributor in self.distributors:
            name = distributor.__class__.__name__
            results[name] = distributor.send(subject, content, html_content)

        success_count = sum(1 for v in results.values() if v)
        logger.info(f"配信完了: {success_count}/{len(results)} 成功")

        return results

    def distribute_from_files(
        self,
        md_path: Path,
        html_path: Optional[Path] = None,
        subject: Optional[str] = None
    ) -> dict[str, bool]:
        """
        ファイルから読み込んで配信

        Args:
            md_path: Markdownレポートファイルパス
            html_path: HTMLレポートファイルパス（オプション）
            subject: 件名（指定なしなら自動生成）

        Returns:
            配信結果
        """
        if not md_path.exists():
            logger.error(f"レポートファイルが見つかりません: {md_path}")
            return {}

        content = md_path.read_text(encoding="utf-8")

        html_content = None
        if html_path and html_path.exists():
            html_content = html_path.read_text(encoding="utf-8")

        if not subject:
            # ファイル名から日付を抽出して件名を生成
            subject = f"📊 EcomTrendAI トレンドレポート - {md_path.stem.replace('trends_', '')}"

        return self.distribute(subject, content, html_content)


def create_summary_for_notification(trends: list, top_n: int = 5) -> str:
    """
    通知用サマリーを生成

    Args:
        trends: トレンドリスト
        top_n: 上位件数

    Returns:
        サマリーテキスト
    """
    if not trends:
        return "本日のトレンドデータはありません。"

    lines = ["📈 **本日の急上昇商品**\n"]

    for i, t in enumerate(trends[:top_n], 1):
        name = t.name[:35] + "..." if len(t.name) > 35 else t.name
        lines.append(f"{i}. {name}")
        lines.append(f"   📊 変動: +{t.rank_change_percent:.0f}% | カテゴリ: {t.category}")
        lines.append(f"   🔗 [商品ページ]({t.affiliate_url})")
        lines.append("")

    lines.append(f"\n*合計 {len(trends)} 件のトレンド商品を検出*")

    return "\n".join(lines)
