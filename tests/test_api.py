# -*- coding: utf-8 -*-
"""
REST APIのテスト
"""

import tempfile
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

import sys
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

# FastAPIテスト用
try:
    from fastapi.testclient import TestClient
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False

from auth import AuthService, BillingManager, SubscriptionPlan


@pytest.fixture
def temp_dir():
    """一時ディレクトリ"""
    with tempfile.TemporaryDirectory() as td:
        yield Path(td)


@pytest.fixture
def auth_service(temp_dir):
    """AuthServiceインスタンス"""
    return AuthService(users_file=temp_dir / "users.json")


@pytest.fixture
def billing_manager(auth_service):
    """BillingManagerインスタンス"""
    return BillingManager(auth_service=auth_service)


@pytest.fixture
def test_user(auth_service):
    """テストユーザー"""
    user = auth_service.create_user("test@example.com")
    raw_key, _ = auth_service.generate_api_key(user.user_id)
    return user, raw_key


@pytest.fixture
def pro_user(auth_service):
    """PROプランユーザー"""
    user = auth_service.create_user("pro@example.com")
    auth_service.update_subscription(
        user.user_id,
        SubscriptionPlan.PRO,
        "sub_test",
        datetime.now() + timedelta(days=30),
    )
    raw_key, _ = auth_service.generate_api_key(user.user_id)
    return user, raw_key


