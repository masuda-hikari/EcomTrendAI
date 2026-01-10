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


class TestWebhookHandling:
    """Webhook処理のテスト"""

    def test_handle_unknown_webhook_event(self, billing_manager):
        """未知のWebhookイベント処理"""
        event = {
            "type": "unknown.event.type",
            "data": {"object": {}}
        }
        result = billing_manager.handle_webhook_event(event)
        assert result is True  # 未知イベントは無視

    def test_handle_subscription_updated(self, billing_manager, auth_service):
        """サブスクリプション更新Webhook"""
        user = auth_service.create_user("webhook@example.com")
        auth_service.update_subscription(
            user.user_id,
            SubscriptionPlan.PRO,
            "sub_update_test",
            datetime.now() + timedelta(days=30),
        )

        event = {
            "type": "customer.subscription.updated",
            "data": {
                "object": {
                    "id": "sub_update_test",
                    "status": "active",
                    "current_period_end": (datetime.now() + timedelta(days=60)).timestamp()
                }
            }
        }
        result = billing_manager.handle_webhook_event(event)
        assert result is True

    def test_handle_payment_failed(self, billing_manager, auth_service):
        """支払い失敗Webhook"""
        user = auth_service.create_user("payment-fail@example.com")
        user.stripe_customer_id = "cus_payment_fail"
        auth_service._save_users()

        event = {
            "type": "invoice.payment_failed",
            "data": {
                "object": {
                    "customer": "cus_payment_fail"
                }
            }
        }
        result = billing_manager.handle_webhook_event(event)
        assert result is True


@pytest.mark.skipif(not FASTAPI_AVAILABLE, reason="FastAPI not installed")
class TestAPITrends:
    """トレンドAPIのテスト"""

    @pytest.fixture
    def client(self, temp_dir, monkeypatch):
        """テストクライアント"""
        monkeypatch.setenv("USERS_FILE", str(temp_dir / "users.json"))

        from api import create_app
        app = create_app()
        return TestClient(app)

    def test_get_trends_requires_auth(self, client):
        """トレンド取得には認証が必要"""
        response = client.get("/trends")
        assert response.status_code == 401

    def test_get_trends_with_invalid_key(self, client):
        """無効なAPIキーでは拒否"""
        response = client.get(
            "/trends",
            headers={"X-API-Key": "invalid_key_12345"}
        )
        assert response.status_code == 401


@pytest.mark.skipif(not FASTAPI_AVAILABLE, reason="FastAPI not installed")
class TestAPIBilling:
    """課金APIのテスト"""

    @pytest.fixture
    def client(self, temp_dir, monkeypatch):
        """テストクライアント"""
        monkeypatch.setenv("USERS_FILE", str(temp_dir / "users.json"))

        from api import create_app
        app = create_app()
        return TestClient(app)

    def test_get_plans_has_price(self, client):
        """プラン一覧に価格が含まれる"""
        response = client.get("/billing/plans")
        assert response.status_code == 200
        data = response.json()

        for plan in data["plans"]:
            assert "id" in plan
            assert "name" in plan
            assert "price_jpy" in plan


