# -*- coding: utf-8 -*-
"""
ユーザー認証・プラン管理モジュール

Firebase Auth + Stripe統合による認証・課金システム
サブスクリプションプランに基づく機能制限を管理
"""

import hashlib
import hmac
import os
import secrets
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from loguru import logger

load_dotenv()


class SubscriptionPlan(Enum):
    """サブスクリプションプラン"""
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


@dataclass
class PlanLimits:
    """プランごとの機能制限"""
    daily_reports: int  # 日次レポート件数
    categories: int  # 対象カテゴリ数
    api_calls_per_day: int  # API呼び出し上限/日
    realtime_alerts: bool  # リアルタイムアラート
    custom_dashboard: bool  # カスタムダッシュボード
    export_formats: list[str]  # エクスポート形式
    support_level: str  # サポートレベル
    price_jpy: int  # 月額（円）


# プラン定義
PLAN_LIMITS: dict[SubscriptionPlan, PlanLimits] = {
    SubscriptionPlan.FREE: PlanLimits(
        daily_reports=10,
        categories=2,
        api_calls_per_day=100,
        realtime_alerts=False,
        custom_dashboard=False,
        export_formats=["md"],
        support_level="community",
        price_jpy=0,
    ),
    SubscriptionPlan.PRO: PlanLimits(
        daily_reports=100,
        categories=10,
        api_calls_per_day=1000,
        realtime_alerts=True,
        custom_dashboard=False,
        export_formats=["md", "html", "csv", "json"],
        support_level="email",
        price_jpy=980,
    ),
    SubscriptionPlan.ENTERPRISE: PlanLimits(
        daily_reports=-1,  # 無制限
        categories=-1,  # 無制限
        api_calls_per_day=-1,  # 無制限
        realtime_alerts=True,
        custom_dashboard=True,
        export_formats=["md", "html", "csv", "json", "excel", "api"],
        support_level="dedicated",
        price_jpy=4980,
    ),
}


@dataclass
class User:
    """ユーザー情報"""
    user_id: str
    email: str
    plan: SubscriptionPlan = SubscriptionPlan.FREE
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    subscription_expires: Optional[datetime] = None
    api_key: Optional[str] = None
    api_calls_today: int = 0
    last_api_reset: datetime = field(default_factory=datetime.now)

    def get_limits(self) -> PlanLimits:
        """現在のプランの制限を取得"""
        return PLAN_LIMITS[self.plan]

    def is_subscription_active(self) -> bool:
        """サブスクリプションが有効か"""
        if self.plan == SubscriptionPlan.FREE:
            return True
        if self.subscription_expires is None:
            return False
        return datetime.now() < self.subscription_expires

    def can_use_feature(self, feature: str) -> bool:
        """特定の機能が使用可能か"""
        limits = self.get_limits()
        feature_map = {
            "realtime_alerts": limits.realtime_alerts,
            "custom_dashboard": limits.custom_dashboard,
            "export_csv": "csv" in limits.export_formats,
            "export_json": "json" in limits.export_formats,
            "export_excel": "excel" in limits.export_formats,
            "api_access": "api" in limits.export_formats,
        }
        return feature_map.get(feature, False)

    def check_api_limit(self) -> bool:
        """API呼び出し制限をチェック"""
        limits = self.get_limits()
        if limits.api_calls_per_day == -1:
            return True
        # 日付が変わっていたらリセット
        if self.last_api_reset.date() < datetime.now().date():
            self.api_calls_today = 0
            self.last_api_reset = datetime.now()
        return self.api_calls_today < limits.api_calls_per_day

    def increment_api_call(self) -> bool:
        """API呼び出し回数をインクリメント"""
        if not self.check_api_limit():
            return False
        self.api_calls_today += 1
        return True


@dataclass
class APIKey:
    """APIキー情報"""
    key_id: str
    user_id: str
    key_hash: str  # ハッシュ化されたキー
    name: str
    created_at: datetime = field(default_factory=datetime.now)
    last_used: Optional[datetime] = None
    is_active: bool = True


