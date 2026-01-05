# 🛒 EcomTrendAI - Eコマーストレンド分析ツール

## 📋 プロジェクト概要

**目的**: AIを活用してEコマースのトレンドを特定・分析し、売れ筋商品や市場動向を可視化する

**対象プラットフォーム（初期）**:
- Amazon（Movers & Shakers、Best Sellers）
- eBay（Trending Items）
- 楽天市場（ランキング）※将来拡張

**言語/技術スタック**:
- Python 3.12+（データ収集・分析）
- requests / BeautifulSoup4（スクレイピング）
- Amazon Product Advertising API（アフィリエイトAPI）
- pandas / numpy（データ処理）
- Prophet / scikit-learn（将来のML予測）

---

## 📊 データ収集戦略

### API vs スクレイピング
| 方式 | 用途 | 注意点 |
|------|------|--------|
| Amazon PA-API | 商品情報・価格・レビュー数 | アフィリエイトアカウント必須 |
| スクレイピング | ランキング・トレンド情報 | robots.txt遵守・レート制限 |

### 収集データポイント
- 商品名 / ASIN / カテゴリ
- 現在ランク / 前日ランク / ランク変動率
- 価格 / レビュー数 / 評価
- タイムスタンプ

### レート制限対策
- リクエスト間隔: 1-3秒
- 1日あたり上限設定
- User-Agent ローテーション
- robots.txt自動確認

---

## 🤖 AI分析機能

### トレンド検出
1. **ランク変動分析**: 急上昇商品の検出（24h/7d/30d比較）
2. **カテゴリ別トレンド**: カテゴリ内の動向集計
3. **季節性分析**: 過去データからの周期パターン検出

### 将来のML機能
- **Prophet**: 時系列予測（需要予測）
- **LSTM**: 複雑な時系列パターン学習
- **LLM統合**: トレンドの自然言語サマリー生成

---

## 💰 マネタイズ戦略

### 1. アフィリエイト収益
- **実装**: 商品リンクにアフィリエイトID付与
- **対象**: Amazon Associates、楽天アフィリエイト
- **設定**: 環境変数 `AMAZON_AFFILIATE_ID` で管理
- **トラッキング**: クリック数・コンバージョン記録（将来）

```python
# アフィリエイトリンク生成例
AFFILIATE_TAG = os.getenv("AMAZON_AFFILIATE_ID", "ecomtrend-20")
affiliate_url = f"https://amazon.co.jp/dp/{asin}?tag={AFFILIATE_TAG}"
```

### 2. サブスクリプション（Premium）
| プラン | 価格 | 機能 |
|--------|------|------|
| Free | ¥0 | 日次トレンドレポート（上位10件） |
| Pro | ¥980/月 | リアルタイムアラート・全カテゴリ・API |
| Enterprise | ¥4,980/月 | カスタムダッシュボード・専用サポート |

**将来実装**:
- ユーザー認証システム（Firebase/Auth0）
- 決済統合（Stripe）
- アラート通知（Email/Slack/Discord）

---

## 🗂️ 開発計画

### Phase 1: データ収集基盤（現在）
- [x] プロジェクト構造作成
- [ ] Amazon PA-API認証設定
- [ ] データ取得スクリプト（scraper.py）
- [ ] ローカルDB/CSV保存

### Phase 2: 分析エンジン
- [ ] トレンドスコア計算アルゴリズム
- [ ] カテゴリ別集計
- [ ] レポート生成（Markdown/HTML）

### Phase 3: 自動化
- [ ] スケジューラ設定（Windows Task Scheduler）
- [ ] 定期実行（毎日6:00 JST）
- [ ] エラーハンドリング・リトライ

### Phase 4: マネタイズ実装
- [ ] アフィリエイトリンク自動付与
- [ ] ユーザーシステム構築
- [ ] 課金システム統合

### Phase 5: 拡張
- [ ] 複数プラットフォーム対応
- [ ] Webダッシュボード（Next.js）
- [ ] MLモデル統合

---

## 📁 ディレクトリ構造

```
EcomTrendAI/
├── CLAUDE.md           # このファイル
├── README.md           # ユーザー向けドキュメント
├── .env.example        # 環境変数テンプレート
├── requirements.txt    # Python依存関係
├── src/
│   ├── __init__.py
│   ├── scraper.py      # データ収集
│   ├── analyzer.py     # トレンド分析
│   ├── reporter.py     # レポート生成
│   └── config.py       # 設定管理
├── data/
│   └── raw/            # 生データ保存
├── reports/
│   └── trends_YYYYMMDD.md
├── tests/
│   └── test_analyzer.py
├── docs/
│   └── api_setup.md    # API設定ガイド
└── .claude/
    └── settings.json
```

---

## ⚠️ 注意事項

### 法的・倫理的考慮
- **利用規約遵守**: 各プラットフォームのToS確認
- **robots.txt**: 自動確認・遵守
- **個人情報**: 収集しない
- **著作権**: 商品画像は直リンクのみ（保存禁止）

### 品質管理
- データ欠損時のフォールバック処理
- 異常値検出（価格0円など）
- APIエラー時のリトライ（指数バックオフ）

---

## 🔧 環境変数

```bash
# .env
AMAZON_AFFILIATE_ID=your-tag-20
AMAZON_ACCESS_KEY=AKIAXXXXXXXX
AMAZON_SECRET_KEY=xxxxxxxxx
AMAZON_PARTNER_TAG=your-tag-20
LOG_LEVEL=INFO
```

---

## 📈 成功指標

| 指標 | 目標（3ヶ月） | 目標（1年） |
|------|--------------|------------|
| 日次データ収集 | 1,000商品 | 10,000商品 |
| アフィリエイト収益 | ¥10,000/月 | ¥100,000/月 |
| 有料ユーザー | 10人 | 100人 |
| データ精度 | 95%+ | 99%+ |