@pytest.mark.skipif(not FASTAPI_AVAILABLE, reason="FastAPI not installed")
class TestAPIEndpoints:
    """APIエンドポイントのテスト"""

    @pytest.fixture
    def client(self, temp_dir, monkeypatch):
        """テストクライアント"""
        # テスト用のユーザーファイルパスを設定
        monkeypatch.setenv("USERS_FILE", str(temp_dir / "users.json"))

        from api import create_app
        app = create_app()
        return TestClient(app)

    def test_root(self, client):
        """ルートエンドポイント"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "version" in data

    def test_health(self, client):
        """ヘルスチェック"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_get_plans(self, client):
        """プラン一覧取得"""
        response = client.get("/billing/plans")
        assert response.status_code == 200
        data = response.json()
        assert "plans" in data
        assert len(data["plans"]) == 3  # FREE, PRO, ENTERPRISE

        # 各プランの確認
        plan_ids = [p["id"] for p in data["plans"]]
        assert "free" in plan_ids
        assert "pro" in plan_ids
        assert "enterprise" in plan_ids

    def test_contact_endpoint_success(self, client):
        """お問い合わせエンドポイント - 正常系"""
        response = client.post(
            "/contact",
            json={
                "name": "テスト 太郎",
                "email": "test@example.com",
                "category": "general",
                "message": "これはテストメッセージです。"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "message" in data

    def test_contact_endpoint_invalid_email(self, client):
        """お問い合わせエンドポイント - 無効なメールアドレス"""
        response = client.post(
            "/contact",
            json={
                "name": "テスト",
                "email": "invalid-email",
                "category": "general",
                "message": "テスト"
            }
        )
        assert response.status_code == 422  # Validation Error

    def test_contact_endpoint_missing_fields(self, client):
        """お問い合わせエンドポイント - 必須フィールド欠落"""
        response = client.post(
            "/contact",
            json={
                "name": "テスト"
                # email, category, message が欠落
            }
        )
        assert response.status_code == 422  # Validation Error

    def test_contact_endpoint_all_categories(self, client):
        """お問い合わせエンドポイント - 全カテゴリテスト"""
        categories = [
            "general", "sales", "technical", "billing",
            "privacy", "bug", "feature", "partnership", "other"
        ]
        for category in categories:
            response = client.post(
                "/contact",
                json={
                    "name": "カテゴリテスト",
                    "email": "test@example.com",
                    "category": category,
                    "message": f"カテゴリ: {category}"
                }
            )
            assert response.status_code == 200


class TestAuthEndpoints:
    """認証エンドポイントのテスト（モック使用）"""

    def test_register_user_creates_user(self, auth_service):
        """ユーザー登録でユーザーが作成される"""
        user = auth_service.create_user("new@example.com")
        assert user is not None
        assert user.email == "new@example.com"
        assert user.plan == SubscriptionPlan.FREE

    def test_generate_api_key_returns_key(self, test_user, auth_service):
        """APIキー生成でキーが返される"""
        user, existing_key = test_user
        result = auth_service.generate_api_key(user.user_id, "new-key")
        assert result is not None
        raw_key, api_key = result
        assert raw_key.startswith("ect_")
        assert api_key.name == "new-key"

    def test_validate_api_key_success(self, test_user, auth_service):
        """有効なAPIキーの検証"""
        user, raw_key = test_user
        validated = auth_service.validate_api_key(raw_key)
        assert validated is not None
        assert validated.user_id == user.user_id

    def test_validate_api_key_failure(self, auth_service):
        """無効なAPIキーの検証"""
        validated = auth_service.validate_api_key("invalid_key_12345")
        assert validated is None


class TestPlanFeatures:
    """プラン機能のテスト"""

    def test_free_user_limits(self, test_user, auth_service):
        """FREEユーザーの制限"""
        user, _ = test_user
        limits = user.get_limits()
        assert limits.daily_reports == 10
        assert limits.categories == 2
        assert limits.realtime_alerts is False

    def test_pro_user_features(self, pro_user, auth_service):
        """PROユーザーの機能"""
        user, _ = pro_user
        limits = user.get_limits()
        assert limits.daily_reports == 100
        assert limits.realtime_alerts is True
        assert "csv" in limits.export_formats

    def test_api_limit_check(self, test_user, auth_service):
        """API呼び出し制限チェック"""
        user, _ = test_user

        # 制限内
        for _ in range(100):
            assert user.check_api_limit() is True
            user.increment_api_call()

        # 制限超過
        assert user.check_api_limit() is False


class TestBillingWorkflow:
    """課金ワークフローのテスト"""

    def test_checkout_completed_updates_plan(self, billing_manager, auth_service):
        """Checkout完了でプランが更新される"""
        user = auth_service.create_user("checkout@example.com")
        user.stripe_customer_id = "cus_test123"
        auth_service._save_users()

        data = {
            "customer": "cus_test123",
            "subscription": "sub_test456",
        }

        result = billing_manager._handle_checkout_completed(data)
        assert result is True

        updated = auth_service.get_user(user.user_id)
        assert updated.plan == SubscriptionPlan.PRO
        assert updated.stripe_subscription_id == "sub_test456"

    def test_subscription_deleted_downgrades_to_free(self, billing_manager, auth_service):
        """サブスクリプション削除でFREEにダウングレード"""
        user = auth_service.create_user("cancel@example.com")
        auth_service.update_subscription(
            user.user_id,
            SubscriptionPlan.PRO,
            "sub_cancel123",
            datetime.now() + timedelta(days=30),
        )

        data = {"id": "sub_cancel123"}

        result = billing_manager._handle_subscription_deleted(data)
        assert result is True

        downgraded = auth_service.get_user(user.user_id)
        assert downgraded.plan == SubscriptionPlan.FREE


class TestUserStatus:
    """ユーザーステータスのテスト"""

    def test_get_user_status(self, billing_manager, auth_service):
        """ユーザーステータス取得"""
        user, _ = billing_manager.register_user("status@example.com")
        status = billing_manager.get_user_status(user.user_id)

        assert status is not None
        assert status["email"] == "status@example.com"
        assert status["plan"] == "free"
        assert status["is_active"] is True
        assert "limits" in status
        assert "usage" in status

    def test_get_user_status_with_pro(self, billing_manager, auth_service):
        """PROユーザーのステータス"""
        user, _ = billing_manager.register_user("pro-status@example.com")
        auth_service.update_subscription(
            user.user_id,
            SubscriptionPlan.PRO,
            "sub_pro",
            datetime.now() + timedelta(days=30),
        )

        status = billing_manager.get_user_status(user.user_id)
        assert status["plan"] == "pro"
        assert status["plan_name"] == "Pro"
        assert status["limits"]["realtime_alerts"] is True
