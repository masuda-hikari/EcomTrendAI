# -*- coding: utf-8 -*-
"""
データ収集モジュール

Amazon等のEコマースプラットフォームから商品トレンドデータを収集
"""

import csv
import time
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from loguru import logger

from config import config, get_affiliate_url


@dataclass
class ProductData:
    """商品データ"""
    asin: str
    name: str
    category: str
    current_rank: int
    previous_rank: Optional[int]
    rank_change: Optional[int]  # 正=上昇, 負=下降
    rank_change_percent: Optional[float]
    price: Optional[float]
    currency: str
    review_count: Optional[int]
    rating: Optional[float]
    affiliate_url: str
    timestamp: str
    source: str


class AmazonScraper:
    """
    Amazonトレンドデータスクレイパー

    注意: 利用規約を遵守し、適切なレート制限を設定すること
    """

    BASE_URL = "https://www.amazon.co.jp"
    MOVERS_SHAKERS_URL = "/gp/movers-and-shakers"

    # カテゴリマッピング
    CATEGORIES = {
        "electronics": "家電&カメラ",
        "computers": "パソコン・周辺機器",
        "videogames": "ゲーム",
        "toys": "おもちゃ",
        "sports": "スポーツ&アウトドア",
        "home": "ホーム&キッチン",
        "fashion": "ファッション",
        "beauty": "ビューティー",
    }

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": config.scraping.user_agent,
            "Accept-Language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
        })
        self.delay = config.scraping.request_delay

    def _request(self, url: str) -> Optional[BeautifulSoup]:
        """
        HTTPリクエストを実行（レート制限付き）

        Args:
            url: リクエストURL

        Returns:
            BeautifulSoupオブジェクト、失敗時はNone
        """
        for attempt in range(config.scraping.max_retries):
            try:
                time.sleep(self.delay)
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                return BeautifulSoup(response.text, "lxml")
            except requests.RequestException as e:
                logger.warning(f"リクエスト失敗 (試行 {attempt + 1}): {e}")
                time.sleep(self.delay * (attempt + 1))  # 指数バックオフ

        logger.error(f"リクエスト完全失敗: {url}")
        return None

    def fetch_movers_shakers(
        self, category: str = "electronics", limit: int = 50
    ) -> list[ProductData]:
        """
        Movers & Shakers（急上昇商品）を取得

        Args:
            category: カテゴリID
            limit: 取得件数上限

        Returns:
            商品データリスト
        """
        url = urljoin(self.BASE_URL, f"{self.MOVERS_SHAKERS_URL}/{category}")
        logger.info(f"Movers & Shakers取得開始: {category}")

        soup = self._request(url)
        if soup is None:
            return []

        products = []
        timestamp = datetime.now().isoformat()
        category_name = self.CATEGORIES.get(category, category)

        # 商品カード要素を抽出（実際のHTML構造に合わせて調整が必要）
        # 以下はサンプル実装 - 実際のAmazonページ構造に合わせて修正すること
        product_cards = soup.select(".p13n-sc-uncoverable-faceout")[:limit]

        for idx, card in enumerate(product_cards, 1):
            try:
                product = self._parse_product_card(card, category_name, timestamp, idx)
                if product:
                    products.append(product)
            except Exception as e:
                logger.warning(f"商品パース失敗 (位置 {idx}): {e}")

        logger.info(f"取得完了: {len(products)}件")
        return products

    def _parse_product_card(
        self, card: BeautifulSoup, category: str, timestamp: str, rank: int
    ) -> Optional[ProductData]:
        """
        商品カードHTMLをパース

        注意: Amazon のHTML構造は変更される可能性があるため、
        定期的なメンテナンスが必要
        """
        # ASIN抽出
        asin_elem = card.select_one("[data-asin]")
        asin = asin_elem.get("data-asin", "") if asin_elem else ""
        if not asin:
            return None

        # 商品名
        name_elem = card.select_one(".p13n-sc-truncate-desktop-type2")
        name = name_elem.get_text(strip=True) if name_elem else "不明"

        # ランク変動
        rank_change_elem = card.select_one(".zg-bdg-text")
        rank_change_text = rank_change_elem.get_text(strip=True) if rank_change_elem else ""
        rank_change = self._parse_rank_change(rank_change_text)

        # 価格
        price_elem = card.select_one(".p13n-sc-price")
        price = self._parse_price(price_elem.get_text(strip=True)) if price_elem else None

        # レビュー数
        review_elem = card.select_one(".a-size-small .a-link-normal")
        review_count = self._parse_review_count(
            review_elem.get_text(strip=True)
        ) if review_elem else None

        # 評価
        rating_elem = card.select_one(".a-icon-star-small")
        rating = self._parse_rating(rating_elem.get_text(strip=True)) if rating_elem else None

        return ProductData(
            asin=asin,
            name=name,
            category=category,
            current_rank=rank,
            previous_rank=None,  # 履歴データから計算
            rank_change=rank_change,
            rank_change_percent=self._calc_change_percent(rank_change, rank),
            price=price,
            currency="JPY",
            review_count=review_count,
            rating=rating,
            affiliate_url=get_affiliate_url(asin),
            timestamp=timestamp,
            source="amazon_movers_shakers",
        )

    def _parse_rank_change(self, text: str) -> Optional[int]:
        """ランク変動をパース（例: '+150%' → 150）"""
        if not text:
            return None
        try:
            # 「150%」や「+150%」形式を想定
            clean = text.replace("%", "").replace("+", "").replace(",", "")
            return int(clean)
        except ValueError:
            return None

    def _parse_price(self, text: str) -> Optional[float]:
        """価格をパース（例: '¥12,345' → 12345.0）"""
        if not text:
            return None
        try:
            clean = text.replace("¥", "").replace(",", "").strip()
            return float(clean)
        except ValueError:
            return None

    def _parse_review_count(self, text: str) -> Optional[int]:
        """レビュー数をパース（例: '1,234' → 1234）"""
        if not text:
            return None
        try:
            clean = text.replace(",", "").strip()
            return int(clean)
        except ValueError:
            return None

    def _parse_rating(self, text: str) -> Optional[float]:
        """評価をパース（例: '4.5' → 4.5）"""
        if not text:
            return None
        try:
            # 「5つ星のうち4.5」形式を想定
            import re
            match = re.search(r"(\d+\.?\d*)", text)
            return float(match.group(1)) if match else None
        except ValueError:
            return None

    def _calc_change_percent(
        self, rank_change: Optional[int], current_rank: int
    ) -> Optional[float]:
        """ランク変動率を計算"""
        if rank_change is None:
            return None
        # 簡易計算（実際は前回ランクとの比較が必要）
        return float(rank_change)


