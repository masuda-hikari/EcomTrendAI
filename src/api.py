# -*- coding: utf-8 -*-
"""
REST API エンドポイント

FastAPI/Flaskベースの認証付きAPIサーバー
サブスクリプションプランに基づく機能制限を実装
"""

import os
from datetime import datetime
from functools import wraps
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from loguru import logger

load_dotenv()

# FastAPIが利用可能かチェック
try:
    from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    from pydantic import BaseModel, EmailStr
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    logger.warning("FastAPIがインストールされていません。pip install fastapi uvicorn")

from auth import AuthService, BillingManager, StripeService, SubscriptionPlan, User


# === Pydanticモデル ===

if FASTAPI_AVAILABLE:
    class ContactRequest(BaseModel):
        """お問い合わせリクエスト"""
        name: str
        email: EmailStr
        category: str
        message: str

    class NewsletterSubscribeRequest(BaseModel):
        """ニュースレター購読リクエスト"""
        email: EmailStr

    class UserRegisterRequest(BaseModel):
        """ユーザー登録リクエスト"""
        email: EmailStr

    class UserResponse(BaseModel):
        """ユーザーレスポンス"""
        user_id: str
        email: str
        plan: str
        plan_name: str
        is_active: bool
        expires: Optional[str]
        api_key: Optional[str] = None

    class APIKeyRequest(BaseModel):
        """APIキー生成リクエスト"""
        name: str = "default"

    class APIKeyResponse(BaseModel):
        """APIキーレスポンス"""
        key_id: str
        key: str
        name: str
        created_at: str

    class UpgradeRequest(BaseModel):
        """アップグレードリクエスト"""
        plan: str
        success_url: str = "https://ecomtrend.ai/success"
        cancel_url: str = "https://ecomtrend.ai/cancel"

    class TrendItem(BaseModel):
        """トレンドアイテム"""
        name: str
        asin: str
        category: str
        current_rank: int
        rank_change_percent: float
        price: Optional[float]
        trend_score: float
        affiliate_url: str

    class TrendsResponse(BaseModel):
        """トレンドレスポンス"""
        date: str
        count: int
        trends: list[TrendItem]

    class StatusResponse(BaseModel):
        """ステータスレスポンス"""
        status: str
        version: str
        timestamp: str


# === アプリケーション ===

