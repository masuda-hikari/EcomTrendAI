"""SNS自動投稿システム

X/Twitter への自動投稿機能を提供します。
収集したトレンドデータを基にエンゲージメントの高い投稿を自動生成します。
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
import random


class SocialMediaManager:
    """SNS投稿管理クラス"""

    def __init__(self, data_dir: str = "data/collected"):
        self.data_dir = Path(data_dir)
        self.templates_dir = Path("data/social_templates")
        self.templates_dir.mkdir(parents=True, exist_ok=True)
        self.post_history_file = self.templates_dir / "post_history.json"

    def load_market_data(self) -> Optional[Dict]:
        """最新の市場データを読み込む"""
        market_dir = self.data_dir / "market"
        if not market_dir.exists():
            return None

        # 最新ファイルを取得
        files = sorted(market_dir.glob("*.json"), reverse=True)
        if not files:
            return None

        with open(files[0], 'r', encoding='utf-8') as f:
            return json.load(f)

    def load_competitor_data(self) -> Optional[Dict]:
        """最新の競合データを読み込む"""
        competitor_dir = self.data_dir / "competitor"
        if not competitor_dir.exists():
            return None

        files = sorted(competitor_dir.glob("*.json"), reverse=True)
        if not files:
            return None

        with open(files[0], 'r', encoding='utf-8') as f:
            return json.load(f)

    def generate_market_insight_post(self, market_data: Dict) -> str:
        """市場分析投稿を生成"""
        btoc = market_data['data']['btoc_ec']['2024']
        growth = btoc['growth_rate']
        size = btoc['market_size_trillion_yen']

        templates = [
            f"📊 日本のEC市場、{size}兆円に到達！\n\n前年比{growth}%増と堅調な成長を継続中。\nEC化率は{btoc['ec_adoption_rate']}%でまだまだ伸びしろあり。\n\n今がECビジネス参入の好機です💡\n\n#EC市場 #Amazon #楽天 #物販ビジネス",

            f"💰 2024年のEC市場規模は{size}兆円\n\n・前年比: +{growth}%\n・EC化率: {btoc['ec_adoption_rate']}%\n・伸び代: まだまだ大きい\n\nデータに基づいた商品選定で、あなたも勝ち組に👊\n\n#トレンド分析 #EC #データ分析",

            f"🚀 EC市場が熱い！\n\n日本のBtoC EC市場:\n📈 {size}兆円（前年比+{growth}%）\n📊 EC化率{btoc['ec_adoption_rate']}%\n🎯 まだ伸びる余地あり\n\nトレンドを掴んで先行者利益を🔥\n\n#副業 #せどり #Amazon物販"
        ]

        return random.choice(templates)

    def generate_competitor_comparison_post(self, competitor_data: Dict) -> str:
        """競合比較投稿を生成"""
        our_price = competitor_data['our_positioning']['target_price']

        templates = [
            f"💡 Amazon分析ツール、高すぎませんか？\n\n競合ツール: ¥4,500-¥43,000/月\nEcomTrendAI: {our_price}/月\n\n✅ AI自動分析\n✅ 日本市場特化\n✅ 初心者でも簡単\n\n78%安く、同等以上の機能を💪\n\n#Amazon #物販 #コスパ",

            f"🔥 朗報！破格のAmazonトレンド分析ツール\n\n他社ツール月額:\n・Jungle Scout: $29-84\n・Helium 10: $39-279\n\nEcomTrendAI: {our_price}/月🎉\n\nしかも日本市場に特化👍\n\n#EC #Amazon #楽天",

            f"⚡ なぜ高額ツールに払い続ける？\n\n海外ツール: 月4,500-43,000円\nEcomTrendAI: {our_price}\n\n【差額で何ができる？】\n・仕入れ資金に回す\n・広告費に投資\n・利益として確保\n\n賢い選択を💡\n\n#せどり #副業 #節約"
        ]

        return random.choice(templates)

    def generate_tips_post(self) -> str:
        """ノウハウ投稿を生成"""
        tips = [
            "🎯 売れ筋商品の見つけ方\n\n1. ランク急上昇商品をチェック\n2. レビュー数と評価を確認\n3. 価格変動履歴を分析\n4. 季節性を考慮\n5. 競合の在庫状況を把握\n\nこの5ステップで勝率UP📈\n\n#Amazon #物販 #せどり",

            "💰 EC利益率を上げる3つのコツ\n\n✅ トレンド商品に早期参入\n✅ 適正な価格設定（高すぎず安すぎず）\n✅ レビュー獲得で信頼性UP\n\nデータ分析で確実に稼ぐ💪\n\n#EC #副業 #Amazon",

            "📊 失敗しない商品選定\n\n❌ 感覚で選ぶ\n✅ データで選ぶ\n\n・ランク変動率\n・検索ボリューム\n・競合数\n・利益率\n\n数字が全てを教えてくれる📈\n\n#データ分析 #EC #物販",

            "🔥 今すぐチェックすべき指標\n\n1. Amazon Best Sellers Rank\n2. Movers & Shakers（急上昇）\n3. 検索キーワードトレンド\n4. レビュー増加率\n5. 価格推移\n\n毎日10分の分析が利益を生む💡\n\n#Amazon #トレンド #EC",

            "⚡ EC初心者が陥る3つの罠\n\n1. 人気商品 = 売れる商品ではない\n2. 安く仕入れても利益が出ない場合も\n3. トレンドには賞味期限がある\n\nデータで正しく判断しよう📊\n\n#せどり #副業 #EC初心者"
        ]

        return random.choice(tips)

    def generate_daily_post(self) -> Dict[str, str]:
        """日次投稿を生成（朝・夕の2投稿）"""
        market_data = self.load_market_data()
        competitor_data = self.load_competitor_data()

        posts = {}

        # 朝9時: トレンド情報・市場分析
        if market_data and random.random() > 0.5:
            posts['morning'] = self.generate_market_insight_post(market_data)
        else:
            posts['morning'] = self.generate_tips_post()

        # 夕方18時: 競合比較・ノウハウ
        if competitor_data and random.random() > 0.5:
            posts['evening'] = self.generate_competitor_comparison_post(competitor_data)
        else:
            posts['evening'] = self.generate_tips_post()

        return posts

    def save_post_to_queue(self, post_content: str, scheduled_time: str) -> None:
        """投稿をキューに保存"""
        history = self.load_post_history()

        post_entry = {
            'content': post_content,
            'scheduled_time': scheduled_time,
            'created_at': datetime.now().isoformat(),
            'status': 'queued'
        }

        history.append(post_entry)

        with open(self.post_history_file, 'w', encoding='utf-8') as f:
            json.dump(history, f, ensure_ascii=False, indent=2)

    def load_post_history(self) -> List[Dict]:
        """投稿履歴を読み込む"""
        if not self.post_history_file.exists():
            return []

        with open(self.post_history_file, 'r', encoding='utf-8') as f:
            return json.load(f)

    def generate_weekly_schedule(self) -> List[Dict[str, str]]:
        """1週間分の投稿スケジュールを生成"""
        schedule = []

        for day in range(7):
            date = datetime.now() + timedelta(days=day)
            posts = self.generate_daily_post()

            # 朝9時投稿
            morning_time = date.replace(hour=9, minute=0, second=0)
            schedule.append({
                'content': posts['morning'],
                'scheduled_time': morning_time.isoformat(),
                'type': 'morning'
            })

            # 夕方18時投稿
            evening_time = date.replace(hour=18, minute=0, second=0)
            schedule.append({
                'content': posts['evening'],
                'scheduled_time': evening_time.isoformat(),
                'type': 'evening'
            })

        return schedule

    def export_to_buffer(self, output_file: str = "data/social_templates/buffer_import.csv") -> str:
        """Buffer（SNS管理ツール）用CSVにエクスポート"""
        import csv

        schedule = self.generate_weekly_schedule()

        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            writer.writerow(['Content', 'Scheduled Time', 'Type'])

            for post in schedule:
                writer.writerow([
                    post['content'],
                    post['scheduled_time'],
                    post['type']
                ])

        return str(output_path)


def main():
    """メイン実行"""
    import sys
    import io

    # Windows環境でUnicode出力を有効化
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    manager = SocialMediaManager()

    # 1週間分のスケジュール生成
    print("■ 1週間分の投稿スケジュールを生成中...")
    schedule = manager.generate_weekly_schedule()

    print(f"\n✓ {len(schedule)}件の投稿を生成しました\n")

    # プレビュー表示
    for i, post in enumerate(schedule[:4], 1):  # 最初の4件のみ表示
        scheduled_dt = datetime.fromisoformat(post['scheduled_time'])
        print(f"[{i}] {scheduled_dt.strftime('%Y-%m-%d %H:%M')} ({post['type']})")
        print(post['content'])
        print("-" * 60)

    if len(schedule) > 4:
        print(f"\n... 他 {len(schedule) - 4} 件\n")

    # CSV出力
    csv_path = manager.export_to_buffer()
    print(f"\n■ CSVファイルを出力しました: {csv_path}")
    print("\nこのCSVをBuffer（https://buffer.com）にインポートして自動投稿を設定できます。")
    print("または、Zapier/IFTTT/Make.comなどで自動化することも可能です。")


if __name__ == "__main__":
    main()