class AuthService:
    """認証サービス"""

    def __init__(self, users_file: Optional[Path] = None):
        """
        初期化

        Args:
            users_file: ユーザーデータ保存ファイル
        """
        self.users_file = users_file or Path(__file__).parent.parent / "data" / "users.json"
        self.api_keys_file = self.users_file.parent / "api_keys.json"
        self._users: dict[str, User] = {}
        self._api_keys: dict[str, APIKey] = {}
        self._load_users()

    def _load_users(self) -> None:
        """ユーザーデータを読み込み"""
        import json

        if self.users_file.exists():
            try:
                with open(self.users_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for uid, udata in data.items():
                    self._users[uid] = User(
                        user_id=udata["user_id"],
                        email=udata["email"],
                        plan=SubscriptionPlan(udata.get("plan", "free")),
                        stripe_customer_id=udata.get("stripe_customer_id"),
                        stripe_subscription_id=udata.get("stripe_subscription_id"),
                        created_at=datetime.fromisoformat(udata.get("created_at", datetime.now().isoformat())),
                        subscription_expires=datetime.fromisoformat(udata["subscription_expires"]) if udata.get("subscription_expires") else None,
                        api_key=udata.get("api_key"),
                        api_calls_today=udata.get("api_calls_today", 0),
                        last_api_reset=datetime.fromisoformat(udata.get("last_api_reset", datetime.now().isoformat())),
                    )
            except Exception as e:
                logger.warning(f"ユーザーデータ読み込みエラー: {e}")

        if self.api_keys_file.exists():
            try:
                with open(self.api_keys_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for key_id, kdata in data.items():
                    self._api_keys[key_id] = APIKey(
                        key_id=kdata["key_id"],
                        user_id=kdata["user_id"],
                        key_hash=kdata["key_hash"],
                        name=kdata["name"],
                        created_at=datetime.fromisoformat(kdata.get("created_at", datetime.now().isoformat())),
                        last_used=datetime.fromisoformat(kdata["last_used"]) if kdata.get("last_used") else None,
                        is_active=kdata.get("is_active", True),
                    )
            except Exception as e:
                logger.warning(f"APIキーデータ読み込みエラー: {e}")

    def _save_users(self) -> None:
        """ユーザーデータを保存"""
        import json

        self.users_file.parent.mkdir(parents=True, exist_ok=True)

        data = {}
        for uid, user in self._users.items():
            data[uid] = {
                "user_id": user.user_id,
                "email": user.email,
                "plan": user.plan.value,
                "stripe_customer_id": user.stripe_customer_id,
                "stripe_subscription_id": user.stripe_subscription_id,
                "created_at": user.created_at.isoformat(),
                "subscription_expires": user.subscription_expires.isoformat() if user.subscription_expires else None,
                "api_key": user.api_key,
                "api_calls_today": user.api_calls_today,
                "last_api_reset": user.last_api_reset.isoformat(),
            }

        with open(self.users_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        # APIキーも保存
        key_data = {}
        for key_id, api_key in self._api_keys.items():
            key_data[key_id] = {
                "key_id": api_key.key_id,
                "user_id": api_key.user_id,
                "key_hash": api_key.key_hash,
                "name": api_key.name,
                "created_at": api_key.created_at.isoformat(),
                "last_used": api_key.last_used.isoformat() if api_key.last_used else None,
                "is_active": api_key.is_active,
            }

        with open(self.api_keys_file, "w", encoding="utf-8") as f:
            json.dump(key_data, f, ensure_ascii=False, indent=2)

    def create_user(self, email: str, user_id: Optional[str] = None) -> User:
        """
        新規ユーザーを作成

        Args:
            email: メールアドレス
            user_id: ユーザーID（指定なしで自動生成）

        Returns:
            作成されたUser
        """
        if user_id is None:
            user_id = secrets.token_hex(16)

        user = User(user_id=user_id, email=email)
        self._users[user_id] = user
        self._save_users()
        logger.info(f"ユーザー作成: {email} ({user_id})")
        return user

    def get_user(self, user_id: str) -> Optional[User]:
        """ユーザーを取得"""
        return self._users.get(user_id)

    def get_user_by_email(self, email: str) -> Optional[User]:
        """メールアドレスでユーザーを取得"""
        for user in self._users.values():
            if user.email == email:
                return user
        return None

    def update_subscription(
        self,
        user_id: str,
        plan: SubscriptionPlan,
        stripe_subscription_id: str,
        expires: datetime,
    ) -> bool:
        """
        サブスクリプションを更新

        Args:
            user_id: ユーザーID
            plan: 新しいプラン
            stripe_subscription_id: StripeサブスクリプションID
            expires: 有効期限

        Returns:
            成功したか
        """
        user = self.get_user(user_id)
        if not user:
            return False

        user.plan = plan
        user.stripe_subscription_id = stripe_subscription_id
        user.subscription_expires = expires
        self._save_users()
        logger.info(f"サブスクリプション更新: {user.email} -> {plan.value}")
        return True

    def cancel_subscription(self, user_id: str) -> bool:
        """
        サブスクリプションをキャンセル

        Args:
            user_id: ユーザーID

        Returns:
            成功したか
        """
        user = self.get_user(user_id)
        if not user:
            return False

        # 即時キャンセルではなく、期間終了後にFREEへ
        logger.info(f"サブスクリプションキャンセル: {user.email}")
        return True

    def downgrade_to_free(self, user_id: str) -> bool:
        """
        FREEプランにダウングレード

        Args:
            user_id: ユーザーID

        Returns:
            成功したか
        """
        user = self.get_user(user_id)
        if not user:
            return False

        user.plan = SubscriptionPlan.FREE
        user.stripe_subscription_id = None
        user.subscription_expires = None
        self._save_users()
        logger.info(f"FREEプランへダウングレード: {user.email}")
        return True

    def generate_api_key(self, user_id: str, name: str = "default") -> Optional[tuple[str, APIKey]]:
        """
        APIキーを生成

        Args:
            user_id: ユーザーID
            name: キー名

        Returns:
            (生のキー, APIKeyオブジェクト) または None
        """
        user = self.get_user(user_id)
        if not user:
            return None

        # プランでAPI利用可能かチェック
        if not user.can_use_feature("api_access") and user.plan != SubscriptionPlan.FREE:
            logger.warning(f"APIアクセス権限なし: {user.email}")
            # FREEでも基本的なAPIは許可

        raw_key = f"ect_{secrets.token_urlsafe(32)}"
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        key_id = secrets.token_hex(8)

        api_key = APIKey(
            key_id=key_id,
            user_id=user_id,
            key_hash=key_hash,
            name=name,
        )

        self._api_keys[key_id] = api_key
        self._save_users()
        logger.info(f"APIキー生成: {user.email} ({name})")

        return raw_key, api_key

    def validate_api_key(self, raw_key: str) -> Optional[User]:
        """
        APIキーを検証

        Args:
            raw_key: 生のAPIキー

        Returns:
            対応するUser または None
        """
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

        for api_key in self._api_keys.values():
            if api_key.key_hash == key_hash and api_key.is_active:
                user = self.get_user(api_key.user_id)
                if user and user.is_subscription_active():
                    api_key.last_used = datetime.now()
                    self._save_users()
                    return user

        return None

    def revoke_api_key(self, key_id: str) -> bool:
        """
        APIキーを無効化

        Args:
            key_id: キーID

        Returns:
            成功したか
        """
        if key_id in self._api_keys:
            self._api_keys[key_id].is_active = False
            self._save_users()
            logger.info(f"APIキー無効化: {key_id}")
            return True
        return False


class StripeService:
    """Stripe決済サービス"""

    def __init__(self):
        """初期化"""
        self.api_key = os.getenv("STRIPE_SECRET_KEY", "")
        self.webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
        self.price_ids = {
            SubscriptionPlan.PRO: os.getenv("STRIPE_PRICE_PRO", ""),
            SubscriptionPlan.ENTERPRISE: os.getenv("STRIPE_PRICE_ENTERPRISE", ""),
        }
        self._stripe = None

    @property
    def stripe(self):
        """Stripeモジュールを遅延ロード"""
        if self._stripe is None:
            try:
                import stripe
                stripe.api_key = self.api_key
                self._stripe = stripe
            except ImportError:
                logger.error("stripeモジュールがインストールされていません")
                raise
        return self._stripe

    def is_configured(self) -> bool:
        """Stripe設定が完了しているか"""
        return bool(self.api_key and self.webhook_secret)

    def create_customer(self, email: str, user_id: str) -> Optional[str]:
        """
        Stripe顧客を作成

        Args:
            email: メールアドレス
            user_id: ユーザーID

        Returns:
            Stripe顧客ID または None
        """
        if not self.is_configured():
            logger.warning("Stripeが設定されていません")
            return None

        try:
            customer = self.stripe.Customer.create(
                email=email,
                metadata={"user_id": user_id},
            )
            logger.info(f"Stripe顧客作成: {email} -> {customer.id}")
            return customer.id
        except Exception as e:
            logger.error(f"Stripe顧客作成エラー: {e}")
            return None

    def create_checkout_session(
        self,
        customer_id: str,
        plan: SubscriptionPlan,
        success_url: str,
        cancel_url: str,
    ) -> Optional[str]:
        """
        Checkoutセッションを作成

        Args:
            customer_id: Stripe顧客ID
            plan: 購入プラン
            success_url: 成功時リダイレクトURL
            cancel_url: キャンセル時リダイレクトURL

        Returns:
            CheckoutセッションURL または None
        """
        if not self.is_configured():
            return None

        price_id = self.price_ids.get(plan)
        if not price_id:
            logger.error(f"価格IDが設定されていません: {plan.value}")
            return None

        try:
            session = self.stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=["card"],
                line_items=[
                    {
                        "price": price_id,
                        "quantity": 1,
                    }
                ],
                mode="subscription",
                success_url=success_url,
                cancel_url=cancel_url,
            )
            logger.info(f"Checkoutセッション作成: {session.url}")
            return session.url
        except Exception as e:
            logger.error(f"Checkoutセッション作成エラー: {e}")
            return None

    def cancel_subscription(self, subscription_id: str) -> bool:
        """
        サブスクリプションをキャンセル

        Args:
            subscription_id: StripeサブスクリプションID

        Returns:
            成功したか
        """
        if not self.is_configured():
            return False

        try:
            self.stripe.Subscription.delete(subscription_id)
            logger.info(f"Stripeサブスクリプションキャンセル: {subscription_id}")
            return True
        except Exception as e:
            logger.error(f"サブスクリプションキャンセルエラー: {e}")
            return False

    def verify_webhook_signature(self, payload: bytes, sig_header: str) -> Optional[dict]:
        """
        Webhookの署名を検証

        Args:
            payload: リクエストボディ
            sig_header: Stripe-Signatureヘッダー

        Returns:
            イベントデータ または None
        """
        if not self.is_configured():
            return None

        try:
            event = self.stripe.Webhook.construct_event(
                payload, sig_header, self.webhook_secret
            )
            return event
        except Exception as e:
            logger.error(f"Webhook署名検証エラー: {e}")
            return None


class BillingManager:
    """課金管理統合クラス"""

    def __init__(self, auth_service: Optional[AuthService] = None):
        """
        初期化

        Args:
            auth_service: 認証サービス
        """
        self.auth = auth_service or AuthService()
        self.stripe = StripeService()

    def register_user(self, email: str) -> tuple[User, Optional[str]]:
        """
        ユーザー登録（Stripe顧客も作成）

        Args:
            email: メールアドレス

        Returns:
            (User, Stripe顧客ID)
        """
        user = self.auth.create_user(email)

        stripe_customer_id = None
        if self.stripe.is_configured():
            stripe_customer_id = self.stripe.create_customer(email, user.user_id)
            if stripe_customer_id:
                user.stripe_customer_id = stripe_customer_id
                self.auth._save_users()

        return user, stripe_customer_id

    def upgrade_plan(
        self,
        user_id: str,
        plan: SubscriptionPlan,
        success_url: str = "https://ecomtrend.ai/success",
        cancel_url: str = "https://ecomtrend.ai/cancel",
    ) -> Optional[str]:
        """
        プランをアップグレード（Checkout URLを返す）

        Args:
            user_id: ユーザーID
            plan: アップグレード先プラン
            success_url: 成功時URL
            cancel_url: キャンセル時URL

        Returns:
            CheckoutセッションURL または None
        """
        user = self.auth.get_user(user_id)
        if not user:
            return None

        if not user.stripe_customer_id:
            customer_id = self.stripe.create_customer(user.email, user_id)
            if customer_id:
                user.stripe_customer_id = customer_id
                self.auth._save_users()
            else:
                return None

        return self.stripe.create_checkout_session(
            user.stripe_customer_id,
            plan,
            success_url,
            cancel_url,
        )

    def handle_webhook_event(self, event: dict) -> bool:
        """
        StripeのWebhookイベントを処理

        Args:
            event: Stripeイベント

        Returns:
            処理成功したか
        """
        event_type = event.get("type", "")
        data = event.get("data", {}).get("object", {})

        if event_type == "checkout.session.completed":
            return self._handle_checkout_completed(data)
        elif event_type == "customer.subscription.updated":
            return self._handle_subscription_updated(data)
        elif event_type == "customer.subscription.deleted":
            return self._handle_subscription_deleted(data)
        elif event_type == "invoice.payment_failed":
            return self._handle_payment_failed(data)

        logger.info(f"未処理のWebhookイベント: {event_type}")
        return True

    def _handle_checkout_completed(self, data: dict) -> bool:
        """Checkout完了処理"""
        customer_id = data.get("customer")
        subscription_id = data.get("subscription")

        # 顧客IDからユーザーを検索
        for user in self.auth._users.values():
            if user.stripe_customer_id == customer_id:
                # プランを判定（価格IDから）
                # 実際にはsubscriptionの詳細を取得して判定
                plan = SubscriptionPlan.PRO  # 仮

                expires = datetime.now() + timedelta(days=30)
                self.auth.update_subscription(
                    user.user_id, plan, subscription_id, expires
                )
                logger.info(f"Checkout完了: {user.email} -> {plan.value}")
                return True

        logger.warning(f"顧客が見つかりません: {customer_id}")
        return False

    def _handle_subscription_updated(self, data: dict) -> bool:
        """サブスクリプション更新処理"""
        subscription_id = data.get("id")
        status = data.get("status")

        for user in self.auth._users.values():
            if user.stripe_subscription_id == subscription_id:
                if status == "active":
                    # 更新（延長）
                    period_end = data.get("current_period_end")
                    if period_end:
                        expires = datetime.fromtimestamp(period_end)
                        user.subscription_expires = expires
                        self.auth._save_users()
                logger.info(f"サブスクリプション更新: {user.email} ({status})")
                return True

        return False

    def _handle_subscription_deleted(self, data: dict) -> bool:
        """サブスクリプション削除処理"""
        subscription_id = data.get("id")

        for user in self.auth._users.values():
            if user.stripe_subscription_id == subscription_id:
                self.auth.downgrade_to_free(user.user_id)
                logger.info(f"サブスクリプション削除: {user.email}")
                return True

        return False

    def _handle_payment_failed(self, data: dict) -> bool:
        """支払い失敗処理"""
        customer_id = data.get("customer")

        for user in self.auth._users.values():
            if user.stripe_customer_id == customer_id:
                logger.warning(f"支払い失敗: {user.email}")
                # 通知処理など
                return True

        return False

    def get_user_status(self, user_id: str) -> Optional[dict]:
        """
        ユーザーの課金状態を取得

        Args:
            user_id: ユーザーID

        Returns:
            ステータス辞書
        """
        user = self.auth.get_user(user_id)
        if not user:
            return None

        limits = user.get_limits()
        return {
            "user_id": user.user_id,
            "email": user.email,
            "plan": user.plan.value,
            "plan_name": {
                SubscriptionPlan.FREE: "Free",
                SubscriptionPlan.PRO: "Pro",
                SubscriptionPlan.ENTERPRISE: "Enterprise",
            }[user.plan],
            "is_active": user.is_subscription_active(),
            "expires": user.subscription_expires.isoformat() if user.subscription_expires else None,
            "limits": {
                "daily_reports": limits.daily_reports,
                "categories": limits.categories,
                "api_calls_per_day": limits.api_calls_per_day,
                "realtime_alerts": limits.realtime_alerts,
                "custom_dashboard": limits.custom_dashboard,
                "export_formats": limits.export_formats,
            },
            "usage": {
                "api_calls_today": user.api_calls_today,
            },
            "price_jpy": limits.price_jpy,
        }
