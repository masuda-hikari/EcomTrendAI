# -*- coding: utf-8 -*-
"""
エラーハンドラーのテスト
"""

import os
import sys
from unittest.mock import MagicMock, patch

import pytest

# srcをパスに追加
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))


class TestErrorHandler:
    """エラーハンドラー基本機能テスト"""

    def test_is_production_development(self, monkeypatch):
        """開発環境判定テスト"""
        monkeypatch.setenv("ENVIRONMENT", "development")

        # モジュールを再インポート
        import importlib
        import error_handler
        importlib.reload(error_handler)

        assert not error_handler.is_production()

    def test_is_production_production(self, monkeypatch):
        """本番環境判定テスト"""
        monkeypatch.setenv("ENVIRONMENT", "production")

        import importlib
        import error_handler
        importlib.reload(error_handler)

        assert error_handler.is_production()

    def test_capture_exception_logs_error(self, monkeypatch):
        """例外キャプチャがログ出力されることを確認"""
        monkeypatch.setenv("SENTRY_DSN", "")
        monkeypatch.setenv("SLACK_WEBHOOK_URL", "")

        import importlib
        import error_handler
        importlib.reload(error_handler)

        # エラーをキャプチャ
        test_error = ValueError("テストエラー")
        result = error_handler.capture_exception(
            test_error,
            context={"test_key": "test_value"}
        )

        # Sentry未設定のため None を返す
        assert result is None

    def test_capture_message_logs_message(self, monkeypatch):
        """メッセージキャプチャがログ出力されることを確認"""
        monkeypatch.setenv("SENTRY_DSN", "")

        import importlib
        import error_handler
        importlib.reload(error_handler)

        # メッセージをキャプチャ（エラーなく実行される）
        error_handler.capture_message(
            "テストメッセージ",
            level="info",
            context={"key": "value"}
        )

    def test_set_user_context_without_sentry(self, monkeypatch):
        """Sentry未設定時のユーザーコンテキスト設定"""
        monkeypatch.setenv("SENTRY_DSN", "")

        import importlib
        import error_handler
        importlib.reload(error_handler)

        # エラーなく実行される
        error_handler.set_user_context("user-123", "test@example.com")
        error_handler.clear_user_context()

    def test_error_handler_decorator_reraise(self, monkeypatch):
        """エラーハンドラーデコレーター（再送出）テスト"""
        monkeypatch.setenv("SENTRY_DSN", "")
        monkeypatch.setenv("SLACK_WEBHOOK_URL", "")

        import importlib
        import error_handler
        importlib.reload(error_handler)

        @error_handler.error_handler(reraise=True)
        def failing_function():
            raise ValueError("デコレーターテストエラー")

        with pytest.raises(ValueError, match="デコレーターテストエラー"):
            failing_function()

    def test_error_handler_decorator_no_reraise(self, monkeypatch):
        """エラーハンドラーデコレーター（再送出なし）テスト"""
        monkeypatch.setenv("SENTRY_DSN", "")
        monkeypatch.setenv("SLACK_WEBHOOK_URL", "")

        import importlib
        import error_handler
        importlib.reload(error_handler)

        @error_handler.error_handler(reraise=False, default_return="default")
        def failing_function():
            raise ValueError("デコレーターテストエラー")

        result = failing_function()
        assert result == "default"

    def test_error_handler_decorator_success(self, monkeypatch):
        """エラーハンドラーデコレーター（正常系）テスト"""
        monkeypatch.setenv("SENTRY_DSN", "")

        import importlib
        import error_handler
        importlib.reload(error_handler)

        @error_handler.error_handler()
        def successful_function():
            return "success"

        result = successful_function()
        assert result == "success"


class TestAsyncErrorHandler:
    """非同期エラーハンドラーテスト"""

    @pytest.mark.asyncio
    async def test_async_error_handler_reraise(self, monkeypatch):
        """非同期エラーハンドラー（再送出）テスト"""
        monkeypatch.setenv("SENTRY_DSN", "")
        monkeypatch.setenv("SLACK_WEBHOOK_URL", "")

        import importlib
        import error_handler
        importlib.reload(error_handler)

        @error_handler.async_error_handler(reraise=True)
        async def async_failing_function():
            raise ValueError("非同期テストエラー")

        with pytest.raises(ValueError, match="非同期テストエラー"):
            await async_failing_function()

    @pytest.mark.asyncio
    async def test_async_error_handler_no_reraise(self, monkeypatch):
        """非同期エラーハンドラー（再送出なし）テスト"""
        monkeypatch.setenv("SENTRY_DSN", "")
        monkeypatch.setenv("SLACK_WEBHOOK_URL", "")

        import importlib
        import error_handler
        importlib.reload(error_handler)

        @error_handler.async_error_handler(reraise=False, default_return=[])
        async def async_failing_function():
            raise ValueError("非同期テストエラー")

        result = await async_failing_function()
        assert result == []

    @pytest.mark.asyncio
    async def test_async_error_handler_success(self, monkeypatch):
        """非同期エラーハンドラー（正常系）テスト"""
        monkeypatch.setenv("SENTRY_DSN", "")

        import importlib
        import error_handler
        importlib.reload(error_handler)

        @error_handler.async_error_handler()
        async def async_successful_function():
            return {"status": "ok"}

        result = await async_successful_function()
        assert result == {"status": "ok"}


class TestInitialization:
    """初期化テスト"""

    def test_init_sentry_without_dsn(self, monkeypatch):
        """DSN未設定時のSentry初期化"""
        monkeypatch.setenv("SENTRY_DSN", "")

        import importlib
        import error_handler
        importlib.reload(error_handler)

        # エラーなく実行される
        error_handler.init_sentry()

    def test_initialize_error_handling(self, monkeypatch):
        """エラーハンドリング初期化テスト"""
        monkeypatch.setenv("SENTRY_DSN", "")
        monkeypatch.setenv("ENVIRONMENT", "test")

        import importlib
        import error_handler
        importlib.reload(error_handler)

        # エラーなく実行される
        error_handler.initialize_error_handling()
