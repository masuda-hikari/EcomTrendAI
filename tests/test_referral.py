# -*- coding: utf-8 -*-
"""
紹介プログラムモジュールのテスト
"""

import json
import pytest
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import patch
import tempfile
import shutil

import sys
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from referral import (
    ReferralService,
    ReferralCode,
    Referral,
    ReferralStatus,
    RewardType,
    ReferralReward,
    DEFAULT_REWARD,
)


@pytest.fixture
def temp_data_dir():
    """一時データディレクトリ"""
    temp_dir = Path(tempfile.mkdtemp())
    yield temp_dir
    shutil.rmtree(temp_dir)


@pytest.fixture
def referral_service(temp_data_dir):
    """ReferralServiceインスタンス"""
    return ReferralService(data_dir=temp_data_dir)


class TestReferralCode:
    """ReferralCodeクラスのテスト"""

    def test_code_is_valid_active(self):
        """アクティブなコードは有効"""
        code = ReferralCode(
            code="ECT12345678",
            user_id="user123",
            is_active=True,
        )
        assert code.is_valid() is True

    def test_code_is_invalid_inactive(self):
        """非アクティブなコードは無効"""
        code = ReferralCode(
            code="ECT12345678",
            user_id="user123",
            is_active=False,
        )
        assert code.is_valid() is False

    def test_code_is_invalid_expired(self):
        """期限切れコードは無効"""
        code = ReferralCode(
            code="ECT12345678",
            user_id="user123",
            expires_at=datetime.now() - timedelta(days=1),
        )
        assert code.is_valid() is False

    def test_code_is_invalid_max_uses_reached(self):
        """最大使用回数到達コードは無効"""
        code = ReferralCode(
            code="ECT12345678",
            user_id="user123",
            max_uses=5,
            current_uses=5,
        )
        assert code.is_valid() is False

    def test_code_is_valid_unlimited_uses(self):
        """無制限使用コードは有効"""
        code = ReferralCode(
            code="ECT12345678",
            user_id="user123",
            max_uses=-1,
            current_uses=1000,
        )
        assert code.is_valid() is True


