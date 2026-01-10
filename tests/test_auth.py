# -*- coding: utf-8 -*-
"""
認証・課金システムのテスト
"""

import tempfile
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

import sys
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from auth import (
    APIKey,
    AuthService,
    BillingManager,
    PlanLimits,
    StripeService,
    SubscriptionPlan,
    User,
    PLAN_LIMITS,
)


class TestSubscriptionPlan:
    """サブスクリプションプランのテスト"""

    def test_plan_values(self):
        """プラン値の確認"""
        assert SubscriptionPlan.FREE.value == "free"
        assert SubscriptionPlan.PRO.value == "pro"
        assert SubscriptionPlan.ENTERPRISE.value == "enterprise"

    def test_plan_limits_defined(self):
        """全プランに制限が定義されているか"""
        for plan in SubscriptionPlan:
            assert plan in PLAN_LIMITS
            limits = PLAN_LIMITS[plan]
            assert isinstance(limits, PlanLimits)

    def test_free_plan_limits(self):
        """FREEプランの制限"""
        limits = PLAN_LIMITS[SubscriptionPlan.FREE]
        assert limits.daily_reports == 10
        assert limits.categories == 2
        assert limits.api_calls_per_day == 100
        assert limits.realtime_alerts is False
        assert limits.price_jpy == 0

    def test_pro_plan_limits(self):
        """PROプランの制限"""
        limits = PLAN_LIMITS[SubscriptionPlan.PRO]
        assert limits.daily_reports == 100
        assert limits.realtime_alerts is True
        assert limits.price_jpy == 980

    def test_enterprise_plan_unlimited(self):
        """ENTERPRISEプランは無制限"""
        limits = PLAN_LIMITS[SubscriptionPlan.ENTERPRISE]
        assert limits.daily_reports == -1
        assert limits.categories == -1
        assert limits.api_calls_per_day == -1


class TestUser:
    """Userクラスのテスト"""

    def test_create_user(self):
        """ユーザー作成"""
        user = User(user_id="test123", email="test@example.com")
        assert user.user_id == "test123"
        assert user.email == "test@example.com"
        assert user.plan == SubscriptionPlan.FREE

    def test_get_limits(self):
        """制限取得"""
        user = User(user_id="test", email="test@example.com")
        limits = user.get_limits()
        assert limits == PLAN_LIMITS[SubscriptionPlan.FREE]

    def test_is_subscription_active_free(self):
        """FREEプランは常にアクティブ"""
        user = User(user_id="test", email="test@example.com")
        assert user.is_subscription_active() is True

    def test_is_subscription_active_expired(self):
        """期限切れ"""
        user = User(
            user_id="test",
            email="test@example.com",
            plan=SubscriptionPlan.PRO,
            subscription_expires=datetime.now() - timedelta(days=1),
        )
        assert user.is_subscription_active() is False

    def test_is_subscription_active_valid(self):
        """有効期限内"""
        user = User(
            user_id="test",
            email="test@example.com",
            plan=SubscriptionPlan.PRO,
            subscription_expires=datetime.now() + timedelta(days=30),
        )
        assert user.is_subscription_active() is True

    def test_can_use_feature_free(self):
        """FREEプランの機能制限"""
        user = User(user_id="test", email="test@example.com")
        assert user.can_use_feature("realtime_alerts") is False
        assert user.can_use_feature("custom_dashboard") is False
        assert user.can_use_feature("export_csv") is False

    def test_can_use_feature_pro(self):
        """PROプランの機能"""
        user = User(
            user_id="test",
            email="test@example.com",
            plan=SubscriptionPlan.PRO,
        )
        assert user.can_use_feature("realtime_alerts") is True
        assert user.can_use_feature("export_csv") is True
        assert user.can_use_feature("export_json") is True

    def test_check_api_limit(self):
        """API制限チェック"""
        user = User(user_id="test", email="test@example.com")
        assert user.check_api_limit() is True
        user.api_calls_today = 100
        assert user.check_api_limit() is False

    def test_increment_api_call(self):
        """API呼び出しインクリメント"""
        user = User(user_id="test", email="test@example.com")
        assert user.increment_api_call() is True
        assert user.api_calls_today == 1

    def test_api_limit_reset_on_new_day(self):
        """日付変更でリセット"""
        user = User(
            user_id="test",
            email="test@example.com",
            api_calls_today=100,
            last_api_reset=datetime.now() - timedelta(days=1),
        )
        assert user.check_api_limit() is True
        assert user.api_calls_today == 0


