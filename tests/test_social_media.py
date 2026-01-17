"""SNS自動投稿システムのテスト"""

import json
import pytest
from pathlib import Path
from datetime import datetime
from src.social_media import SocialMediaManager


@pytest.fixture
def manager(tmp_path):
    """テスト用マネージャー"""
    data_dir = tmp_path / "collected"
    data_dir.mkdir()

    # テスト用市場データ作成
    market_dir = data_dir / "market"
    market_dir.mkdir()
    market_data = {
        "collected_at": "2026-01-17",
        "data": {
            "btoc_ec": {
                "2024": {
                    "market_size_trillion_yen": 26.1,
                    "growth_rate": 5.1,
                    "ec_adoption_rate": 9.8
                }
            }
        }
    }
    with open(market_dir / "test_market.json", 'w', encoding='utf-8') as f:
        json.dump(market_data, f)

    # テスト用競合データ作成
    competitor_dir = data_dir / "competitor"
    competitor_dir.mkdir()
    competitor_data = {
        "our_positioning": {
            "target_price": "¥980/月"
        }
    }
    with open(competitor_dir / "test_competitor.json", 'w', encoding='utf-8') as f:
        json.dump(competitor_data, f)

    mgr = SocialMediaManager(data_dir=str(data_dir))
    mgr.templates_dir = tmp_path / "social_templates"
    mgr.templates_dir.mkdir()
    mgr.post_history_file = mgr.templates_dir / "post_history.json"

    return mgr


def test_load_market_data(manager):
    """市場データ読み込みテスト"""
    data = manager.load_market_data()
    assert data is not None
    assert data['data']['btoc_ec']['2024']['market_size_trillion_yen'] == 26.1


def test_load_competitor_data(manager):
    """競合データ読み込みテスト"""
    data = manager.load_competitor_data()
    assert data is not None
    assert data['our_positioning']['target_price'] == "¥980/月"


def test_generate_market_insight_post(manager):
    """市場分析投稿生成テスト"""
    market_data = manager.load_market_data()
    post = manager.generate_market_insight_post(market_data)

    assert isinstance(post, str)
    assert len(post) > 0
    assert "26.1兆円" in post or "26.1" in post
    assert "#" in post  # ハッシュタグが含まれる
    assert len(post) <= 280  # Twitter文字数制限


def test_generate_competitor_comparison_post(manager):
    """競合比較投稿生成テスト"""
    competitor_data = manager.load_competitor_data()
    post = manager.generate_competitor_comparison_post(competitor_data)

    assert isinstance(post, str)
    assert len(post) > 0
    assert "¥980" in post
    assert "#" in post
    assert len(post) <= 280


def test_generate_tips_post(manager):
    """ノウハウ投稿生成テスト"""
    post = manager.generate_tips_post()

    assert isinstance(post, str)
    assert len(post) > 0
    assert "#" in post
    assert len(post) <= 280


def test_generate_daily_post(manager):
    """日次投稿生成テスト"""
    posts = manager.generate_daily_post()

    assert 'morning' in posts
    assert 'evening' in posts
    assert isinstance(posts['morning'], str)
    assert isinstance(posts['evening'], str)
    assert len(posts['morning']) > 0
    assert len(posts['evening']) > 0


def test_generate_weekly_schedule(manager):
    """週間スケジュール生成テスト"""
    schedule = manager.generate_weekly_schedule()

    assert len(schedule) == 14  # 7日 × 2投稿/日
    assert all('content' in post for post in schedule)
    assert all('scheduled_time' in post for post in schedule)
    assert all('type' in post for post in schedule)

    # タイプチェック
    types = [post['type'] for post in schedule]
    assert types.count('morning') == 7
    assert types.count('evening') == 7

    # 時刻チェック
    for post in schedule:
        dt = datetime.fromisoformat(post['scheduled_time'])
        if post['type'] == 'morning':
            assert dt.hour == 9
        elif post['type'] == 'evening':
            assert dt.hour == 18


def test_save_and_load_post_history(manager):
    """投稿履歴保存・読み込みテスト"""
    # 初期状態は空
    history = manager.load_post_history()
    assert history == []

    # 投稿を保存
    manager.save_post_to_queue("テスト投稿", "2026-01-17T09:00:00")

    # 読み込み確認
    history = manager.load_post_history()
    assert len(history) == 1
    assert history[0]['content'] == "テスト投稿"
    assert history[0]['status'] == 'queued'


def test_export_to_buffer(manager, tmp_path):
    """Buffer CSV出力テスト"""
    output_file = tmp_path / "test_export.csv"
    csv_path = manager.export_to_buffer(output_file=str(output_file))

    assert Path(csv_path).exists()

    # CSV内容確認
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        lines = f.readlines()
        assert len(lines) > 1  # ヘッダー + データ
        assert 'Content' in lines[0]
        assert 'Scheduled Time' in lines[0]


def test_post_content_length(manager):
    """投稿文字数制限テスト"""
    # 各種投稿タイプの文字数チェック
    market_data = manager.load_market_data()
    competitor_data = manager.load_competitor_data()

    posts = [
        manager.generate_market_insight_post(market_data),
        manager.generate_competitor_comparison_post(competitor_data),
        manager.generate_tips_post(),
    ]

    for post in posts:
        # Twitter文字数制限（280文字）を超えないこと
        assert len(post) <= 280, f"投稿が長すぎます: {len(post)}文字"


def test_hashtag_presence(manager):
    """ハッシュタグ存在確認テスト"""
    schedule = manager.generate_weekly_schedule()

    for post in schedule:
        content = post['content']
        assert '#' in content, "ハッシュタグがありません"

        # 最低1つのハッシュタグ
        hashtag_count = content.count('#')
        assert hashtag_count >= 1


def test_content_variety(manager):
    """投稿内容の多様性テスト"""
    schedule = manager.generate_weekly_schedule()
    contents = [post['content'] for post in schedule]

    # 全て同じ投稿でないことを確認
    unique_contents = set(contents)
    assert len(unique_contents) > 1, "投稿内容が単調すぎます"
