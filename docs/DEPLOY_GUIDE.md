# EcomTrendAI デプロイガイド

## 概要
本番環境へのデプロイ手順です。

## 1. フロントエンド（Vercel）

### ワンクリックデプロイ
下記ボタンをクリックしてVercelにデプロイ：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/EcomTrendAI&root-directory=dashboard&project-name=ecomtrend-dashboard&env=NEXT_PUBLIC_API_URL)

### 手動デプロイ手順
1. [Vercel](https://vercel.com) にサインイン
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. 設定：
   - **Root Directory**: `dashboard`
   - **Framework Preset**: Next.js
5. 環境変数を設定：
   - `NEXT_PUBLIC_API_URL`: `https://api.ecomtrend.ai`
6. 「Deploy」をクリック

## 2. バックエンド（選択肢）

### 選択肢A: Render（推奨・無料枠あり）

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/EcomTrendAI)

**手動設定**:
1. [Render](https://render.com) にサインイン
2. 「New Web Service」を選択
3. GitHubリポジトリを連携
4. 設定：
   - **Name**: `ecomtrend-api`
   - **Root Directory**: `.`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn src.api:app --bind 0.0.0.0:$PORT -k uvicorn.workers.UvicornWorker`
5. 環境変数を設定：
   - `STRIPE_SECRET_KEY`: sk_live_xxx
   - `STRIPE_WEBHOOK_SECRET`: whsec_xxx
   - `STRIPE_PRICE_PRO`: price_xxx
   - `STRIPE_PRICE_ENTERPRISE`: price_xxx
   - `DATABASE_URL`: (自動設定)

### 選択肢B: Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/xxx)

### 選択肢C: Docker（VPS）

```bash
# サーバーにSSH接続
ssh user@your-server.com

# リポジトリをクローン
git clone https://github.com/YOUR_USERNAME/EcomTrendAI.git
cd EcomTrendAI

# 環境変数を設定
cp .env.example .env
nano .env  # 値を編集

# Docker Composeで起動
docker-compose up -d

# SSL証明書取得
docker-compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d api.ecomtrend.ai
```

## 3. ドメイン設定

### DNS設定例（Cloudflare）
| タイプ | 名前 | 値 | プロキシ |
|--------|------|-----|---------|
| A | @ | Vercel IP | オン |
| CNAME | www | cname.vercel-dns.com | オン |
| A | api | バックエンドIP | オフ |

### Vercel側設定
1. Project Settings > Domains
2. `ecomtrend.ai` を追加
3. `www.ecomtrend.ai` を追加

## 4. Stripe設定

詳細は [STRIPE_SETUP.md](./STRIPE_SETUP.md) を参照。

### 必須手順
1. Stripeダッシュボードで商品・価格を作成
2. Webhookエンドポイントを設定: `https://api.ecomtrend.ai/webhooks/stripe`
3. イベントを選択:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. 署名シークレットを取得して環境変数に設定

## 5. 環境変数一覧

### バックエンド
| 変数名 | 必須 | 説明 |
|--------|------|------|
| `STRIPE_SECRET_KEY` | ○ | Stripeシークレットキー |
| `STRIPE_WEBHOOK_SECRET` | ○ | Webhook署名シークレット |
| `STRIPE_PRICE_PRO` | ○ | Proプラン価格ID |
| `STRIPE_PRICE_ENTERPRISE` | ○ | Enterpriseプラン価格ID |
| `DATABASE_URL` | △ | PostgreSQL URL（なければSQLite） |
| `LOG_LEVEL` | × | ログレベル（デフォルト: INFO） |

### フロントエンド
| 変数名 | 必須 | 説明 |
|--------|------|------|
| `NEXT_PUBLIC_API_URL` | ○ | バックエンドAPIのURL |

## 6. 本番チェックリスト

### デプロイ前
- [ ] テスト全パス: `pytest tests/ -v`
- [ ] Lint通過: `cd dashboard && npm run lint`
- [ ] ビルド成功: `cd dashboard && npm run build`
- [ ] セキュリティスキャン: `bandit -r src/`

### デプロイ後
- [ ] フロントエンドアクセス確認
- [ ] APIヘルスチェック: `curl https://api.ecomtrend.ai/health`
- [ ] ユーザー登録テスト
- [ ] Stripeチェックアウトテスト
- [ ] Webhookテスト

## 7. トラブルシューティング

### フロントエンドが表示されない
- Vercelのデプロイログを確認
- 環境変数が正しく設定されているか確認

### APIが応答しない
- サーバーログを確認: `docker-compose logs api`
- ポート設定を確認

### Stripe決済が失敗する
- 価格IDが本番用か確認（sk_live_, price_xxx）
- Webhookシークレットが正しいか確認

### SSL証明書エラー
- Certbotのログを確認
- ドメインDNSが正しく設定されているか確認

## 更新履歴
- 2026-01-11: 初版作成
