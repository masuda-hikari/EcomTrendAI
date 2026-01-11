# -*- coding: utf-8 -*-
"""
紹介プログラム（リファラル）モジュール

ユーザー紹介による報酬付与システム
- 紹介コード生成・管理
- 紹介追跡・報酬計算
- クレジット付与
"""

import hashlib
import json
import os
import secrets
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from loguru import logger

load_dotenv()


class ReferralStatus(Enum):
    """紹介ステータス"""
    PENDING = "pending"  # 登録済み、未課金
    QUALIFIED = "qualified"  # 条件達成（有料プラン加入）
    REWARDED = "rewarded"  # 報酬付与済み
    EXPIRED = "expired"  # 期限切れ


class RewardType(Enum):
    """報酬タイプ"""
    CREDIT = "credit"  # サービスクレジット
    DISCOUNT = "discount"  # 割引
    EXTENSION = "extension"  # 期間延長


@dataclass
class ReferralCode:
    """紹介コード情報"""
    code: str
    user_id: str  # 紹介者のユーザーID
    created_at: datetime = field(default_factory=datetime.now)
    expires_at: Optional[datetime] = None
    max_uses: int = -1  # -1 = 無制限
    current_uses: int = 0
    is_active: bool = True

    def is_valid(self) -> bool:
        """コードが有効か"""
        if not self.is_active:
            return False
        if self.expires_at and datetime.now() > self.expires_at:
            return False
        if self.max_uses != -1 and self.current_uses >= self.max_uses:
            return False
        return True


@dataclass
class Referral:
    """紹介記録"""
    referral_id: str
    referrer_user_id: str  # 紹介者
    referred_user_id: str  # 被紹介者
    referral_code: str
    status: ReferralStatus = ReferralStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)
    qualified_at: Optional[datetime] = None
    rewarded_at: Optional[datetime] = None
    reward_amount: int = 0  # 報酬額（円相当）


@dataclass
class ReferralReward:
    """報酬設定"""
    referrer_reward: int = 500  # 紹介者への報酬（円相当クレジット）
    referred_reward: int = 200  # 被紹介者への報酬（初回割引相当）
    qualification_days: int = 30  # 有料プラン加入までの日数制限
    reward_type: RewardType = RewardType.CREDIT


# デフォルト報酬設定
DEFAULT_REWARD = ReferralReward(
    referrer_reward=int(os.getenv("REFERRAL_REWARD_REFERRER", "500")),
    referred_reward=int(os.getenv("REFERRAL_REWARD_REFERRED", "200")),
    qualification_days=int(os.getenv("REFERRAL_QUALIFICATION_DAYS", "30")),
)