def create_app() -> "FastAPI":
    """FastAPIアプリケーションを作成"""
    if not FASTAPI_AVAILABLE:
        raise ImportError("FastAPIがインストールされていません")

    app = FastAPI(
        title="EcomTrendAI API",
        description="Eコマーストレンド分析API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS設定
    app.add_middleware(
        CORSMiddleware,
        allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # サービスインスタンス
    auth_service = AuthService()
    billing_manager = BillingManager(auth_service)

    # === 依存関係 ===

    async def get_current_user(
        x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
        authorization: Optional[str] = Header(None),
    ) -> User:
        """APIキーからユーザーを取得"""
        api_key = x_api_key

        # Authorizationヘッダーからも取得
        if not api_key and authorization:
            if authorization.startswith("Bearer "):
                api_key = authorization[7:]

        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="APIキーが必要です",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = auth_service.validate_api_key(api_key)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="無効なAPIキーです",
            )

        if not user.is_subscription_active():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="サブスクリプションが有効ではありません",
            )

        return user

    async def check_api_limit(user: User = Depends(get_current_user)) -> User:
        """API呼び出し制限をチェック"""
        if not user.check_api_limit():
            limits = user.get_limits()
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"API呼び出し上限({limits.api_calls_per_day}/日)に達しました",
            )
        user.increment_api_call()
        auth_service._save_users()
        return user

    def require_plan(*plans: SubscriptionPlan):
        """特定プラン以上が必要"""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, user: User = Depends(get_current_user), **kwargs):
                if user.plan not in plans:
                    plan_names = [p.value for p in plans]
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"この機能には {', '.join(plan_names)} プラン以上が必要です",
                    )
                return await func(*args, user=user, **kwargs)
            return wrapper
        return decorator

    # === エンドポイント: 公開 ===

    @app.get("/", response_model=StatusResponse, tags=["General"])
    async def root():
        """APIステータス"""
        return {
            "status": "ok",
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat(),
        }

    @app.get("/health", tags=["General"])
    async def health():
        """ヘルスチェック"""
        return {"status": "healthy"}

    @app.get("/health/detailed", tags=["General"])
    async def health_detailed():
        """
        詳細ヘルスチェック

        各コンポーネントの状態を確認し、監視システム用の情報を返します。
        """
        import json
        from pathlib import Path
        import sys

        checks = {}
        overall_status = "healthy"

        # 1. データディレクトリチェック
        data_dir = Path("data")
        checks["data_directory"] = {
            "status": "healthy" if data_dir.exists() else "warning",
            "exists": data_dir.exists(),
            "writable": data_dir.exists() and os.access(data_dir, os.W_OK),
        }

        # 2. 購読者ファイルチェック
        subscribers_file = Path("data/subscribers.json")
        subscriber_count = 0
        if subscribers_file.exists():
            try:
                with open(subscribers_file, "r", encoding="utf-8") as f:
                    subscribers = json.load(f)
                    subscriber_count = len(subscribers)
                checks["subscribers"] = {"status": "healthy", "count": subscriber_count}
            except Exception as e:
                checks["subscribers"] = {"status": "warning", "error": str(e)}
        else:
            checks["subscribers"] = {"status": "healthy", "count": 0}

        # 3. 認証サービスチェック
        try:
            auth_service = AuthService()
            user_count = len(auth_service.users)
            checks["auth_service"] = {"status": "healthy", "user_count": user_count}
        except Exception as e:
            checks["auth_service"] = {"status": "unhealthy", "error": str(e)}
            overall_status = "degraded"

        # 4. Stripe接続チェック
        stripe_key = os.getenv("STRIPE_SECRET_KEY", "")
        if stripe_key and stripe_key.startswith("sk_"):
            checks["stripe"] = {
                "status": "healthy",
                "mode": "test" if "test" in stripe_key else "live",
            }
        else:
            checks["stripe"] = {"status": "warning", "message": "未設定"}

        # 5. メール設定チェック
        smtp_host = os.getenv("SMTP_HOST", "")
        checks["email"] = {
            "status": "healthy" if smtp_host else "warning",
            "configured": bool(smtp_host),
        }

        # 6. システム情報
        checks["system"] = {
            "python_version": sys.version,
            "timestamp": datetime.now().isoformat(),
        }

        # 全体ステータス判定
        for check in checks.values():
            if isinstance(check, dict) and check.get("status") == "unhealthy":
                overall_status = "unhealthy"
                break

        return {
            "status": overall_status,
            "checks": checks,
            "timestamp": datetime.now().isoformat(),
        }

    @app.get("/metrics", tags=["General"])
    async def metrics():
        """
        Prometheusメトリクス形式

        監視システム（Prometheus/Grafana）用のメトリクスを返します。
        """
        import json
        from pathlib import Path

        lines = []

        # ユーザー数
        try:
            auth_service = AuthService()
            lines.append(f"ecomtrend_users_total {len(auth_service.users)}")
        except Exception:
            lines.append("ecomtrend_users_total 0")

        # 購読者数
        subscribers_file = Path("data/subscribers.json")
        subscriber_count = 0
        if subscribers_file.exists():
            try:
                with open(subscribers_file, "r", encoding="utf-8") as f:
                    subscribers = json.load(f)
                    subscriber_count = len(subscribers)
            except Exception:
                pass
        lines.append(f"ecomtrend_subscribers_total {subscriber_count}")

        # API稼働状態
        lines.append("ecomtrend_api_up 1")

        from fastapi.responses import PlainTextResponse
        return PlainTextResponse("\n".join(lines) + "\n", media_type="text/plain")

    # === エンドポイント: お問い合わせ ===

    @app.post("/contact", tags=["Contact"])
    async def submit_contact(request: ContactRequest):
        """
        お問い合わせフォームからの送信を処理

        - メールアドレス・内容のバリデーション
        - 管理者へのメール通知
        - 自動返信メール送信
        """
        from distributor import DistributionConfig, EmailDistributor

        config = DistributionConfig.from_env()

        # カテゴリ名のマッピング
        category_names = {
            "general": "一般的なお問い合わせ",
            "sales": "サービス・料金について",
            "technical": "技術的な質問",
            "billing": "請求・支払いについて",
            "privacy": "個人情報について",
            "bug": "不具合の報告",
            "feature": "機能リクエスト",
            "partnership": "提携・協業について",
            "other": "その他",
        }
        category_name = category_names.get(request.category, request.category)

        # 管理者向けメール内容
        admin_subject = f"[EcomTrendAI] お問い合わせ: {category_name}"
        admin_content = f"""
EcomTrendAIへのお問い合わせがありました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【お問い合わせ内容】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ お名前: {request.name}
■ メールアドレス: {request.email}
■ 種別: {category_name}

■ 内容:
{request.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※このメールはシステムから自動送信されています。
"""

        admin_html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