class TestReferralService:
    """ReferralServiceクラスのテスト"""

    def test_generate_code(self, referral_service):
        """紹介コード生成"""
        code = referral_service.generate_code("user123")
        assert code is not None
        assert code.user_id == "user123"
        assert code.code.startswith("ECT")
        assert len(code.code) == 11  # ECT + 8文字

    def test_generate_code_with_expiry(self, referral_service):
        """有効期限付き紹介コード生成"""
        code = referral_service.generate_code("user123", expires_days=30)
        assert code.expires_at is not None
        assert code.expires_at > datetime.now()

    def test_generate_code_returns_existing(self, referral_service):
        """既存のアクティブコードがある場合はそれを返す"""
        code1 = referral_service.generate_code("user123")
        code2 = referral_service.generate_code("user123")
        assert code1.code == code2.code

    def test_validate_code_valid(self, referral_service):
        """有効なコードの検証"""
        code = referral_service.generate_code("user123")
        validated = referral_service.validate_code(code.code)
        assert validated is not None
        assert validated.code == code.code

    def test_validate_code_invalid(self, referral_service):
        """無効なコードの検証"""
        validated = referral_service.validate_code("INVALID123")
        assert validated is None

    def test_validate_code_case_insensitive(self, referral_service):
        """コード検証は大文字小文字を区別しない"""
        code = referral_service.generate_code("user123")
        validated = referral_service.validate_code(code.code.lower())
        assert validated is not None

    def test_apply_referral(self, referral_service):
        """紹介適用"""
        code = referral_service.generate_code("referrer123")
        referral = referral_service.apply_referral(code.code, "referred456")

        assert referral is not None
        assert referral.referrer_user_id == "referrer123"
        assert referral.referred_user_id == "referred456"
        assert referral.status == ReferralStatus.PENDING

    def test_apply_referral_gives_bonus_to_referred(self, referral_service):
        """紹介適用時に被紹介者にボーナス付与"""
        code = referral_service.generate_code("referrer123")
        referral_service.apply_referral(code.code, "referred456")

        balance = referral_service.get_credit_balance("referred456")
        assert balance == DEFAULT_REWARD.referred_reward

    def test_apply_referral_self_referral_blocked(self, referral_service):
        """自己紹介は無効"""
        code = referral_service.generate_code("user123")
        referral = referral_service.apply_referral(code.code, "user123")
        assert referral is None

    def test_apply_referral_duplicate_blocked(self, referral_service):
        """同一ユーザーへの重複紹介は無効"""
        code = referral_service.generate_code("referrer123")
        referral_service.apply_referral(code.code, "referred456")

        # 別の紹介者のコードでも無効
        code2 = referral_service.generate_code("referrer789")
        referral = referral_service.apply_referral(code2.code, "referred456")
        assert referral is None

    def test_apply_referral_increments_uses(self, referral_service):
        """紹介適用でコード使用回数が増加"""
        code = referral_service.generate_code("referrer123")
        assert code.current_uses == 0

        referral_service.apply_referral(code.code, "referred456")

        # 再取得してチェック
        updated_code = referral_service.get_user_code("referrer123")
        assert updated_code.current_uses == 1

    def test_qualify_referral(self, referral_service):
        """紹介条件達成"""
        code = referral_service.generate_code("referrer123")
        referral_service.apply_referral(code.code, "referred456")

        referral = referral_service.qualify_referral("referred456")

        assert referral is not None
        assert referral.status == ReferralStatus.REWARDED
        assert referral.qualified_at is not None
        assert referral.rewarded_at is not None

    def test_qualify_referral_rewards_referrer(self, referral_service):
        """条件達成時に紹介者に報酬付与"""
        code = referral_service.generate_code("referrer123")
        referral_service.apply_referral(code.code, "referred456")
        referral_service.qualify_referral("referred456")

        balance = referral_service.get_credit_balance("referrer123")
        assert balance == DEFAULT_REWARD.referrer_reward

    def test_get_credit_balance_default_zero(self, referral_service):
        """クレジット残高のデフォルトは0"""
        balance = referral_service.get_credit_balance("unknown_user")
        assert balance == 0

    def test_use_credit_success(self, referral_service):
        """クレジット使用成功"""
        # まずクレジットを付与
        code = referral_service.generate_code("referrer123")
        referral_service.apply_referral(code.code, "referred456")

        # 使用
        success = referral_service.use_credit("referred456", 100)
        assert success is True

        balance = referral_service.get_credit_balance("referred456")
        assert balance == DEFAULT_REWARD.referred_reward - 100

    def test_use_credit_insufficient(self, referral_service):
        """クレジット不足時は失敗"""
        success = referral_service.use_credit("user123", 1000)
        assert success is False

    def test_get_user_referrals(self, referral_service):
        """ユーザーの紹介一覧取得"""
        code = referral_service.generate_code("referrer123")
        referral_service.apply_referral(code.code, "referred1")
        referral_service.apply_referral(code.code, "referred2")

        referrals = referral_service.get_user_referrals("referrer123")
        assert len(referrals) == 2

    def test_get_referral_stats(self, referral_service):
        """紹介統計取得"""
        code = referral_service.generate_code("referrer123")
        referral_service.apply_referral(code.code, "referred1")
        referral_service.apply_referral(code.code, "referred2")
        referral_service.qualify_referral("referred1")

        stats = referral_service.get_referral_stats("referrer123")

        assert stats["referral_code"] == code.code
        assert stats["total_referrals"] == 2
        assert stats["pending_referrals"] == 1
        assert stats["qualified_referrals"] == 1
        assert stats["total_earned"] == DEFAULT_REWARD.referrer_reward

    def test_data_persistence(self, temp_data_dir):
        """データ永続化"""
        # 最初のサービスでデータ作成
        service1 = ReferralService(data_dir=temp_data_dir)
        code = service1.generate_code("user123")
        service1.apply_referral(code.code, "referred456")

        # 新しいサービスインスタンスでデータ読み込み
        service2 = ReferralService(data_dir=temp_data_dir)

        # コードが存在することを確認
        loaded_code = service2.get_user_code("user123")
        assert loaded_code is not None
        assert loaded_code.code == code.code

        # 紹介が存在することを確認
        referrals = service2.get_user_referrals("user123")
        assert len(referrals) == 1


class TestDefaultReward:
    """デフォルト報酬設定のテスト"""

    def test_default_reward_values(self):
        """デフォルト報酬値"""
        assert DEFAULT_REWARD.referrer_reward == 500
        assert DEFAULT_REWARD.referred_reward == 200
        assert DEFAULT_REWARD.qualification_days == 30
        assert DEFAULT_REWARD.reward_type == RewardType.CREDIT
