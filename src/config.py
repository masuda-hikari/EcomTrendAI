# -*- coding: utf-8 -*-
"""
設定管理モジュール
"""

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv


# .envファイル読み込み
load_dotenv()


@dataclass
class AmazonConfig:
    """Amazon API設定"""
    access_key: str
    secret_key: str
    partner_tag: str
    affiliate_id: str

    @classmethod
    def from_env(cls) -> "AmazonConfig":
        return cls(
            access_key=os.getenv("AMAZON_ACCESS_KEY", ""),
            secret_key=os.getenv("AMAZON_SECRET_KEY", ""),
            partner_tag=os.getenv("AMAZON_PARTNER_TAG", ""),
            affiliate_id=os.getenv("AMAZON_AFFILIATE_ID", "ecomtrend-20"),
        )

    def is_configured(self) -> bool:
        """API認証情報が設定されているか"""
        return bool(self.access_key and self.secret_key and self.partner_tag)


@dataclass
class ScrapingConfig:
    """スクレイピング設定"""
    request_delay: float  # 秒
    max_retries: int
    user_agent: str

    @classmethod
    def from_env(cls) -> "ScrapingConfig":
        return cls(
            request_delay=float(os.getenv("REQUEST_DELAY_SECONDS", "2")),
            max_retries=int(os.getenv("MAX_RETRIES", "3")),
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        )


@dataclass
class PathConfig:
    """パス設定"""
    base_dir: Path
    data_dir: Path
    reports_dir: Path
    raw_data_dir: Path

    @classmethod
    def from_env(cls, base_dir: Optional[Path] = None) -> "PathConfig":
        if base_dir is None:
            base_dir = Path(__file__).parent.parent

        data_dir = Path(os.getenv("DATA_DIR", base_dir / "data"))
        reports_dir = Path(os.getenv("REPORTS_DIR", base_dir / "reports"))

        return cls(
            base_dir=base_dir,
            data_dir=data_dir,
            reports_dir=reports_dir,
            raw_data_dir=data_dir / "raw",
        )

    def ensure_dirs(self) -> None:
        """必要なディレクトリを作成"""
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        self.raw_data_dir.mkdir(parents=True, exist_ok=True)


@dataclass
class AppConfig:
    """アプリケーション全体設定"""
    amazon: AmazonConfig
    scraping: ScrapingConfig
    paths: PathConfig
    log_level: str

    @classmethod
    def load(cls) -> "AppConfig":
        """環境変数から設定を読み込み"""
        paths = PathConfig.from_env()
        paths.ensure_dirs()

        return cls(
            amazon=AmazonConfig.from_env(),
            scraping=ScrapingConfig.from_env(),
            paths=paths,
            log_level=os.getenv("LOG_LEVEL", "INFO"),
        )


# グローバル設定インスタンス
config = AppConfig.load()


def get_affiliate_url(asin: str, marketplace: str = "co.jp") -> str:
    """
    アフィリエイトリンクを生成

    Args:
        asin: Amazon商品ID
        marketplace: マーケットプレイス（co.jp, com等）

    Returns:
        アフィリエイトID付きURL
    """
    tag = config.amazon.affiliate_id
    return f"https://amazon.{marketplace}/dp/{asin}?tag={tag}"