class ReferralService:
    """紹介プログラムサービス"""

    def __init__(self, data_dir: Optional[Path] = None):
        """
        初期化

        Args:
            data_dir: データ保存ディレクトリ
        """
        self.data_dir = data_dir or Path(__file__).parent.parent / "data"
        self.codes_file = self.data_dir / "referral_codes.json"
        self.referrals_file = self.data_dir / "referrals.json"
        self.credits_file = self.data_dir / "user_credits.json"
        self._codes: dict[str, ReferralCode] = {}
        self._referrals: dict[str, Referral] = {}
        self._credits: dict[str, int] = {}  # user_id -> クレジット残高
        self._load_data()

    def _load_data(self) -> None:
        """データを読み込み"""
        # 紹介コード
        if self.codes_file.exists():
            try:
                with open(self.codes_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for code, cdata in data.items():
                    self._codes[code] = ReferralCode(
                        code=cdata["code"],
                        user_id=cdata["user_id"],
                        created_at=datetime.fromisoformat(cdata["created_at"]),
                        expires_at=datetime.fromisoformat(cdata["expires_at"]) if cdata.get("expires_at") else None,
                        max_uses=cdata.get("max_uses", -1),
                        current_uses=cdata.get("current_uses", 0),
                        is_active=cdata.get("is_active", True),
                    )
            except Exception as e:
                logger.warning(f"紹介コード読み込みエラー: {e}")

        # 紹介記録
        if self.referrals_file.exists():
            try:
                with open(self.referrals_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for rid, rdata in data.items():
                    self._referrals[rid] = Referral(
                        referral_id=rdata["referral_id"],
                        referrer_user_id=rdata["referrer_user_id"],
                        referred_user_id=rdata["referred_user_id"],
                        referral_code=rdata["referral_code"],
                        status=ReferralStatus(rdata.get("status", "pending")),
                        created_at=datetime.fromisoformat(rdata["created_at"]),
                        qualified_at=datetime.fromisoformat(rdata["qualified_at"]) if rdata.get("qualified_at") else None,
                        rewarded_at=datetime.fromisoformat(rdata["rewarded_at"]) if rdata.get("rewarded_at") else None,
                        reward_amount=rdata.get("reward_amount", 0),
                    )
            except Exception as e:
                logger.warning(f"紹介記録読み込みエラー: {e}")

        # クレジット残高
        if self.credits_file.exists():
            try:
                with open(self.credits_file, "r", encoding="utf-8") as f:
                    self._credits = json.load(f)
            except Exception as e:
                logger.warning(f"クレジット残高読み込みエラー: {e}")

    def _save_data(self) -> None:
        """データを保存"""
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # 紹介コード
        codes_data = {}
        for code, cobj in self._codes.items():
            codes_data[code] = {
                "code": cobj.code,
                "user_id": cobj.user_id,
                "created_at": cobj.created_at.isoformat(),
                "expires_at": cobj.expires_at.isoformat() if cobj.expires_at else None,
                "max_uses": cobj.max_uses,
                "current_uses": cobj.current_uses,
                "is_active": cobj.is_active,
            }
        with open(self.codes_file, "w", encoding="utf-8") as f:
            json.dump(codes_data, f, ensure_ascii=False, indent=2)

        # 紹介記録
        referrals_data = {}
        for rid, ref in self._referrals.items():
            referrals_data[rid] = {
                "referral_id": ref.referral_id,
                "referrer_user_id": ref.referrer_user_id,
                "referred_user_id": ref.referred_user_id,
                "referral_code": ref.referral_code,
                "status": ref.status.value,
                "created_at": ref.created_at.isoformat(),
                "qualified_at": ref.qualified_at.isoformat() if ref.qualified_at else None,
                "rewarded_at": ref.rewarded_at.isoformat() if ref.rewarded_at else None,
                "reward_amount": ref.reward_amount,
            }
        with open(self.referrals_file, "w", encoding="utf-8") as f:
            json.dump(referrals_data, f, ensure_ascii=False, indent=2)

        # クレジット残高
        with open(self.credits_file, "w", encoding="utf-8") as f:
            json.dump(self._credits, f, ensure_ascii=False, indent=2)

    def generate_code(self, user_id: str, expires_days: Optional[int] = None, max_uses: int = -1) -> ReferralCode:
        """
        紹介コードを生成

        Args:
            user_id: ユーザーID
            expires_days: 有効期限（日数）
            max_uses: 最大使用回数（-1で無制限）

        Returns:
            ReferralCode
        """
        # 既存のアクティブなコードがあるか確認
        for code_obj in self._codes.values():
            if code_obj.user_id == user_id and code_obj.is_valid():
                return code_obj

        # 新規コード生成（短くて覚えやすい形式）
        code = f"ECT{secrets.token_hex(4).upper()}"

        expires_at = None
        if expires_days:
            expires_at = datetime.now() + timedelta(days=expires_days)

        code_obj = ReferralCode(
            code=code,
            user_id=user_id,
            expires_at=expires_at,
            max_uses=max_uses,
        )

        self._codes[code] = code_obj
        self._save_data()
        logger.info(f"紹介コード生成: {code} (user: {user_id})")

        return code_obj

    def validate_code(self, code: str) -> Optional[ReferralCode]:
        """
        紹介コードを検証

        Args:
            code: 紹介コード

        Returns:
            ReferralCode または None
        """
        code_upper = code.upper()
        if code_upper in self._codes:
            code_obj = self._codes[code_upper]
            if code_obj.is_valid():
                return code_obj
        return None

    def apply_referral(self, referral_code: str, referred_user_id: str) -> Optional[Referral]:
        """
        紹介を適用（新規ユーザー登録時）

        Args:
            referral_code: 紹介コード
            referred_user_id: 被紹介者のユーザーID

        Returns:
            Referral または None
        """
        code_obj = self.validate_code(referral_code)
        if not code_obj:
            logger.warning(f"無効な紹介コード: {referral_code}")
            return None

        # 自己紹介防止
        if code_obj.user_id == referred_user_id:
            logger.warning(f"自己紹介は無効: {referral_code}")
            return None

        # 既存の紹介チェック
        for ref in self._referrals.values():
            if ref.referred_user_id == referred_user_id:
                logger.warning(f"既に紹介済み: {referred_user_id}")
                return None

        referral_id = secrets.token_hex(8)
        referral = Referral(
            referral_id=referral_id,
            referrer_user_id=code_obj.user_id,
            referred_user_id=referred_user_id,
            referral_code=referral_code,
        )

        # コード使用回数を更新
        code_obj.current_uses += 1

        self._referrals[referral_id] = referral
        self._save_data()
        logger.info(f"紹介適用: {referral_code} -> {referred_user_id}")

        # 被紹介者への初回特典（即時付与）
        self._add_credit(referred_user_id, DEFAULT_REWARD.referred_reward)
        logger.info(f"被紹介者特典付与: {referred_user_id} +{DEFAULT_REWARD.referred_reward}円")

        return referral

    def qualify_referral(self, referred_user_id: str) -> Optional[Referral]:
        """
        紹介を条件達成にする（有料プラン加入時）

        Args:
            referred_user_id: 被紹介者のユーザーID

        Returns:
            Referral または None
        """
        for referral in self._referrals.values():
            if referral.referred_user_id == referred_user_id and referral.status == ReferralStatus.PENDING:
                # 期限チェック
                qualification_deadline = referral.created_at + timedelta(days=DEFAULT_REWARD.qualification_days)
                if datetime.now() > qualification_deadline:
                    referral.status = ReferralStatus.EXPIRED
                    self._save_data()
                    logger.info(f"紹介期限切れ: {referral.referral_id}")
                    return None

                referral.status = ReferralStatus.QUALIFIED
                referral.qualified_at = datetime.now()
                self._save_data()
                logger.info(f"紹介条件達成: {referral.referral_id}")

                # 紹介者への報酬付与
                self._reward_referrer(referral)

                return referral

        return None

    def _reward_referrer(self, referral: Referral) -> bool:
        """
        紹介者に報酬を付与

        Args:
            referral: 紹介記録

        Returns:
            成功したか
        """
        if referral.status != ReferralStatus.QUALIFIED:
            return False

        referral.reward_amount = DEFAULT_REWARD.referrer_reward
        referral.status = ReferralStatus.REWARDED
        referral.rewarded_at = datetime.now()

        self._add_credit(referral.referrer_user_id, referral.reward_amount)
        self._save_data()

        logger.info(f"紹介報酬付与: {referral.referrer_user_id} +{referral.reward_amount}円")
        return True

    def _add_credit(self, user_id: str, amount: int) -> int:
        """
        クレジットを追加

        Args:
            user_id: ユーザーID
            amount: 追加額

        Returns:
            新しい残高
        """
        current = self._credits.get(user_id, 0)
        new_balance = current + amount
        self._credits[user_id] = new_balance
        self._save_data()
        return new_balance

    def get_credit_balance(self, user_id: str) -> int:
        """
        クレジット残高を取得

        Args:
            user_id: ユーザーID

        Returns:
            残高（円相当）
        """
        return self._credits.get(user_id, 0)

    def use_credit(self, user_id: str, amount: int) -> bool:
        """
        クレジットを使用

        Args:
            user_id: ユーザーID
            amount: 使用額

        Returns:
            成功したか
        """
        current = self._credits.get(user_id, 0)
        if current < amount:
            return False

        self._credits[user_id] = current - amount
        self._save_data()
        logger.info(f"クレジット使用: {user_id} -{amount}円 (残: {self._credits[user_id]}円)")
        return True

    def get_user_referrals(self, user_id: str) -> list[Referral]:
        """
        ユーザーの紹介一覧を取得

        Args:
            user_id: ユーザーID

        Returns:
            紹介リスト
        """
        return [r for r in self._referrals.values() if r.referrer_user_id == user_id]

    def get_user_code(self, user_id: str) -> Optional[ReferralCode]:
        """
        ユーザーの紹介コードを取得

        Args:
            user_id: ユーザーID

        Returns:
            ReferralCode または None
        """
        for code_obj in self._codes.values():
            if code_obj.user_id == user_id and code_obj.is_valid():
                return code_obj
        return None

    def get_referral_stats(self, user_id: str) -> dict:
        """
        紹介統計を取得

        Args:
            user_id: ユーザーID

        Returns:
            統計辞書
        """
        referrals = self.get_user_referrals(user_id)
        code = self.get_user_code(user_id)

        total_earned = sum(r.reward_amount for r in referrals if r.status == ReferralStatus.REWARDED)
        pending_count = sum(1 for r in referrals if r.status == ReferralStatus.PENDING)
        qualified_count = sum(1 for r in referrals if r.status in [ReferralStatus.QUALIFIED, ReferralStatus.REWARDED])

        return {
            "referral_code": code.code if code else None,
            "referral_url": f"https://ecomtrend.ai/register?ref={code.code}" if code else None,
            "total_referrals": len(referrals),
            "pending_referrals": pending_count,
            "qualified_referrals": qualified_count,
            "total_earned": total_earned,
            "credit_balance": self.get_credit_balance(user_id),
            "reward_per_referral": DEFAULT_REWARD.referrer_reward,
            "referrals": [
                {
                    "referral_id": r.referral_id,
                    "status": r.status.value,
                    "created_at": r.created_at.isoformat(),
                    "qualified_at": r.qualified_at.isoformat() if r.qualified_at else None,
                    "reward_amount": r.reward_amount if r.status == ReferralStatus.REWARDED else 0,
                }
                for r in referrals
            ],
        }
