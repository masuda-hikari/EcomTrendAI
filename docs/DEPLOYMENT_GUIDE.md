# EcomTrendAI 本番デプロイガイド

## 概要
本ガイドでは、EcomTrendAI APIを本番環境にデプロイする手順を説明します。

## 前提条件
- Python 3.12+
- サーバー（VPS/クラウド）
- ドメイン（オプション）
- SSL証明書（本番必須）

## 1. サーバーセットアップ

### 1.1 依存関係インストール
```bash
# プロジェクトディレクトリに移動
cd /path/to/EcomTrendAI

# 仮想環境作成
python -m venv venv
source venv/bin/activate  # Linux/Mac
# または venv\Scripts\activate  # Windows

# 依存関係インストール
pip install -r requirements.txt
```

### 1.2 環境変数設定
```bash
# .env.example を .env にコピー
cp .env.example .env

# 本番用に編集
nano .env
```

必須設定：
```bash
# Stripe（課金機能）
STRIPE_SECRET_KEY=sk_live_xxxxx  # 本番キー
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_PRO=price_xxxxx_pro
STRIPE_PRICE_ENTERPRISE=price_xxxxx_enterprise

# API
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=https://yourdomain.com
```

## 2. Stripe本番設定

### 2.1 Stripeアカウント設定
1. [Stripe Dashboard](https://dashboard.stripe.com) にログイン
2. 本番モードに切り替え
3. APIキー取得：
   - 開発者 > APIキー > シークレットキー（sk_live_xxx）

### 2.2 商品・価格設定
1. 商品 > +商品を追加
2. 以下の商品を作成：

**Pro プラン**
- 名前: EcomTrendAI Pro
- 価格: ¥980/月（recurring）
- 価格ID: `STRIPE_PRICE_PRO` に設定

**Enterprise プラン**
- 名前: EcomTrendAI Enterprise
- 価格: ¥4,980/月（recurring）
- 価格ID: `STRIPE_PRICE_ENTERPRISE` に設定

### 2.3 Webhook設定
1. 開発者 > Webhooks > エンドポイントを追加
2. URL: `https://yourdomain.com/webhooks/stripe`
3. イベント選択：
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_failed
4. 署名シークレットを `STRIPE_WEBHOOK_SECRET` に設定

## 3. サーバー起動

### 3.1 開発モード（テスト用）
```bash
python src/api.py --host 0.0.0.0 --port 8000
```

### 3.2 本番モード（Gunicorn + Uvicorn）
```bash
# Gunicornインストール
pip install gunicorn

# 起動（4ワーカー）
cd src && gunicorn api:create_app -k uvicorn.workers.UvicornWorker -w 4 -b 0.0.0.0:8000
```

### 3.3 systemdサービス（Linux）
```bash
# /etc/systemd/system/ecomtrend-api.service
[Unit]
Description=EcomTrendAI API Server
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/EcomTrendAI
Environment="PATH=/path/to/EcomTrendAI/venv/bin"
ExecStart=/path/to/EcomTrendAI/venv/bin/gunicorn src.api:create_app -k uvicorn.workers.UvicornWorker -w 4 -b 127.0.0.1:8000

[Install]
WantedBy=multi-user.target
```

有効化：
```bash
sudo systemctl enable ecomtrend-api
sudo systemctl start ecomtrend-api
sudo systemctl status ecomtrend-api
```

## 4. Nginx リバースプロキシ

### 4.1 設定ファイル
```nginx
# /etc/nginx/sites-available/ecomtrend-api
server {
    listen 80;
    server_name api.ecomtrend.ai;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.ecomtrend.ai;

    ssl_certificate /etc/letsencrypt/live/api.ecomtrend.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.ecomtrend.ai/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4.2 SSL証明書（Let's Encrypt）
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.ecomtrend.ai
```

## 5. 動作確認

### 5.1 ヘルスチェック
```bash
curl https://api.ecomtrend.ai/health
# {"status": "healthy"}
```

### 5.2 ユーザー登録テスト
```bash
curl -X POST https://api.ecomtrend.ai/users/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 5.3 Webhook疎通確認
Stripe CLIを使用：
```bash
stripe listen --forward-to https://api.ecomtrend.ai/webhooks/stripe
stripe trigger checkout.session.completed
```

## 6. 監視・ログ

### 6.1 ログ確認
```bash
# systemdログ
sudo journalctl -u ecomtrend-api -f

# アプリケーションログ
tail -f /path/to/EcomTrendAI/logs/app.log
```

### 6.2 監視項目
- API応答時間
- エラー率
- サブスクリプション状況
- API使用量

## 7. セキュリティチェックリスト

- [ ] HTTPS有効化
- [ ] CORS設定（本番ドメインのみ許可）
- [ ] Stripe本番キー使用
- [ ] 環境変数でシークレット管理
- [ ] ファイアウォール設定（8000ポートは内部のみ）
- [ ] レート制限確認

## 8. トラブルシューティング

### API起動しない
```bash
# 依存関係確認
pip list | grep -E "fastapi|uvicorn|stripe"

# ポート確認
netstat -tlnp | grep 8000
```

### Stripe Webhook失敗
1. 署名シークレット確認
2. URLが正しいか確認
3. Stripeダッシュボードでイベント履歴確認

### 認証エラー
```bash
# APIキー形式確認
# 正: ect_xxxxxxx
# 誤: sk_xxxxx（これはStripeキー）
```

## 更新履歴
- 2026-01-09: 初版作成
