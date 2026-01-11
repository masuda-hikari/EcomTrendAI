# EcomTrendAI

**AIトレンド分析で、Eコマースの売れ筋を先読み。**

[![CI/CD](https://github.com/YOUR_USERNAME/EcomTrendAI/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/EcomTrendAI/actions/workflows/ci.yml)
[![Test Coverage](https://img.shields.io/badge/coverage-81%25-brightgreen)](https://github.com/YOUR_USERNAME/EcomTrendAI)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## EcomTrendAIとは？

**EcomTrendAI**は、Amazon・eBay・楽天市場などのEコマースプラットフォームから商品トレンドを自動収集・分析し、**売れ筋商品**や**市場動向**をリアルタイムで可視化するツールです。

せどり、物販ビジネス、マーケティング担当者の方に、**データに基づいた商品選定**をサポートします。

### 主な機能

| 機能 | 説明 |
|------|------|
| **リアルタイムトレンド分析** | 急上昇商品を24時間以内に検出 |
| **カテゴリ別分析** | 家電、ファッション、食品など20+カテゴリ対応 |
| **自動日次レポート** | 毎朝8時にトレンドレポートをメール配信 |
| **REST API** | 外部システムとの連携が可能 |
| **アフィリエイト連携** | 商品リンクにアフィリエイトID自動付与 |
| **Webダッシュボード** | ブラウザで直感的に分析結果を確認 |

### デモ

**ランディングページ**: https://ecomtrend.ai
**サンプルレポート**: https://ecomtrend.ai/sample-report
**APIドキュメント**: https://api.ecomtrend.ai/docs

---

## クイックスタート

### 1. 無料で始める（Webダッシュボード）

1. https://ecomtrend.ai/register にアクセス
2. メールアドレスで登録（クレジットカード不要）
3. すぐにトレンド分析を開始！

### 2. 開発者向け（ローカル環境）

```bash
# リポジトリをクローン
git clone https://github.com/YOUR_USERNAME/EcomTrendAI.git
cd EcomTrendAI

# Python依存関係をインストール
pip install -r requirements.txt

# 環境変数を設定
cp .env.example .env
# .envファイルを編集してAPIキーを設定

# APIサーバー起動
python src/api.py

# ダッシュボード起動（別ターミナル）
cd dashboard
npm install
npm run dev
```

**アクセス**:
- API: http://localhost:8000
- ダッシュボード: http://localhost:3000
- APIドキュメント: http://localhost:8000/docs

---

## 料金プラン

| プラン | 月額 | 主な機能 |
|--------|------|----------|
| **Free** | ¥0 | 日次10件、2カテゴリ、API 100回/日 |
| **Pro** | ¥980 | 日次100件、全カテゴリ、リアルタイムアラート、CSV/JSON出力 |
| **Enterprise** | ¥4,980 | 無制限、カスタムダッシュボード、専用サポート |

**14日間返金保証**付き。安心してお試しください。

[プラン詳細を見る](https://ecomtrend.ai/pricing)

---

## API

### エンドポイント一覧

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| `GET` | `/trends` | トレンドデータ取得 | 必須 |
| `GET` | `/trends/categories` | カテゴリ別トレンド | 必須 |
| `GET` | `/trends/significant` | 大幅変動商品（Pro以上） | 必須 |
| `GET` | `/export/csv` | CSV出力（Pro以上） | 必須 |
| `GET` | `/export/json` | JSON出力（Pro以上） | 必須 |
| `POST` | `/users/register` | ユーザー登録 | 不要 |
| `GET` | `/users/me` | ユーザー情報取得 | 必須 |
| `POST` | `/billing/upgrade` | プランアップグレード | 必須 |
| `GET` | `/health` | ヘルスチェック | 不要 |

### 認証

```bash
# X-API-Keyヘッダーで認証
curl -H "X-API-Key: YOUR_API_KEY" https://api.ecomtrend.ai/trends

# または Authorizationヘッダー
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.ecomtrend.ai/trends
```

### レスポンス例

```json
{
  "date": "2026-01-11",
  "count": 10,
  "trends": [
    {
      "name": "ゲーミングチェア Pro X",
      "asin": "B0XXXXXXXXX",
      "category": "furniture",
      "current_rank": 15,
      "rank_change_percent": 285.5,
      "price": 29800,
      "trend_score": 92.3,
      "affiliate_url": "https://amazon.co.jp/dp/B0XXXXXXXXX?tag=ecomtrend-20"
    }
  ]
}
```

詳細は [APIドキュメント](https://api.ecomtrend.ai/docs) を参照してください。

---

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| バックエンド | Python 3.12+, FastAPI, SQLite/PostgreSQL |
| フロントエンド | Next.js 14, TypeScript, Tailwind CSS |
| 決済 | Stripe |
| インフラ | Docker, Vercel, Render |
| CI/CD | GitHub Actions |
| 監視 | Prometheus互換メトリクス |

---

## セキュリティ

- **レート制限**: DDoS対策、ブルートフォース防止
- **セキュリティヘッダー**: OWASP推奨ヘッダー適用
- **データ保護**: SSL/TLS暗号化、安全なAPIキー管理
- **監査ログ**: 全リクエストのログ記録

---

## デプロイ

### Vercel（フロントエンド）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/EcomTrendAI&root-directory=dashboard)

### Render（バックエンド）

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/EcomTrendAI)

詳細は [デプロイガイド](docs/DEPLOY_GUIDE.md) を参照してください。

---

## サポート

- **ドキュメント**: https://ecomtrend.ai/docs
- **お問い合わせ**: https://ecomtrend.ai/contact
- **GitHub Issues**: バグ報告・機能リクエスト

---

## ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照してください。

---

## 貢献

Issue、Pull Requestを歓迎します。

1. Fork
2. Feature Branchを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

---

**EcomTrendAI** - データで勝つ、Eコマース戦略を。