<h2 style="color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">
お問い合わせ通知
</h2>
<p>EcomTrendAIへのお問い合わせがありました。</p>
<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
<tr style="background: #f9fafb;">
<td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">お名前</td>
<td style="padding: 12px; border: 1px solid #e5e7eb;">{request.name}</td>
</tr>
<tr>
<td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">メールアドレス</td>
<td style="padding: 12px; border: 1px solid #e5e7eb;"><a href="mailto:{request.email}">{request.email}</a></td>
</tr>
<tr style="background: #f9fafb;">
<td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">種別</td>
<td style="padding: 12px; border: 1px solid #e5e7eb;">{category_name}</td>
</tr>
</table>
<div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
<h3 style="margin-top: 0;">お問い合わせ内容</h3>
<p style="white-space: pre-wrap;">{request.message}</p>
</div>
<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
<p style="color: #6b7280; font-size: 12px;">このメールはシステムから自動送信されています。</p>
</div>
</body>
</html>
"""

        # メール送信処理
        email_sent = False
        if config.is_email_configured():
            try:
                distributor = EmailDistributor(config)
                email_sent = distributor.send(admin_subject, admin_content, admin_html)
            except Exception as e:
                logger.error(f"お問い合わせメール送信失敗: {e}")

        # 送信結果をログ
        logger.info(f"お問い合わせ受信: {request.email} / {category_name}")

        return {
            "success": True,
            "message": "お問い合わせを受け付けました。2営業日以内にご返信いたします。",
            "email_notification": email_sent,
        }

    # === エンドポイント: ニュースレター ===

    @app.post("/api/newsletter/subscribe", tags=["Newsletter"])
    async def subscribe_newsletter(request: NewsletterSubscribeRequest):
        """
        ニュースレター購読登録

        無料トレンドレポートの購読を登録します。
        - メールアドレスのバリデーション
        - 重複チェック
        - 確認メール送信
        """
        import json
        from pathlib import Path

        # 購読者データファイル
        subscribers_file = Path("data/subscribers.json")
        subscribers_file.parent.mkdir(parents=True, exist_ok=True)

        # 既存購読者の読み込み
        subscribers = []
        if subscribers_file.exists():
            try:
                with open(subscribers_file, "r", encoding="utf-8") as f:
                    subscribers = json.load(f)
            except (json.JSONDecodeError, IOError):
                subscribers = []

        # 重複チェック
        existing_emails = [s.get("email") for s in subscribers]
        if request.email in existing_emails:
            return {
                "success": True,
                "message": "既に登録済みです。毎朝8時にトレンドレポートをお届けしています。",
                "already_subscribed": True,
            }

        # 新規購読者追加
        new_subscriber = {
            "email": request.email,
            "subscribed_at": datetime.now().isoformat(),
            "status": "active",
            "source": "website",
        }
        subscribers.append(new_subscriber)

        # 保存
        with open(subscribers_file, "w", encoding="utf-8") as f:
            json.dump(subscribers, f, ensure_ascii=False, indent=2)

        logger.info(f"ニュースレター購読: {request.email}")

        # 確認メール送信（設定されている場合）
        email_sent = False
        from distributor import DistributionConfig, EmailDistributor

        config = DistributionConfig.from_env()
        if config.is_email_configured():
            try:
                distributor = EmailDistributor(config)
                # 購読者への確認メール
                subject = "【EcomTrendAI】トレンドレポート購読ありがとうございます"
                content = f"""
{request.email} 様