class DataSaver:
    """データ保存クラス"""

    def __init__(self, output_dir: Optional[Path] = None):
        self.output_dir = output_dir or config.paths.raw_data_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def save_to_csv(self, products: list[ProductData], filename: Optional[str] = None) -> Path:
        """
        商品データをCSVに保存

        Args:
            products: 商品データリスト
            filename: ファイル名（省略時は日付ベース）

        Returns:
            保存先パス
        """
        if not products:
            logger.warning("保存するデータがありません")
            return Path()

        if filename is None:
            date_str = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"products_{date_str}.csv"

        filepath = self.output_dir / filename

        fieldnames = [
            "asin", "name", "category", "current_rank", "previous_rank",
            "rank_change", "rank_change_percent", "price", "currency",
            "review_count", "rating", "affiliate_url", "timestamp", "source"
        ]

        with open(filepath, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for product in products:
                writer.writerow(asdict(product))

        logger.info(f"データ保存完了: {filepath} ({len(products)}件)")
        return filepath


def main():
    """メイン実行"""
    logger.info("=== EcomTrendAI データ収集開始 ===")

    scraper = AmazonScraper()
    saver = DataSaver()

    all_products = []

    # 複数カテゴリから収集
    categories = ["electronics", "computers", "videogames"]

    for category in categories:
        logger.info(f"カテゴリ: {category}")
        products = scraper.fetch_movers_shakers(category, limit=20)
        all_products.extend(products)
        time.sleep(3)  # カテゴリ間の待機

    # 保存
    if all_products:
        filepath = saver.save_to_csv(all_products)
        logger.info(f"合計 {len(all_products)} 件のデータを収集")

        # 簡易プレビュー
        print("\n=== 収集結果プレビュー ===")
        for i, p in enumerate(all_products[:5], 1):
            print(f"{i}. {p.name[:30]}... | ランク変動: {p.rank_change}% | {p.category}")
    else:
        logger.warning("データを収集できませんでした")

    logger.info("=== データ収集完了 ===")


if __name__ == "__main__":
    main()
