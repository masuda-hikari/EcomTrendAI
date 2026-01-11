# -*- coding: utf-8 -*-
"""
セキュリティミドルウェア

IPベースのレート制限、セキュリティヘッダー、DDoS対策を実装
"""

import time
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from typing import Callable, Dict, Optional

from loguru import logger

try:
    from fastapi import FastAPI, Request, Response, status
    from fastapi.responses import JSONResponse
    from starlette.middleware.base import BaseHTTPMiddleware
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False


@dataclass
class RateLimitConfig:
    """レート制限設定"""
    # グローバル制限（全IPに適用）
    global_requests_per_minute: int = 1000
    global_requests_per_second: int = 50

    # IP単位制限
    ip_requests_per_minute: int = 100
    ip_requests_per_second: int = 10

    # 認証済みユーザー制限（緩和）
    auth_requests_per_minute: int = 300
    auth_requests_per_second: int = 30

    # ブルートフォース対策
    login_attempts_per_minute: int = 5
    register_attempts_per_minute: int = 3

    # ブロック時間（秒）
    block_duration: int = 300  # 5分

    # ホワイトリスト/ブラックリスト
    whitelist_ips: set = None
    blacklist_ips: set = None

    def __post_init__(self):
        if self.whitelist_ips is None:
            self.whitelist_ips = {"127.0.0.1", "::1"}
        if self.blacklist_ips is None:
            self.blacklist_ips = set()


