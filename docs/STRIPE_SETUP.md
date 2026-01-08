# Stripe 本番設定ガイド

## 概要
EcomTrendAIの課金機能を有効化するためのStripe設定手順です。

## 1. Stripeアカウント準備

### 1.1 アカウント作成
1. [Stripe](https://stripe.com/jp) にアクセス
2. 「今すぐ始める」でアカウント作成
3. メール確認を完了

### 1.2 本番有効化
1. ダッシュボード > アカウント設定
2. ビジネス情報を入力
3. 銀行口座を登録
4. 本番モードを有効化

## 2. APIキー取得

### 2.1 場所
開発者 > APIキー

### 2.2 キーの種類
| キー | 用途 | 形式 |
|------|------|------|
| 公開可能キー | クライアント側（使用しない） | pk_live_xxx |
| シークレットキー | サーバー側（必須） | sk_live_xxx |

### 2.3 環境変数設定
```bash
# .env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
```

## 3. 商品・価格設定

### 3.1 Proプラン作成
1. 商品 > +商品を追加
2. 入力内容：
   - 名前: `EcomTrendAI Pro`
   - 説明: `日次100件、全カテゴリ、リアルタイムアラート、CSV/JSON出力`
3. 価格を追加：
   - 金額: ¥980
   - 請求期間: 毎月
   - 請求タイプ: 継続

**価格ID取得** → `STRIPE_PRICE_PRO` に設定

### 3.2 Enterpriseプラン作成
1. 商品 > +商品を追加
2. 入力内容：
   - 名前: `EcomTrendAI Enterprise`
   - 説明: `無制限、カスタムダッシュボード、専用サポート`
3. 価格を追加：
   - 金額: ¥4,980
   - 請求期間: 毎月
   - 請求タイプ: 継続

**価格ID取得** → `STRIPE_PRICE_ENTERPRISE` に設定

### 3.3 環境変数
```bash
# .env
STRIPE_PRICE_PRO=price_1Xxxxxxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE=price_1Yyyyyyyyyyyyyyyyy
```

## 4. Webhook設定

### 4.1 エンドポイント追加
1. 開発者 > Webhooks > エンドポイントを追加
2. URL: `https://api.yourdomain.com/webhooks/stripe`
3. バージョン: 最新のAPIバージョン

### 4.2 イベント選択
以下のイベントを選択：
- `checkout.session.completed` - 決済完了
- `customer.subscription.updated` - サブスクリプション更新
- `customer.subscription.deleted` - サブスクリプション削除
- `invoice.payment_failed` - 支払い失敗

### 4.3 署名シークレット
エンドポイント作成後、「署名シークレット」を確認：
```bash
# .env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

## 5. 設定完了確認

### 5.1 環境変数チェックリスト
```bash
# 必須
STRIPE_SECRET_KEY=sk_live_xxx       # 本番シークレットキー
STRIPE_WEBHOOK_SECRET=whsec_xxx     # Webhook署名シークレット
STRIPE_PRICE_PRO=price_xxx          # Proプラン価格ID
STRIPE_PRICE_ENTERPRISE=price_xxx   # Enterpriseプラン価格ID
```

### 5.2 動作確認（Stripe CLI）
```bash
# Stripe CLIインストール
# https://stripe.com/docs/stripe-cli

# ローカルでWebhookテスト
stripe listen --forward-to localhost:8000/webhooks/stripe

# テストイベント送信
stripe trigger checkout.session.completed
```

### 5.3 APIテスト
```bash
# ユーザー登録
curl -X POST https://api.yourdomain.com/users/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# プラン一覧確認
curl https://api.yourdomain.com/billing/plans

# アップグレード（Checkout URL取得）
curl -X POST https://api.yourdomain.com/billing/upgrade \
  -H "X-API-Key: ect_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"plan": "pro", "success_url": "https://yourdomain.com/success", "cancel_url": "https://yourdomain.com/cancel"}'
```

## 6. 料金プラン一覧

| プラン | 月額 | 機能 |
|--------|------|------|
| Free | ¥0 | 日次10件、2カテゴリ、API 100回/日 |
| Pro | ¥980 | 日次100件、全カテゴリ、アラート、エクスポート |
| Enterprise | ¥4,980 | 無制限、ダッシュボード、専用サポート |

## 7. トラブルシューティング

### Webhook検証失敗
- 署名シークレットが正しいか確認
- Webhook URLがHTTPSか確認
- タイムスタンプのずれがないか確認（サーバー時刻）

### 決済が完了しない
- 価格IDが正しいか確認（本番/テストの混在注意）
- success_url/cancel_urlが有効なURLか確認

### 顧客が作成されない
- STRIPE_SECRET_KEYが設定されているか確認
- 本番キー（sk_live_）を使用しているか確認

## 8. セキュリティ注意事項

- シークレットキーをリポジトリにコミットしない
- 環境変数で管理
- 本番とテストのキーを混同しない
- Webhook署名を必ず検証する

## 更新履歴
- 2026-01-09: 初版作成
