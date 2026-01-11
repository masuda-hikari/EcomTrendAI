# -*- coding: utf-8 -*-
"""
エラーハンドリング・通知モジュール

本番環境でのエラー通知・ログ管理を提供
Sentry/Slack/メール通知に対応
"""

import os
import traceback
from datetime import datetime
from functools import wraps
from typing import Any, Callable, Dict, Optional

from loguru import logger

# === 設定 ===

SENTRY_DSN = os.getenv("SENTRY_DSN")
SLACK_WEBHOOK_URL = os.getenv("SLACK_ERROR_WEBHOOK_URL")
ERROR_NOTIFICATION_EMAIL = os.getenv("ERROR_NOTIFICATION_EMAIL")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")


def is_production() -> bool:
    """本番環境かどうかを判定"""
    return ENVIRONMENT.lower() in ("production", "prod")


# === Sentry連携 ===

def init_sentry() -> None:
    """Sentryを初期化（SENTRY_DSN設定時のみ）"""
    if not SENTRY_DSN:
        logger.info("SENTRY_DSN未設定のためSentryをスキップ")
        return

    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration

        sentry_sdk.init(
            dsn=SENTRY_DSN,
            environment=ENVIRONMENT,
            traces_sample_rate=0.1 if is_production() else 1.0,
            profiles_sample_rate=0.1 if is_production() else 1.0,
            integrations=[FastApiIntegration()],
            send_default_pii=False,  # 個人情報を送信しない
        )
        logger.info(f"Sentry初期化完了: environment={ENVIRONMENT}")
    except ImportError:
        logger.warning("sentry-sdk未インストール: pip install sentry-sdk[fastapi]")
    except Exception as e:
        logger.error(f"Sentry初期化失敗: {e}")


def capture_exception(
    error: Exception,
    context: Optional[Dict[str, Any]] = None,
    user_id: Optional[str] = None,
    tags: Optional[Dict[str, str]] = None
) -> Optional[str]:
    """
    例外をSentry/ログに記録

    Args:
        error: 例外オブジェクト
        context: 追加コンテキスト情報
        user_id: ユーザーID（あれば）
        tags: Sentryタグ

    Returns:
        エラーID（Sentry利用時）
    """
    error_id = None

    # ログ出力
    logger.error(
        f"Exception: {type(error).__name__}: {error}",
        extra={"context": context, "user_id": user_id}
    )
    logger.debug(traceback.format_exc())

    # Sentry送信
    if SENTRY_DSN:
        try:
            import sentry_sdk

            with sentry_sdk.push_scope() as scope:
                if user_id:
                    scope.set_user({"id": user_id})
                if tags:
                    for key, value in tags.items():
                        scope.set_tag(key, value)
                if context:
                    for key, value in context.items():
                        scope.set_extra(key, value)

                error_id = sentry_sdk.capture_exception(error)
        except ImportError:
            pass
        except Exception as e:
            logger.warning(f"Sentry送信失敗: {e}")

    # Slack通知（本番環境のみ）
    if is_production() and SLACK_WEBHOOK_URL:
        _send_slack_notification(error, context, user_id)

    return error_id


def capture_message(
    message: str,
    level: str = "info",
    context: Optional[Dict[str, Any]] = None
) -> None:
    """
    メッセージをSentry/ログに記録

    Args:
        message: メッセージ
        level: ログレベル (debug, info, warning, error, fatal)
        context: 追加コンテキスト
    """
    # ログ出力
    log_func = getattr(logger, level.lower(), logger.info)
    log_func(message, extra={"context": context})

    # Sentry送信（warning以上）
    if SENTRY_DSN and level.lower() in ("warning", "error", "fatal"):
        try:
            import sentry_sdk
            sentry_sdk.capture_message(message, level=level)
        except ImportError:
            pass


def set_user_context(user_id: str, email: Optional[str] = None) -> None:
    """ユーザーコンテキストを設定"""
    if not SENTRY_DSN:
        return

    try:
        import sentry_sdk
        sentry_sdk.set_user({
            "id": user_id,
            "email": email
        })
    except ImportError:
        pass