EcomTrendAI トレンドレポートにご登録いただきありがとうございます！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【ご登録内容】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 配信内容: Eコマーストレンドレポート
■ 配信頻度: 毎朝8時（日本時間）
■ 配信形式: メール

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【明日からお届けする内容】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ 急上昇商品TOP10
✓ カテゴリ別トレンド
✓ 週間まとめ（毎週月曜日）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

より詳細な分析やリアルタイムアラートをご希望の方は
Proプランをご検討ください。

https://ecomtrend.ai/pricing

配信停止はこちら:
https://ecomtrend.ai/unsubscribe?email={request.email}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EcomTrendAI - AIトレンド分析
https://ecomtrend.ai
"""
                email_sent = distributor.send(subject, content)
            except Exception as e:
                logger.error(f"確認メール送信失敗: {e}")

        return {
            "success": True,
            "message": "登録が完了しました！明日から毎朝8時にトレンドレポートをお届けします。",
            "email_notification": email_sent,
        }

    # === エンドポイント: ユーザー管理 ===

    @app.post("/users/register", response_model=UserResponse, tags=["Users"])
    async def register_user(request: UserRegisterRequest):
        """
        新規ユーザー登録

        FREEプランで登録され、APIキーが発行されます。
        """
        # 既存チェック
        existing = auth_service.get_user_by_email(request.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="このメールアドレスは既に登録されています",
            )

        user, _ = billing_manager.register_user(request.email)

        # 初回APIキー発行
        raw_key, api_key = auth_service.generate_api_key(user.user_id, "default")

        return {
            "user_id": user.user_id,
            "email": user.email,
            "plan": user.plan.value,
            "plan_name": "Free",
            "is_active": True,
            "expires": None,
            "api_key": raw_key,  # 初回のみ表示
        }

    @app.get("/users/me", tags=["Users"])
    async def get_current_user_info(user: User = Depends(get_current_user)):
        """現在のユーザー情報を取得"""
        return billing_manager.get_user_status(user.user_id)

    @app.post("/users/api-keys", response_model=APIKeyResponse, tags=["Users"])
    async def create_api_key(
        request: APIKeyRequest,
        user: User = Depends(get_current_user),
    ):
        """新しいAPIキーを生成"""
        result = auth_service.generate_api_key(user.user_id, request.name)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="APIキーの生成に失敗しました",
            )

        raw_key, api_key = result
        return {
            "key_id": api_key.key_id,
            "key": raw_key,
            "name": api_key.name,
            "created_at": api_key.created_at.isoformat(),
        }

    @app.delete("/users/api-keys/{key_id}", tags=["Users"])
    async def revoke_api_key(
        key_id: str,
        user: User = Depends(get_current_user),
    ):
        """APIキーを無効化"""
        success = auth_service.revoke_api_key(key_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="APIキーが見つかりません",
            )
        return {"message": "APIキーを無効化しました"}

    # === エンドポイント: 課金 ===

    @app.post("/billing/upgrade", tags=["Billing"])
    async def upgrade_plan(
        request: UpgradeRequest,
        user: User = Depends(get_current_user),
    ):
        """
        プランをアップグレード

        Stripeチェックアウトページへのリダイレクトを行います。
        """
        try:
            plan = SubscriptionPlan(request.plan)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"無効なプラン: {request.plan}",
            )

        if plan == SubscriptionPlan.FREE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="FREEプランへのアップグレードはできません",
            )

        checkout_url = billing_manager.upgrade_plan(
            user.user_id,
            plan,
            request.success_url,
            request.cancel_url,
        )

        if not checkout_url:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="決済サービスが利用できません",
            )

        return {"checkout_url": checkout_url}

    @app.post("/billing/cancel", tags=["Billing"])
    async def cancel_subscription(user: User = Depends(get_current_user)):
        """サブスクリプションをキャンセル"""
        if user.plan == SubscriptionPlan.FREE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="FREEプランはキャンセルできません",
            )

        success = auth_service.cancel_subscription(user.user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="キャンセル処理に失敗しました",
            )

        return {"message": "サブスクリプションをキャンセルしました。期間終了後にFREEプランに戻ります。"}

    @app.get("/billing/plans", tags=["Billing"])
    async def get_plans():
        """利用可能なプラン一覧"""
        from auth import PLAN_LIMITS

        plans = []
        for plan, limits in PLAN_LIMITS.items():
            plans.append({
                "id": plan.value,
                "name": {
                    SubscriptionPlan.FREE: "Free",
                    SubscriptionPlan.PRO: "Pro",
                    SubscriptionPlan.ENTERPRISE: "Enterprise",
                }[plan],
                "price_jpy": limits.price_jpy,
                "features": {
                    "daily_reports": limits.daily_reports,
                    "categories": limits.categories,
                    "api_calls_per_day": limits.api_calls_per_day,
                    "realtime_alerts": limits.realtime_alerts,
                    "custom_dashboard": limits.custom_dashboard,
                    "export_formats": limits.export_formats,
                    "support_level": limits.support_level,
                },
            })
        return {"plans": plans}

    # === エンドポイント: Webhook ===

    @app.post("/webhooks/stripe", tags=["Webhooks"])
    async def stripe_webhook(request: Request):
        """Stripe Webhookエンドポイント"""
        stripe_service = StripeService()

        payload = await request.body()
        sig_header = request.headers.get("Stripe-Signature", "")

        event = stripe_service.verify_webhook_signature(payload, sig_header)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid signature",
            )

        billing_manager.handle_webhook_event(event)
        return {"received": True}

    # === エンドポイント: トレンドAPI ===

    @app.get("/trends", response_model=TrendsResponse, tags=["Trends"])
    async def get_trends(
        limit: int = 20,
        category: Optional[str] = None,
        user: User = Depends(check_api_limit),
    ):
        """
        最新のトレンドデータを取得

        - **limit**: 取得件数（デフォルト20、FREEプランは10まで）
        - **category**: カテゴリフィルタ
        """
        from analyzer import TrendAnalyzer
        from config import get_affiliate_url

        limits = user.get_limits()

        # プランによる制限
        if limits.daily_reports != -1:
            limit = min(limit, limits.daily_reports)

        analyzer = TrendAnalyzer()
        trends = analyzer.analyze_trends(top_n=limit)

        # カテゴリフィルタ
        if category:
            # プランによるカテゴリ制限
            if limits.categories != -1:
                allowed_categories = ["electronics", "computers"][:limits.categories]
                if category not in allowed_categories:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"このカテゴリはプランで許可されていません: {category}",
                    )
            trends = [t for t in trends if t.category == category]

        items = []
        for t in trends:
            items.append({
                "name": t.name,
                "asin": t.asin,
                "category": t.category,
                "current_rank": t.current_rank,
                "rank_change_percent": t.rank_change_percent,
                "price": t.price,
                "trend_score": t.trend_score,
                "affiliate_url": get_affiliate_url(t.asin),
            })

        return {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "count": len(items),
            "trends": items,
        }

    @app.get("/trends/categories", tags=["Trends"])
    async def get_category_trends(user: User = Depends(check_api_limit)):
        """カテゴリ別トレンドを取得"""
        from analyzer import TrendAnalyzer

        analyzer = TrendAnalyzer()
        category_trends = analyzer.analyze_by_category()

        limits = user.get_limits()
        if limits.categories != -1:
            # カテゴリ数を制限
            limited = {}
            for i, (cat, trends) in enumerate(category_trends.items()):
                if i >= limits.categories:
                    break
                limited[cat] = [
                    {
                        "name": t.name,
                        "asin": t.asin,
                        "rank_change_percent": t.rank_change_percent,
                    }
                    for t in trends[:5]
                ]
            return {"categories": limited}

        return {
            "categories": {
                cat: [
                    {
                        "name": t.name,
                        "asin": t.asin,
                        "rank_change_percent": t.rank_change_percent,
                    }
                    for t in trends[:10]
                ]
                for cat, trends in category_trends.items()
            }
        }

    @app.get("/trends/significant", tags=["Trends"])
    @require_plan(SubscriptionPlan.PRO, SubscriptionPlan.ENTERPRISE)
    async def get_significant_movers(
        threshold: float = 80.0,
        user: User = Depends(check_api_limit),
    ):
        """
        大幅変動商品を取得（PRO以上）

        - **threshold**: 変動率閾値（デフォルト80%）
        """
        from analyzer import TrendAnalyzer
        from config import get_affiliate_url

        analyzer = TrendAnalyzer()
        significant = analyzer.detect_significant_movers(threshold=threshold)

        return {
            "threshold": threshold,
            "count": len(significant),
            "items": [
                {
                    "name": t.name,
                    "asin": t.asin,
                    "category": t.category,
                    "rank_change_percent": t.rank_change_percent,
                    "affiliate_url": get_affiliate_url(t.asin),
                }
                for t in significant
            ],
        }

    # === エンドポイント: エクスポート ===

    @app.get("/export/csv", tags=["Export"])
    @require_plan(SubscriptionPlan.PRO, SubscriptionPlan.ENTERPRISE)
    async def export_csv(user: User = Depends(check_api_limit)):
        """トレンドデータをCSVでエクスポート（PRO以上）"""
        from fastapi.responses import StreamingResponse
        import io
        import csv

        from analyzer import TrendAnalyzer

        analyzer = TrendAnalyzer()
        trends = analyzer.analyze_trends(top_n=100)

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["name", "asin", "category", "current_rank", "rank_change_percent", "price"])

        for t in trends:
            writer.writerow([t.name, t.asin, t.category, t.current_rank, t.rank_change_percent, t.price])

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=trends_{datetime.now().strftime('%Y%m%d')}.csv"},
        )

    @app.get("/export/json", tags=["Export"])
    @require_plan(SubscriptionPlan.PRO, SubscriptionPlan.ENTERPRISE)
    async def export_json(user: User = Depends(check_api_limit)):
        """トレンドデータをJSONでエクスポート（PRO以上）"""
        from analyzer import TrendAnalyzer
        from config import get_affiliate_url

        analyzer = TrendAnalyzer()
        trends = analyzer.analyze_trends(top_n=100)

        return {
            "exported_at": datetime.now().isoformat(),
            "count": len(trends),
            "data": [
                {
                    "name": t.name,
                    "asin": t.asin,
                    "category": t.category,
                    "current_rank": t.current_rank,
                    "previous_rank": t.previous_rank,
                    "rank_change": t.rank_change,
                    "rank_change_percent": t.rank_change_percent,
                    "price": t.price,
                    "affiliate_url": get_affiliate_url(t.asin),
                }
                for t in trends
            ],
        }

    return app


# === エントリポイント ===

def run_server(host: str = "0.0.0.0", port: int = 8000):
    """APIサーバーを起動"""
    if not FASTAPI_AVAILABLE:
        logger.error("FastAPIがインストールされていません")
        return

    try:
        import uvicorn
        app = create_app()
        uvicorn.run(app, host=host, port=port)
    except ImportError:
        logger.error("uvicornがインストールされていません。pip install uvicorn")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="EcomTrendAI API Server")
    parser.add_argument("--host", default="0.0.0.0", help="ホスト（デフォルト: 0.0.0.0）")
    parser.add_argument("--port", type=int, default=8000, help="ポート（デフォルト: 8000）")

    args = parser.parse_args()
    run_server(args.host, args.port)