class TestAuthService:
    """AuthServiceのテスト"""

    @pytest.fixture
    def temp_dir(self):
        """一時ディレクトリ"""
        with tempfile.TemporaryDirectory() as td:
            yield Path(td)

    @pytest.fixture
    def auth_service(self, temp_dir):
        """AuthServiceインスタンス"""
        return AuthService(users_file=temp_dir / "users.json")

    def test_create_user(self, auth_service):
        """ユーザー作成"""
        user = auth_service.create_user("test@example.com")
        assert user.email == "test@example.com"
        assert user.user_id is not None

    def test_get_user(self, auth_service):
        """ユーザー取得"""
        created = auth_service.create_user("test@example.com")
        retrieved = auth_service.get_user(created.user_id)
        assert retrieved is not None
        assert retrieved.email == "test@example.com"

    def test_get_user_by_email(self, auth_service):
        """メールでユーザー取得"""
        auth_service.create_user("test@example.com")
        user = auth_service.get_user_by_email("test@example.com")
        assert user is not None
        assert user.email == "test@example.com"

    def test_update_subscription(self, auth_service):
        """サブスクリプション更新"""
        user = auth_service.create_user("test@example.com")
        expires = datetime.now() + timedelta(days=30)

        result = auth_service.update_subscription(
            user.user_id,
            SubscriptionPlan.PRO,
            "sub_123",
            expires,
        )

        assert result is True
        updated = auth_service.get_user(user.user_id)
        assert updated.plan == SubscriptionPlan.PRO
        assert updated.stripe_subscription_id == "sub_123"

    def test_downgrade_to_free(self, auth_service):
        """FREEへダウングレード"""
        user = auth_service.create_user("test@example.com")
        auth_service.update_subscription(
            user.user_id,
            SubscriptionPlan.PRO,
            "sub_123",
            datetime.now() + timedelta(days=30),
        )

        result = auth_service.downgrade_to_free(user.user_id)

        assert result is True
        downgraded = auth_service.get_user(user.user_id)
        assert downgraded.plan == SubscriptionPlan.FREE

    def test_generate_api_key(self, auth_service):
        """APIキー生成"""
        user = auth_service.create_user("test@example.com")
        result = auth_service.generate_api_key(user.user_id, "test-key")

        assert result is not None
        raw_key, api_key = result
        assert raw_key.startswith("ect_")
        assert api_key.name == "test-key"
        assert api_key.user_id == user.user_id

    def test_validate_api_key(self, auth_service):
        """APIキー検証"""
        user = auth_service.create_user("test@example.com")
        raw_key, _ = auth_service.generate_api_key(user.user_id)

        validated_user = auth_service.validate_api_key(raw_key)
        assert validated_user is not None
        assert validated_user.user_id == user.user_id

    def test_validate_invalid_api_key(self, auth_service):
        """無効なAPIキー"""
        result = auth_service.validate_api_key("invalid_key")
        assert result is None

    def test_revoke_api_key(self, auth_service):
        """APIキー無効化"""
        user = auth_service.create_user("test@example.com")
        raw_key, api_key = auth_service.generate_api_key(user.user_id)

        # 無効化前は有効
        assert auth_service.validate_api_key(raw_key) is not None

        # 無効化
        result = auth_service.revoke_api_key(api_key.key_id)
        assert result is True

        # 無効化後は検証失敗
        assert auth_service.validate_api_key(raw_key) is None

    def test_persistence(self, temp_dir):
        """永続化テスト"""
        # 作成
        auth1 = AuthService(users_file=temp_dir / "users.json")
        user = auth1.create_user("test@example.com")
        auth1.generate_api_key(user.user_id, "test-key")

        # 再読み込み
        auth2 = AuthService(users_file=temp_dir / "users.json")
        loaded = auth2.get_user(user.user_id)

        assert loaded is not None
        assert loaded.email == "test@example.com"


class TestStripeService:
    """StripeServiceのテスト"""

    def test_is_configured_false(self):
        """未設定"""
        service = StripeService()
        assert service.is_configured() is False

    @patch.dict("os.environ", {
        "STRIPE_SECRET_KEY": "sk_test_xxx",
        "STRIPE_WEBHOOK_SECRET": "whsec_xxx",
    })
    def test_is_configured_true(self):
        """設定済み"""
        service = StripeService()
        assert service.is_configured() is True