def clear_user_context() -> None:
    """ユーザーコンテキストをクリア"""
    if not SENTRY_DSN:
        return

    try:
        import sentry_sdk
        sentry_sdk.set_user(None)
    except ImportError:
        pass


# === Slack通知 ===

def _send_slack_notification(
    error: Exception,
    context: Optional[Dict[str, Any]] = None,
    user_id: Optional[str] = None
) -> None:
    """Slackにエラー通知を送信"""
    if not SLACK_WEBHOOK_URL:
        return

    try:
        import httpx

        payload = {
            "text": ":rotating_light: *EcomTrendAI エラー通知*",
            "attachments": [
                {
                    "color": "danger",
                    "fields": [
                        {
                            "title": "エラータイプ",
                            "value": type(error).__name__,
                            "short": True
                        },
                        {
                            "title": "環境",
                            "value": ENVIRONMENT,
                            "short": True
                        },
                        {
                            "title": "メッセージ",
                            "value": str(error)[:500],
                            "short": False
                        },
                        {
                            "title": "発生時刻",
                            "value": datetime.now().isoformat(),
                            "short": True
                        }
                    ]
                }
            ]
        }

        if user_id:
            payload["attachments"][0]["fields"].append({
                "title": "ユーザーID",
                "value": user_id,
                "short": True
            })

        httpx.post(SLACK_WEBHOOK_URL, json=payload, timeout=5)
    except Exception as e:
        logger.warning(f"Slack通知失敗: {e}")


# === デコレーター ===

def error_handler(
    reraise: bool = True,
    default_return: Any = None,
    context_func: Optional[Callable[..., Dict[str, Any]]] = None
):
    """
    エラーハンドリングデコレーター

    Args:
        reraise: エラーを再送出するか
        default_return: エラー時のデフォルト戻り値
        context_func: コンテキスト生成関数

    Example:
        @error_handler(reraise=False, default_return=[])
        def fetch_data():
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                context = {}
                if context_func:
                    try:
                        context = context_func(*args, **kwargs)
                    except Exception:  # nosec B110 - コンテキスト取得失敗は無視して本体のエラー処理を優先
                        pass

                context["function"] = func.__name__
                context["args_count"] = len(args)
                context["kwargs_keys"] = list(kwargs.keys())

                capture_exception(e, context=context)

                if reraise:
                    raise
                return default_return

        return wrapper
    return decorator


def async_error_handler(
    reraise: bool = True,
    default_return: Any = None
):
    """非同期用エラーハンドリングデコレーター"""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                context = {
                    "function": func.__name__,
                    "args_count": len(args),
                    "kwargs_keys": list(kwargs.keys())
                }
                capture_exception(e, context=context)

                if reraise:
                    raise
                return default_return

        return wrapper
    return decorator


# === FastAPI統合 ===

def setup_fastapi_error_handlers(app) -> None:
    """FastAPIにエラーハンドラーを設定"""
    from fastapi import Request
    from fastapi.responses import JSONResponse

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        """グローバル例外ハンドラー"""
        # エラーをキャプチャ
        error_id = capture_exception(
            exc,
            context={
                "path": str(request.url.path),
                "method": request.method,
                "client_host": request.client.host if request.client else None
            }
        )

        # 本番環境ではエラー詳細を隠す
        if is_production():
            return JSONResponse(
                status_code=500,
                content={
                    "error": "内部サーバーエラー",
                    "error_id": error_id,
                    "message": "問題が発生しました。しばらくしてから再試行してください。"
                }
            )
        else:
            return JSONResponse(
                status_code=500,
                content={
                    "error": type(exc).__name__,
                    "message": str(exc),
                    "error_id": error_id
                }
            )

    logger.info("FastAPIエラーハンドラー設定完了")


# === 初期化 ===

def initialize_error_handling() -> None:
    """エラーハンドリングを初期化"""
    init_sentry()
    logger.info(f"エラーハンドリング初期化完了: environment={ENVIRONMENT}")