@pytest.mark.skipif(not FASTAPI_AVAILABLE, reason="FastAPI not installed")
class TestAPIUsersFlow:
    """ユーザーフローのテスト"""

    def test_register_duplicate_email_fails(self, temp_dir, monkeypatch):
        """重複メールアドレスでの登録失敗"""
        monkeypatch.setenv("USERS_FILE", str(temp_dir / "users_dup.json"))

        from api import create_app
        app = create_app()
        client = TestClient(app)

        # ユニークなメールアドレスを使用（UUID）
        import uuid
        email = f"dup_{uuid.uuid4().hex[:8]}@example.com"

        # 1回目
        client.post("/users/register", json={"email": email})
        # 2回目
        response = client.post("/users/register", json={"email": email})
        assert response.status_code == 400

    def test_get_current_user_requires_auth(self, temp_dir, monkeypatch):
        """現在のユーザー情報取得には認証が必要"""
        monkeypatch.setenv("USERS_FILE", str(temp_dir / "users_auth.json"))

        from api import create_app
        app = create_app()
        client = TestClient(app)

        response = client.get("/users/me")
        assert response.status_code == 401

    def test_register_user_returns_api_key(self, temp_dir, monkeypatch):
        """新規登録でAPIキーが返される"""
        monkeypatch.setenv("USERS_FILE", str(temp_dir / "users_reg.json"))

        from api import create_app
        app = create_app()
        client = TestClient(app)

        # ユニークなメールアドレスを使用（UUID）
        import uuid
        email = f"new_{uuid.uuid4().hex[:8]}@example.com"

        response = client.post("/users/register", json={"email": email})
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "api_key" in data
        assert data["api_key"].startswith("ect_")
        assert data["plan"] == "free"

    def test_get_current_user_with_auth(self, temp_dir, monkeypatch):
        """認証済みユーザー情報取得"""
        monkeypatch.setenv("USERS_FILE", str(temp_dir / "users_me.json"))

        from api import create_app
        app = create_app()
        client = TestClient(app)

        # ユニークなメールアドレスを使用（UUID）
        import uuid
        email = f"me_{uuid.uuid4().hex[:8]}@example.com"

        # 登録
        reg_resp = client.post("/users/register", json={"email": email})
        assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.json()}"
        api_key = reg_resp.json()["api_key"]

        # 現在のユーザー取得
        response = client.get("/users/me", headers={"X-API-Key": api_key})
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == email
        assert data["plan"] == "free"

    def test_create_api_key(self, temp_dir, monkeypatch):
        """新しいAPIキー作成"""
        monkeypatch.setenv("USERS_FILE", str(temp_dir / "users_apikey.json"))

        from api import create_app
        app = create_app()
        client = TestClient(app)

        # ユニークなメールアドレスを使用（UUID）
        import uuid
        email = f"apikey_{uuid.uuid4().hex[:8]}@example.com"

        # 登録
        reg_resp = client.post("/users/register", json={"email": email})
        assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.json()}"
        api_key = reg_resp.json()["api_key"]

        # 新しいAPIキー作成
        response = client.post(
            "/users/api-keys",
            json={"name": "test-key"},
            headers={"X-API-Key": api_key}
        )
        assert response.status_code == 200
        data = response.json()
        assert "key_id" in data
        assert "key" in data
        assert data["name"] == "test-key"

    def test_revoke_api_key(self, temp_dir, monkeypatch):
        """APIキー無効化"""
        monkeypatch.setenv("USERS_FILE", str(temp_dir / "users_revoke.json"))

        from api import create_app
        app = create_app()
        client = TestClient(app)

        # ユニークなメールアドレスを使用（UUID）
        import uuid
        email = f"revoke_{uuid.uuid4().hex[:8]}@example.com"

        # 登録
        reg_resp = client.post("/users/register", json={"email": email})
        assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.json()}"
        api_key = reg_resp.json()["api_key"]

        # 新しいAPIキー作成
        create_resp = client.post(
            "/users/api-keys",
            json={"name": "revoke-key"},
            headers={"X-API-Key": api_key}
        )
        key_id = create_resp.json()["key_id"]

        # APIキー無効化
        response = client.delete(
            f"/users/api-keys/{key_id}",
            headers={"X-API-Key": api_key}
        )
        assert response.status_code == 200

    def test_revoke_nonexistent_api_key(self, temp_dir, monkeypatch):
        """存在しないAPIキー無効化"""
        monkeypatch.setenv("USERS_FILE", str(temp_dir / "users_revoke2.json"))

        from api import create_app
        app = create_app()
        client = TestClient(app)

        # ユニークなメールアドレスを使用（UUID）
        import uuid
        email = f"revoke2_{uuid.uuid4().hex[:8]}@example.com"

        # 登録
        reg_resp = client.post("/users/register", json={"email": email})
        assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.json()}"
        api_key = reg_resp.json()["api_key"]

        # 存在しないキー無効化
        response = client.delete(
            "/users/api-keys/nonexistent_key_id",
            headers={"X-API-Key": api_key}
        )
        assert response.status_code == 404