class TestBillingManager:
    """BillingManagerのテスト"""

    @pytest.fixture
    def temp_dir(self):
        """一時ディレクトリ"""
        with tempfile.TemporaryDirectory() as td:
            yield Path(td)

    @pytest.fixture
    def billing_manager(self, temp_dir):
        """BillingManagerインスタンス"""
        auth = AuthService(users_file=temp_dir / "users.json")
        return BillingManager(auth_service=auth)

    def test_register_user(self, billing_manager):
        """ユーザー登録"""
        user, _ = billing_manager.register_user("test@example.com")
        assert user.email == "test@example.com"
        assert user.plan == SubscriptionPlan.FREE

    def test_get_user_status(self, billing_manager):
        """ユーザーステータス取得"""
        user, _ = billing_manager.register_user("test@example.com")
        status = billing_manager.get_user_status(user.user_id)

        assert status is not None
        assert status["email"] == "test@example.com"
        assert status["plan"] == "free"
        assert status["plan_name"] == "Free"
        assert status["is_active"] is True
        assert "limits" in status
        assert "usage" in status

    def test_get_user_status_not_found(self, billing_manager):
        """存在しないユーザー"""
        status = billing_manager.get_user_status("nonexistent")
        assert status is None

    def test_handle_checkout_completed(self, billing_manager):
        """Checkout完了処理"""
        user, _ = billing_manager.register_user("test@example.com")
        user.stripe_customer_id = "cus_123"
        billing_manager.auth._save_users()

        data = {
            "customer": "cus_123",
            "subscription": "sub_456",
        }

        result = billing_manager._handle_checkout_completed(data)
        assert result is True

        updated = billing_manager.auth.get_user(user.user_id)
        assert updated.plan == SubscriptionPlan.PRO
        assert updated.stripe_subscription_id == "sub_456"

    def test_handle_subscription_deleted(self, billing_manager):
        """サブスクリプション削除処理"""
        user, _ = billing_manager.register_user("test@example.com")
        billing_manager.auth.update_subscription(
            user.user_id,
            SubscriptionPlan.PRO,
            "sub_123",
            datetime.now() + timedelta(days=30),
        )

        data = {"id": "sub_123"}
        result = billing_manager._handle_subscription_deleted(data)
        assert result is True

        updated = billing_manager.auth.get_user(user.user_id)
        assert updated.plan == SubscriptionPlan.FREE


class TestAPIKey:
    """APIKeyクラスのテスト"""

    def test_create_api_key(self):
        """APIキー作成"""
        api_key = APIKey(
            key_id="key_123",
            user_id="user_456",
            key_hash="hash_abc",
            name="test-key",
        )
        assert api_key.key_id == "key_123"
        assert api_key.is_active is True
        assert api_key.last_used is None


class TestUserEdgeCases:
    """Userクラスのエッジケーステスト"""

    def test_is_subscription_active_no_expiry(self):
        """期限未設定（有料プランだが期限なし）"""
        user = User(
            user_id="test",
            email="test@example.com",
            plan=SubscriptionPlan.PRO,
            subscription_expires=None,
        )
        # 期限が設定されていない場合はFalse
        assert user.is_subscription_active() is False

    def test_enterprise_unlimited_api_calls(self):
        """ENTERPRISEプランの無制限API呼び出し"""
        user = User(
            user_id="test",
            email="test@example.com",
            plan=SubscriptionPlan.ENTERPRISE,
        )
        # 制限なし
        assert user.check_api_limit() is True
        # 大量に呼び出しても制限に達しない
        for _ in range(10000):
            user.increment_api_call()
        assert user.check_api_limit() is True

    def test_increment_api_call_over_limit(self):
        """制限超過後のインクリメント"""
        user = User(user_id="test", email="test@example.com")
        user.api_calls_today = 100  # FREEプランの制限
        # 制限超過
        result = user.increment_api_call()
        assert result is False
        assert user.api_calls_today == 100  # 増えない

    def test_can_use_feature_unknown(self):
        """不明な機能"""
        user = User(user_id="test", email="test@example.com")
        assert user.can_use_feature("unknown_feature") is False

    def test_can_use_feature_enterprise(self):
        """ENTERPRISEプランの全機能"""
        user = User(
            user_id="test",
            email="test@example.com",
            plan=SubscriptionPlan.ENTERPRISE,
        )
        assert user.can_use_feature("realtime_alerts") is True
        assert user.can_use_feature("custom_dashboard") is True
        assert user.can_use_feature("export_csv") is True
        assert user.can_use_feature("export_excel") is True
        assert user.can_use_feature("api_access") is True


