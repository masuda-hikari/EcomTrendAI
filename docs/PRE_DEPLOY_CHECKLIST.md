# EcomTrendAI デプロイ前チェックリスト

最終確認日: 2026-01-10

## コード品質チェック

### バックエンド
- [x] テスト全件パス: 167件（5.14秒）
- [x] テストカバレッジ: 81%（目標80%達成）
- [x] banditセキュリティスキャン: MEDIUM警告2件（0.0.0.0バインディング、Dockerコンテナ用で許容）
- [x] pip-audit依存関係スキャン: 脆弱性なし

### フロントエンド
- [x] ESLintエラー: 0件
- [x] ビルド成功: 12ページ
- [x] TypeScript型チェック: パス

## セキュリティチェック

| 項目 | 状態 | 備考 |
|------|------|------|
| SQLインジェクション対策 | ✅ | パラメータバインディング使用 |
| XSS対策 | ✅ | React自動エスケープ |
| CSRF対策 | ✅ | APIキー認証 |
| 認証情報管理 | ✅ | 環境変数で管理 |
| HTTPS強制 | ⏳ | デプロイ時にNginx + Let's Encrypt設定 |
| Rate Limiting | ✅ | APIキー別制限実装 |

## 法務対応

| 項目 | 状態 | パス |
|------|------|------|
| プライバシーポリシー | ✅ | /privacy |
| 利用規約 | ✅ | /terms |
| 特定商取引法表記 | ✅ | /legal/commerce |
| お問い合わせ | ✅ | /contact |

## 機能一覧

### 実装済み機能
1. **データ取得**: Amazonスクレイピング（Movers & Shakers）
2. **トレンド分析**: スコア計算、カテゴリ別分析、急上昇検出
3. **レポート生成**: HTML/Markdown出力
4. **配信システム**: Email, Slack, Discord
5. **ユーザー認証**: 登録、ログイン、APIキー
6. **課金システム**: Stripe統合（Free/Pro/Enterprise）
7. **REST API**: トレンド取得、エクスポート
8. **Webダッシュボード**: 12ページ

### API エンドポイント
| エンドポイント | メソッド | 認証 | 説明 |
|---------------|----------|------|------|
| /api/health | GET | 不要 | ヘルスチェック |
| /api/plans | GET | 不要 | 料金プラン一覧 |
| /api/contact | POST | 不要 | お問い合わせ送信 |
| /api/auth/register | POST | 不要 | ユーザー登録 |
| /api/auth/login | POST | 不要 | ログイン |
| /api/users/me | GET | 要 | 現在のユーザー情報 |
| /api/users/api-keys | POST | 要 | APIキー生成 |
| /api/trends | GET | 要 | トレンド一覧 |
| /api/trends/categories | GET | 要 | カテゴリ別トレンド |
| /api/trends/movers | GET | 要(Pro) | 急上昇商品 |
| /api/trends/export/csv | GET | 要(Pro) | CSVエクスポート |
| /api/billing/upgrade | POST | 要 | プランアップグレード |
| /api/billing/webhook | POST | Stripe | Webhook処理 |

## デプロイ手順

### 1. フロントエンド（Vercel）
```bash
# 1. Vercelにログイン
# 2. https://vercel.com/new でプロジェクト作成
# 3. GitHubリポジトリを連携
# 4. 環境変数設定:
#    NEXT_PUBLIC_API_URL=https://api.ecomtrend.ai
```

### 2. バックエンド（VPS + Docker）
```bash
# 1. VPS契約（ConoHa, さくら, DigitalOcean等）
# 2. SSH接続
ssh user@your-server-ip

# 3. Docker + Docker Composeインストール
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin

# 4. リポジトリクローン
git clone https://github.com/your-username/ecomtrendai.git
cd ecomtrendai

# 5. 環境変数設定
cp .env.example .env
# .envを編集（STRIPE_SECRET_KEY, SMTP設定等）

# 6. 起動
docker compose up -d

# 7. SSL証明書取得
docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d api.ecomtrend.ai
```

### 3. ドメイン設定
- `ecomtrend.ai` → Vercel
- `api.ecomtrend.ai` → VPS IP

### 4. Stripe本番設定
1. https://dashboard.stripe.com で本番モード有効化
2. 商品・価格ID作成
3. Webhookエンドポイント設定: `https://api.ecomtrend.ai/api/billing/webhook`

## 環境変数一覧

### バックエンド（.env）
```
# 必須
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxx
JWT_SECRET=your-secret-key
ADMIN_EMAIL=admin@ecomtrend.ai

# メール（お問い合わせ通知用）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASSWORD=app-password

# オプション
AMAZON_AFFILIATE_ID=your-tag-20
DISCORD_WEBHOOK_URL=xxx
SLACK_WEBHOOK_URL=xxx
```

### フロントエンド（Vercel）
```
NEXT_PUBLIC_API_URL=https://api.ecomtrend.ai
```

## 最終確認項目

- [ ] Vercelデプロイ成功
- [ ] VPSデプロイ成功
- [ ] SSL証明書有効
- [ ] API疎通確認
- [ ] Stripe決済テスト
- [ ] お問い合わせフォームテスト
- [ ] 各ページ表示確認