@pytest.mark.skipif(not FASTAPI_AVAILABLE, reason="FastAPI not installed")
class TestAPIBillingEndpoints:
    """課金エンドポイントのテスト"""

    def test_upgrade_plan_invalid_plan(self, temp_dir, monkeypatch):
        """無効なプランへのアップグレード"""
        monkeypatch.setenv("USERS_FILE", str(temp_dir / "users_upgrade.json"))

        from api import create_app
        app = create_app()
        client = TestClient(app)

        # ユニークなメールアドレスを使用（UUID）
        import uuid
        email = f"upgrade_{uuid.uuid4().hex[:8]}@example.com"

        # 登録
        reg_resp = client.post("/users/register", json={"email": email})
        assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.json()}"
        api_key = reg_resp.json()["api_key"]

        # 無効なプラン
        response = client.post(
            "/billing/upgrade",
            json={"plan": "invalid_plan"},
            headers={"X-API-Key": api_key}
        )
        assert response.status_code == 400

    def test_upgrade_to_free_fails(self, temp_dir, monkeypatch):
        """FREEプランへのアップグレードは失敗"""
        monkeypatch.setenv("USERS_FILE", str(temp_dir / "users_upgrade2.json"))

        from api import create_app
        app = create_app()
        client = TestClient(app)

        # ユニークなメールアドレスを使用（UUID）
        import uuid
        email = f"upgrade2_{uuid.uuid4().hex[:8]}@example.com"

        # 登録
        reg_resp = client.post("/users/register", json={"email": email})
        assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.json()}"
        api_key = reg_resp.json()["api_key"]

        # FREEへのアップグレード
        response = client.post(
            "/billing/upgrade",
            json={"plan": "free"},
            headers={"X-API-Key": api_key}
        )
        assert response.status_code == 400

    def test_cancel_free_subscription_fails(self, temp_dir, monkeypatch):
        """FREEプランのキャンセルは失敗"""
        monkeypatch.setenv("USERS_FILE", str(temp_dir / "users_cancel.json"))

        from api import create_app
        app = create_app()
        client = TestClient(app)

        # ユニークなメールアドレスを使用（UUID）
        import uuid
        email = f"cancel_{uuid.uuid4().hex[:8]}@example.com"

        # 登録
        reg_resp = client.post("/users/register", json={"email": email})
        assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.json()}"
        api_key = reg_resp.json()["api_key"]

        # FREEプランキャンセル
        response = client.post(
            "/billing/cancel",
            headers={"X-API-Key": api_key}
        )
        assert response.status_code == 400