class TestAuthServiceEdgeCases:
    """AuthServiceのエッジケーステスト"""

    @pytest.fixture
    def temp_dir(self):
        """一時ディレクトリ"""
        with tempfile.TemporaryDirectory() as td:
            yield Path(td)

    @pytest.fixture
    def auth_service(self, temp_dir):
        """AuthServiceインスタンス"""
        return AuthService(users_file=temp_dir / "users.json")

    def test_get_user_not_found(self, auth_service):
        """存在しないユーザー取得"""
        user = auth_service.get_user("nonexistent_id")
        assert user is None

    def test_get_user_by_email_not_found(self, auth_service):
        """存在しないメールでユーザー取得"""
        user = auth_service.get_user_by_email("nonexistent@example.com")
        assert user is None

    def test_update_subscription_user_not_found(self, auth_service):
        """存在しないユーザーのサブスクリプション更新"""
        result = auth_service.update_subscription(
            "nonexistent_id",
            SubscriptionPlan.PRO,
            "sub_123",
            datetime.now() + timedelta(days=30),
        )
        assert result is False

    def test_downgrade_to_free_user_not_found(self, auth_service):
        """存在しないユーザーのダウングレード"""
        result = auth_service.downgrade_to_free("nonexistent_id")
        assert result is False

    def test_generate_api_key_user_not_found(self, auth_service):
        """存在しないユーザーのAPIキー生成"""
        result = auth_service.generate_api_key("nonexistent_id", "test-key")
        assert result is None

    def test_revoke_nonexistent_api_key(self, auth_service):
        """存在しないAPIキーの無効化"""
        result = auth_service.revoke_api_key("nonexistent_key_id")
        assert result is False

    def test_cancel_subscription_success(self, auth_service):
        """サブスクリプションキャンセル成功（期間終了後にFREE）"""
        user = auth_service.create_user("test@example.com")
        auth_service.update_subscription(
            user.user_id,
            SubscriptionPlan.PRO,
            "sub_123",
            datetime.now() + timedelta(days=30),
        )
        # キャンセルリクエストは成功（即時ダウングレードではない）
        result = auth_service.cancel_subscription(user.user_id)
        assert result is True

    def test_cancel_subscription_user_not_found(self, auth_service):
        """存在しないユーザーのキャンセル"""
        result = auth_service.cancel_subscription("nonexistent_id")
        assert result is False


class TestBillingManagerEdgeCases:
    """BillingManagerのエッジケーステスト"""

    @pytest.fixture
    def temp_dir(self):
        """一時ディレクトリ"""
        with tempfile.TemporaryDirectory() as td:
            yield Path(td)

    @pytest.fixture
    def billing_manager(self, temp_dir):
        """BillingManagerインスタンス"""
        auth = AuthService(users_file=temp_dir / "users.json")
        return BillingManager(auth_service=auth)

    def test_handle_checkout_completed_customer_not_found(self, billing_manager):
        """存在しない顧客のCheckout完了"""
        data = {
            "customer": "cus_nonexistent",
            "subscription": "sub_456",
        }
        result = billing_manager._handle_checkout_completed(data)
        assert result is False

    def test_handle_subscription_deleted_not_found(self, billing_manager):
        """存在しないサブスクリプションの削除"""
        data = {"id": "sub_nonexistent"}
        result = billing_manager._handle_subscription_deleted(data)
        assert result is False

    def test_handle_subscription_updated(self, billing_manager):
        """サブスクリプション更新Webhookハンドラ"""
        user, _ = billing_manager.register_user("test@example.com")
        billing_manager.auth.update_subscription(
            user.user_id,
            SubscriptionPlan.PRO,
            "sub_update_test",
            datetime.now() + timedelta(days=30),
        )

        data = {
            "id": "sub_update_test",
            "status": "active",
            "current_period_end": (datetime.now() + timedelta(days=60)).timestamp()
        }
        result = billing_manager._handle_subscription_updated(data)
        assert result is True

    def test_handle_payment_failed(self, billing_manager):
        """支払い失敗Webhookハンドラ"""
        user, _ = billing_manager.register_user("test@example.com")
        user.stripe_customer_id = "cus_payment_fail"
        billing_manager.auth._save_users()

        data = {"customer": "cus_payment_fail"}
        result = billing_manager._handle_payment_failed(data)
        assert result is True

    def test_handle_webhook_event_checkout_completed(self, billing_manager):
        """Webhookイベント: checkout.session.completed"""
        user, _ = billing_manager.register_user("webhook@example.com")
        user.stripe_customer_id = "cus_webhook"
        billing_manager.auth._save_users()

        event = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "customer": "cus_webhook",
                    "subscription": "sub_webhook",
                }
            }
        }
        result = billing_manager.handle_webhook_event(event)
        assert result is True

    def test_upgrade_plan_without_stripe(self, billing_manager):
        """Stripe未設定時のアップグレード"""
        user, _ = billing_manager.register_user("upgrade@example.com")
        # Stripeが設定されていない場合はNone
        result = billing_manager.upgrade_plan(
            user.user_id,
            SubscriptionPlan.PRO,
            "https://success.url",
            "https://cancel.url",
        )
        assert result is None