class RateLimiter:
    """
    インメモリレート制限

    本番環境ではRedis等の分散ストレージを推奨
    """

    def __init__(self, config: Optional[RateLimitConfig] = None):
        self.config = config or RateLimitConfig()

        # カウンター（IP -> タイムスタンプリスト）
        self._requests: Dict[str, list] = defaultdict(list)
        self._login_attempts: Dict[str, list] = defaultdict(list)
        self._register_attempts: Dict[str, list] = defaultdict(list)

        # ブロックリスト（IP -> 解除時刻）
        self._blocked: Dict[str, float] = {}

        # グローバルカウンター
        self._global_requests: list = []

        # 最終クリーンアップ時刻
        self._last_cleanup = time.time()

    def _cleanup_old_entries(self):
        """古いエントリをクリーンアップ（5分以上前のデータ）"""
        now = time.time()

        # 1分ごとにクリーンアップ
        if now - self._last_cleanup < 60:
            return

        self._last_cleanup = now
        cutoff = now - 300  # 5分前

        # リクエストカウンター
        for ip in list(self._requests.keys()):
            self._requests[ip] = [t for t in self._requests[ip] if t > cutoff]
            if not self._requests[ip]:
                del self._requests[ip]

        # ログイン試行
        for ip in list(self._login_attempts.keys()):
            self._login_attempts[ip] = [t for t in self._login_attempts[ip] if t > cutoff]
            if not self._login_attempts[ip]:
                del self._login_attempts[ip]

        # 登録試行
        for ip in list(self._register_attempts.keys()):
            self._register_attempts[ip] = [t for t in self._register_attempts[ip] if t > cutoff]
            if not self._register_attempts[ip]:
                del self._register_attempts[ip]

        # 期限切れブロック解除
        for ip in list(self._blocked.keys()):
            if self._blocked[ip] < now:
                del self._blocked[ip]

        # グローバル
        self._global_requests = [t for t in self._global_requests if t > cutoff]

    def _count_recent(self, timestamps: list, seconds: int) -> int:
        """指定秒数以内のカウントを取得"""
        cutoff = time.time() - seconds
        return sum(1 for t in timestamps if t > cutoff)

    def is_blocked(self, ip: str) -> bool:
        """IPがブロックされているか確認"""
        if ip in self._blocked:
            if self._blocked[ip] > time.time():
                return True
            else:
                del self._blocked[ip]
        return False

    def block_ip(self, ip: str, duration: Optional[int] = None):
        """IPをブロック"""
        if ip in self.config.whitelist_ips:
            return

        block_time = duration or self.config.block_duration
        self._blocked[ip] = time.time() + block_time
        logger.warning(f"IPブロック: {ip} ({block_time}秒)")

    def check_rate_limit(
        self,
        ip: str,
        endpoint: str = "",
        is_authenticated: bool = False,
    ) -> tuple[bool, str, int]:
        """
        レート制限チェック

        Returns:
            (許可, エラーメッセージ, Retry-After秒数)
        """
        self._cleanup_old_entries()
        now = time.time()

        # ホワイトリスト
        if ip in self.config.whitelist_ips:
            return True, "", 0

        # ブラックリスト
        if ip in self.config.blacklist_ips:
            return False, "アクセス禁止", 3600

        # ブロック中
        if self.is_blocked(ip):
            retry_after = int(self._blocked[ip] - now)
            return False, "一時的にブロックされています", retry_after

        # エンドポイント別制限
        if endpoint in ("/users/register", "/register"):
            self._register_attempts[ip].append(now)
            if self._count_recent(self._register_attempts[ip], 60) > self.config.register_attempts_per_minute:
                self.block_ip(ip)
                return False, "登録試行回数が多すぎます", self.config.block_duration

        if endpoint in ("/users/login", "/login", "/users/api-keys"):
            self._login_attempts[ip].append(now)
            if self._count_recent(self._login_attempts[ip], 60) > self.config.login_attempts_per_minute:
                self.block_ip(ip)
                return False, "ログイン試行回数が多すぎます", self.config.block_duration

        # 通常リクエスト制限
        self._requests[ip].append(now)
        self._global_requests.append(now)

        # 認証済み/未認証で制限を分ける
        if is_authenticated:
            rpm = self.config.auth_requests_per_minute
            rps = self.config.auth_requests_per_second
        else:
            rpm = self.config.ip_requests_per_minute
            rps = self.config.ip_requests_per_second

        # 秒単位制限
        if self._count_recent(self._requests[ip], 1) > rps:
            return False, "リクエスト頻度が高すぎます", 1

        # 分単位制限
        if self._count_recent(self._requests[ip], 60) > rpm:
            return False, "リクエスト数が多すぎます（1分間上限）", 60

        # グローバル制限
        if self._count_recent(self._global_requests, 1) > self.config.global_requests_per_second:
            return False, "サービス高負荷状態です", 5

        return True, "", 0

    def get_stats(self) -> dict:
        """統計情報を取得"""
        return {
            "active_ips": len(self._requests),
            "blocked_ips": len(self._blocked),
            "global_rpm": self._count_recent(self._global_requests, 60),
        }


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    セキュリティヘッダーミドルウェア

    OWASP推奨のセキュリティヘッダーを追加
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        # セキュリティヘッダー追加
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        # HSTS（HTTPS環境のみ）
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        # CSP（APIのため緩め）
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "frame-ancestors 'none'"
        )

        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    レート制限ミドルウェア

    IPベースのレート制限を適用
    """

    def __init__(self, app: FastAPI, rate_limiter: Optional[RateLimiter] = None):
        super().__init__(app)
        self.limiter = rate_limiter or RateLimiter()

    def _get_client_ip(self, request: Request) -> str:
        """クライアントIPを取得（プロキシ対応）"""
        # X-Forwarded-For（プロキシ経由）
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            # 最初のIPが元のクライアント
            return forwarded.split(",")[0].strip()

        # X-Real-IP（Nginx等）
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()

        # 直接接続
        if request.client:
            return request.client.host

        return "unknown"

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        ip = self._get_client_ip(request)
        endpoint = request.url.path

        # 認証状態チェック
        is_authenticated = bool(
            request.headers.get("X-API-Key") or
            request.headers.get("Authorization", "").startswith("Bearer ")
        )

        # レート制限チェック
        allowed, message, retry_after = self.limiter.check_rate_limit(
            ip=ip,
            endpoint=endpoint,
            is_authenticated=is_authenticated,
        )

        if not allowed:
            logger.warning(f"レート制限: {ip} -> {endpoint} ({message})")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "rate_limit_exceeded",
                    "message": message,
                    "retry_after": retry_after,
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Reset": str(int(time.time()) + retry_after),
                },
            )

        # リクエスト処理
        response = await call_next(request)

        # レート制限情報をヘッダーに追加
        stats = self.limiter.get_stats()
        response.headers["X-RateLimit-Limit"] = str(
            self.limiter.config.auth_requests_per_minute
            if is_authenticated
            else self.limiter.config.ip_requests_per_minute
        )

        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    リクエストログミドルウェア

    監査ログ用のリクエスト記録
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()

        # リクエスト処理
        response = await call_next(request)

        # 処理時間
        process_time = time.time() - start_time

        # ログ記録（機密情報除外）
        if request.url.path not in ("/health", "/metrics"):
            logger.info(
                f"{request.method} {request.url.path} "
                f"status={response.status_code} "
                f"time={process_time:.3f}s"
            )

        response.headers["X-Process-Time"] = str(process_time)

        return response


def add_security_middleware(app: FastAPI, rate_limiter: Optional[RateLimiter] = None):
    """
    セキュリティミドルウェアをアプリに追加

    Args:
        app: FastAPIアプリケーション
        rate_limiter: カスタムレート制限（オプション）
    """
    if not FASTAPI_AVAILABLE:
        raise ImportError("FastAPIがインストールされていません")

    # ミドルウェアは逆順に適用される（最後に追加したものが最初に実行）
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RateLimitMiddleware, rate_limiter=rate_limiter)

    logger.info("セキュリティミドルウェアを追加しました")