@pytest.mark.skipif(not FASTAPI_AVAILABLE, reason="FastAPI not installed")
class TestAPITrendsEndpoints:
    """トレンドエンドポイントのテスト"""

    @pytest.fixture
    def authenticated_client(self, temp_dir, monkeypatch):
        """認証済みテストクライアント"""
        monkeypatch.setenv("USERS_FILE", str(temp_dir / "users_trends.json"))

        from api import create_app
        app = create_app()
        client = TestClient(app)

        # ユニークなメールアドレスを使用（UUID）
        import uuid
        email = f"trends_{uuid.uuid4().hex[:8]}@example.com"

        # 登録
        reg_resp = client.post("/users/register", json={"email": email})
        assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.json()}"
        api_key = reg_resp.json()["api_key"]

        return client, api_key

    def test_get_trends_authenticated(self, authenticated_client):
        """認証済みトレンド取得"""
        client, api_key = authenticated_client

        response = client.get("/trends", headers={"X-API-Key": api_key})
        assert response.status_code == 200
        data = response.json()
        assert "date" in data
        assert "count" in data
        assert "trends" in data

    def test_get_trends_with_bearer_auth(self, authenticated_client):
        """Bearerトークンでのトレンド取得"""
        client, api_key = authenticated_client

        response = client.get(
            "/trends",
            headers={"Authorization": f"Bearer {api_key}"}
        )
        assert response.status_code == 200

    def test_get_trends_with_limit(self, authenticated_client):
        """件数制限付きトレンド取得"""
        client, api_key = authenticated_client

        response = client.get(
            "/trends?limit=5",
            headers={"X-API-Key": api_key}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["count"] <= 5

    def test_get_category_trends(self, authenticated_client):
        """カテゴリ別トレンド取得"""
        client, api_key = authenticated_client

        response = client.get(
            "/trends/categories",
            headers={"X-API-Key": api_key}
        )
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data

    def test_significant_movers_requires_pro(self, authenticated_client):
        """大幅変動商品はPRO以上が必要"""
        client, api_key = authenticated_client

        response = client.get(
            "/trends/significant",
            headers={"X-API-Key": api_key}
        )
        # FREEユーザーは403
        assert response.status_code == 403

    def test_export_csv_requires_pro(self, authenticated_client):
        """CSV出力はPRO以上が必要"""
        client, api_key = authenticated_client

        response = client.get(
            "/export/csv",
            headers={"X-API-Key": api_key}
        )
        # FREEユーザーは403
        assert response.status_code == 403

    def test_export_json_requires_pro(self, authenticated_client):
        """JSON出力はPRO以上が必要"""
        client, api_key = authenticated_client

        response = client.get(
            "/export/json",
            headers={"X-API-Key": api_key}
        )
        # FREEユーザーは403
        assert response.status_code == 403


@pytest.mark.skipif(not FASTAPI_AVAILABLE, reason="FastAPI not installed")
class TestNewsletterEndpoints:
    """ニュースレターエンドポイントのテスト"""

    @pytest.fixture
    def client(self, temp_dir, monkeypatch):
        """テストクライアント"""
        monkeypatch.setenv("USERS_FILE", str(temp_dir / "users_newsletter.json"))
        # データディレクトリをテンポラリに設定
        monkeypatch.chdir(temp_dir)
        (temp_dir / "data").mkdir(exist_ok=True)

        from api import create_app
        app = create_app()
        return TestClient(app)

    def test_newsletter_subscribe_success(self, client):
        """ニュースレター購読登録 - 正常系"""
        response = client.post(
            "/api/newsletter/subscribe",
            json={"email": "subscribe@example.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "message" in data

    def test_newsletter_subscribe_invalid_email(self, client):
        """ニュースレター購読登録 - 無効なメール"""
        response = client.post(
            "/api/newsletter/subscribe",
            json={"email": "invalid-email"}
        )
        assert response.status_code == 422  # Validation Error

    def test_newsletter_subscribe_duplicate(self, client):
        """ニュースレター購読登録 - 重複登録"""
        email = "duplicate@example.com"

        # 1回目
        response1 = client.post(
            "/api/newsletter/subscribe",
            json={"email": email}
        )
        assert response1.status_code == 200

        # 2回目（重複）
        response2 = client.post(
            "/api/newsletter/subscribe",
            json={"email": email}
        )
        assert response2.status_code == 200
        data = response2.json()
        assert data["success"] is True
        assert data.get("already_subscribed") is True


@pytest.mark.skipif(not FASTAPI_AVAILABLE, reason="FastAPI not installed")
class TestHealthEndpoints:
    """ヘルスチェックエンドポイントのテスト"""

    @pytest.fixture
    def client(self, temp_dir, monkeypatch):
        """テストクライアント"""
        monkeypatch.setenv("USERS_FILE", str(temp_dir / "users_health.json"))
        monkeypatch.chdir(temp_dir)
        (temp_dir / "data").mkdir(exist_ok=True)

        from api import create_app
        app = create_app()
        return TestClient(app)

    def test_health_detailed(self, client):
        """詳細ヘルスチェック"""
        response = client.get("/health/detailed")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "checks" in data
        assert "timestamp" in data

        # 各チェック項目の存在確認
        checks = data["checks"]
        assert "data_directory" in checks
        assert "auth_service" in checks
        assert "stripe" in checks
        assert "email" in checks
        assert "system" in checks

    def test_metrics_endpoint(self, client):
        """メトリクスエンドポイント"""
        response = client.get("/metrics")
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/plain; charset=utf-8"

        content = response.text
        assert "ecomtrend_users_total" in content
        assert "ecomtrend_subscribers_total" in content
        assert "ecomtrend_api_up 1" in content
