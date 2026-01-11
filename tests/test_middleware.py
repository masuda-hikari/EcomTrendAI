# -*- coding: utf-8 -*-
"""
ミドルウェアテスト

レート制限・セキュリティヘッダーのテスト
"""

import time
import pytest

import sys
sys.path.insert(0, "src")

from middleware import RateLimiter, RateLimitConfig


class TestRateLimiter:
    """レート制限テスト"""

    def test_初期状態では許可(self):
        """初期状態ではリクエストが許可される"""
        limiter = RateLimiter()
        allowed, msg, retry = limiter.check_rate_limit("192.168.1.1")
        assert allowed is True
        assert msg == ""
        assert retry == 0

    def test_ホワイトリストIPは常に許可(self):
        """ホワイトリストのIPは常に許可される"""
        config = RateLimitConfig(whitelist_ips={"10.0.0.1"})
        limiter = RateLimiter(config)

        # 大量リクエストを送信
        for _ in range(1000):
            allowed, _, _ = limiter.check_rate_limit("10.0.0.1")
            assert allowed is True

    def test_ブラックリストIPは拒否(self):
        """ブラックリストのIPは拒否される"""
        config = RateLimitConfig(blacklist_ips={"10.0.0.2"})
        limiter = RateLimiter(config)

        allowed, msg, retry = limiter.check_rate_limit("10.0.0.2")
        assert allowed is False
        assert "禁止" in msg
        assert retry == 3600

    def test_秒単位レート制限(self):
        """秒単位のレート制限が機能する"""
        config = RateLimitConfig(ip_requests_per_second=3, ip_requests_per_minute=1000)
        limiter = RateLimiter(config)

        ip = "192.168.1.100"

        # 3回は許可
        for i in range(3):
            allowed, _, _ = limiter.check_rate_limit(ip)
            assert allowed is True, f"{i+1}回目が拒否された"

        # 4回目は拒否
        allowed, msg, retry = limiter.check_rate_limit(ip)
        assert allowed is False
        assert "頻度" in msg
        assert retry == 1

    def test_分単位レート制限(self):
        """分単位のレート制限が機能する"""
        config = RateLimitConfig(ip_requests_per_second=100, ip_requests_per_minute=5)
        limiter = RateLimiter(config)

        ip = "192.168.1.101"

        # 5回は許可
        for i in range(5):
            allowed, _, _ = limiter.check_rate_limit(ip)
            assert allowed is True, f"{i+1}回目が拒否された"

        # 6回目は拒否
        allowed, msg, retry = limiter.check_rate_limit(ip)
        assert allowed is False
        assert "1分間" in msg
        assert retry == 60

    def test_認証済みユーザーは緩和(self):
        """認証済みユーザーは制限が緩和される"""
        config = RateLimitConfig(
            ip_requests_per_second=2,
            auth_requests_per_second=5,
            ip_requests_per_minute=1000,
            auth_requests_per_minute=1000,
        )
        limiter = RateLimiter(config)

        ip = "192.168.1.102"

        # 認証なし: 2回で制限
        for _ in range(2):
            allowed, _, _ = limiter.check_rate_limit(ip, is_authenticated=False)
            assert allowed is True

        # 3回目は拒否
        allowed, _, _ = limiter.check_rate_limit(ip, is_authenticated=False)
        assert allowed is False

        # 別IPで認証あり: 5回まで許可
        ip2 = "192.168.1.103"
        for _ in range(5):
            allowed, _, _ = limiter.check_rate_limit(ip2, is_authenticated=True)
            assert allowed is True

    def test_ログイン試行制限(self):
        """ログイン試行回数制限が機能する"""
        config = RateLimitConfig(login_attempts_per_minute=3)
        limiter = RateLimiter(config)

        ip = "192.168.1.104"

        # 3回は許可
        for _ in range(3):
            allowed, _, _ = limiter.check_rate_limit(ip, endpoint="/users/login")
            assert allowed is True

        # 4回目は拒否（ブロック）
        allowed, msg, retry = limiter.check_rate_limit(ip, endpoint="/users/login")
        assert allowed is False
        assert "ログイン" in msg

    def test_登録試行制限(self):
        """登録試行回数制限が機能する"""
        config = RateLimitConfig(register_attempts_per_minute=2)
        limiter = RateLimiter(config)

        ip = "192.168.1.105"

        # 2回は許可
        for _ in range(2):
            allowed, _, _ = limiter.check_rate_limit(ip, endpoint="/users/register")
            assert allowed is True

        # 3回目は拒否（ブロック）
        allowed, msg, retry = limiter.check_rate_limit(ip, endpoint="/users/register")
        assert allowed is False
        assert "登録" in msg

    def test_IPブロック(self):
        """IPブロックが機能する"""
        config = RateLimitConfig(block_duration=5)  # 5秒
        limiter = RateLimiter(config)

        ip = "192.168.1.106"

        # ブロック
        limiter.block_ip(ip, duration=2)

        # ブロック中は拒否
        allowed, msg, retry = limiter.check_rate_limit(ip)
        assert allowed is False
        assert "ブロック" in msg
        assert retry <= 2

    def test_ブロック解除(self):
        """ブロックが時間経過で解除される"""
        config = RateLimitConfig()
        limiter = RateLimiter(config)

        ip = "192.168.1.107"

        # 短時間ブロック
        limiter._blocked[ip] = time.time() - 1  # 過去の時刻

        # 解除されている
        assert limiter.is_blocked(ip) is False

    def test_統計情報取得(self):
        """統計情報が取得できる"""
        limiter = RateLimiter()

        # いくつかリクエスト
        limiter.check_rate_limit("192.168.1.200")
        limiter.check_rate_limit("192.168.1.201")

        stats = limiter.get_stats()

        assert "active_ips" in stats
        assert "blocked_ips" in stats
        assert "global_rpm" in stats
        assert stats["active_ips"] >= 2

    def test_ホワイトリストIPはブロックされない(self):
        """ホワイトリストIPはblock_ipで無視される"""
        config = RateLimitConfig(whitelist_ips={"10.0.0.10"})
        limiter = RateLimiter(config)

        limiter.block_ip("10.0.0.10")

        # ブロックされていない
        assert "10.0.0.10" not in limiter._blocked


class TestRateLimitConfig:
    """レート制限設定テスト"""

    def test_デフォルト値(self):
        """デフォルト値が正しく設定される"""
        config = RateLimitConfig()

        assert config.ip_requests_per_minute == 100
        assert config.ip_requests_per_second == 10
        assert config.login_attempts_per_minute == 5
        assert config.block_duration == 300
        assert "127.0.0.1" in config.whitelist_ips

    def test_カスタム値(self):
        """カスタム値が正しく設定される"""
        config = RateLimitConfig(
            ip_requests_per_minute=50,
            block_duration=600,
        )

        assert config.ip_requests_per_minute == 50
        assert config.block_duration == 600
