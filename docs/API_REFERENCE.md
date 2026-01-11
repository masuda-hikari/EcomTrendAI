# EcomTrendAI API リファレンス

## 概要

EcomTrendAI REST APIの詳細仕様書です。

**ベースURL**: `https://api.ecomtrend.ai`
**OpenAPI**: `https://api.ecomtrend.ai/docs`

---

## 認証

APIにアクセスするにはAPIキーが必要です。

### APIキー取得方法

1. https://ecomtrend.ai/register で登録
2. ダッシュボードでAPIキーを発行
3. リクエストヘッダーにAPIキーを付与

### ヘッダー形式

```http
X-API-Key: YOUR_API_KEY
```

または

```http
Authorization: Bearer YOUR_API_KEY
```

### 認証エラー

| HTTPコード | 説明 |
|------------|------|
| 401 | APIキーが無効または未指定 |
| 403 | サブスクリプションが無効 |
| 429 | レート制限超過 |

---

## レート制限

| ユーザータイプ | 制限 |
|---------------|------|
| 未認証 | 10回/秒、100回/分 |
| 認証済み | 300回/分 |
| ログイン試行 | 5回/分 |

レート制限超過時は `429 Too Many Requests` を返します。

---

## エンドポイント

### General

#### GET /

APIステータスを取得。

**認証**: 不要

**レスポンス**:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-01-11T10:00:00.000000"
}
```

---

#### GET /health

ヘルスチェック。

**認証**: 不要

**レスポンス**:
```json
{
  "status": "healthy"
}
```

---

#### GET /health/detailed

詳細ヘルスチェック。監視システム用。

**認証**: 不要

**レスポンス**:
```json
{
  "status": "healthy",
  "checks": {
    "data_directory": {"status": "healthy", "exists": true, "writable": true},
    "subscribers": {"status": "healthy", "count": 150},
    "auth_service": {"status": "healthy", "user_count": 50},
    "stripe": {"status": "healthy", "mode": "live"},
    "email": {"status": "healthy", "configured": true},
    "system": {"python_version": "3.12.0", "timestamp": "..."}
  },
  "timestamp": "2026-01-11T10:00:00.000000"
}
```

---

#### GET /metrics

Prometheusメトリクス形式。

**認証**: 不要

**レスポンス** (text/plain):
```
ecomtrend_users_total 50
ecomtrend_subscribers_total 150
ecomtrend_api_up 1
```

---

### Trends（トレンドAPI）

#### GET /trends

最新のトレンドデータを取得。

**認証**: 必須

**パラメータ**:
| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| limit | int | No | 取得件数（デフォルト: 20、FREEは10まで） |
| category | string | No | カテゴリフィルタ |

**レスポンス**:
```json
{
  "date": "2026-01-11",
  "count": 10,
  "trends": [
    {
      "name": "商品名",
      "asin": "B0XXXXXXXXX",
      "category": "electronics",
      "current_rank": 15,
      "rank_change_percent": 285.5,
      "price": 29800,
      "trend_score": 92.3,
      "affiliate_url": "https://amazon.co.jp/dp/B0XXXXXXXXX?tag=ecomtrend-20"
    }
  ]
}
```

**エラー**:
- 403: カテゴリがプランで許可されていない

---

#### GET /trends/categories

カテゴリ別トレンドを取得。

**認証**: 必須

**レスポンス**:
```json
{
  "categories": {
    "electronics": [
      {"name": "商品名", "asin": "B0XXX", "rank_change_percent": 150.0}
    ],
    "furniture": [...]
  }
}
```

---

#### GET /trends/significant

大幅変動商品を取得。

**認証**: 必須
**プラン**: Pro以上

**パラメータ**:
| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| threshold | float | No | 変動率閾値（デフォルト: 80.0） |

**レスポンス**:
```json
{
  "threshold": 80.0,
  "count": 5,
  "items": [
    {
      "name": "商品名",
      "asin": "B0XXXXXXXXX",
      "category": "electronics",
      "rank_change_percent": 285.5,
      "affiliate_url": "https://..."
    }
  ]
}
```

---

### Users（ユーザー管理）

#### POST /users/register

新規ユーザー登録。FREEプランで登録され、APIキーが発行されます。

**認証**: 不要

**リクエスト**:
```json
{
  "email": "user@example.com"
}
```

**レスポンス**:
```json
{
  "user_id": "uuid-xxx",
  "email": "user@example.com",
  "plan": "free",
  "plan_name": "Free",
  "is_active": true,
  "expires": null,
  "api_key": "eak_xxxxxxxxxxxx"
}
```

**エラー**:
- 400: メールアドレス重複

---

#### GET /users/me

現在のユーザー情報を取得。

**認証**: 必須

**レスポンス**:
```json
{
  "user_id": "uuid-xxx",
  "email": "user@example.com",
  "plan": "pro",
  "plan_name": "Pro",
  "is_active": true,
  "expires": "2026-02-11T00:00:00.000000",
  "limits": {
    "daily_reports": 100,
    "categories": -1,
    "api_calls_per_day": 10000,
    "realtime_alerts": true,
    "export_formats": ["csv", "json"]
  },
  "usage": {
    "api_calls_today": 45,
    "api_calls_remaining": 9955
  }
}
```

---

#### POST /users/api-keys

新しいAPIキーを生成。

**認証**: 必須

**リクエスト**:
```json
{
  "name": "production-key"
}
```

**レスポンス**:
```json
{
  "key_id": "key-xxx",
  "key": "eak_xxxxxxxxxxxx",
  "name": "production-key",
  "created_at": "2026-01-11T10:00:00.000000"
}
```

---

#### DELETE /users/api-keys/{key_id}

APIキーを無効化。

**認証**: 必須

**レスポンス**:
```json
{
  "message": "APIキーを無効化しました"
}
```

---

### Billing（課金）

#### POST /billing/upgrade

プランをアップグレード。Stripeチェックアウトへリダイレクト。

**認証**: 必須

**リクエスト**:
```json
{
  "plan": "pro",
  "success_url": "https://ecomtrend.ai/success",
  "cancel_url": "https://ecomtrend.ai/cancel"
}
```

**レスポンス**:
```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/xxx"
}
```

**エラー**:
- 400: 無効なプラン、FREEへのアップグレード
- 503: 決済サービス利用不可

---

#### POST /billing/cancel

サブスクリプションをキャンセル。

**認証**: 必須

**レスポンス**:
```json
{
  "message": "サブスクリプションをキャンセルしました。期間終了後にFREEプランに戻ります。"
}
```

---

#### GET /billing/plans

利用可能なプラン一覧。

**認証**: 不要

**レスポンス**:
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price_jpy": 0,
      "features": {
        "daily_reports": 10,
        "categories": 2,
        "api_calls_per_day": 100,
        "realtime_alerts": false,
        "custom_dashboard": false,
        "export_formats": [],
        "support_level": "community"
      }
    },
    {
      "id": "pro",
      "name": "Pro",
      "price_jpy": 980,
      "features": {
        "daily_reports": 100,
        "categories": -1,
        "api_calls_per_day": 10000,
        "realtime_alerts": true,
        "custom_dashboard": false,
        "export_formats": ["csv", "json"],
        "support_level": "email"
      }
    },
    {
      "id": "enterprise",
      "name": "Enterprise",
      "price_jpy": 4980,
      "features": {
        "daily_reports": -1,
        "categories": -1,
        "api_calls_per_day": -1,
        "realtime_alerts": true,
        "custom_dashboard": true,
        "export_formats": ["csv", "json", "xlsx"],
        "support_level": "priority"
      }
    }
  ]
}
```

---

### Export（データ出力）

#### GET /export/csv

トレンドデータをCSVでエクスポート。

**認証**: 必須
**プラン**: Pro以上

**レスポンス**: CSV file download

```csv
name,asin,category,current_rank,rank_change_percent,price
商品名,B0XXXXXXXXX,electronics,15,285.5,29800
```

---

#### GET /export/json

トレンドデータをJSONでエクスポート。

**認証**: 必須
**プラン**: Pro以上

**レスポンス**:
```json
{
  "exported_at": "2026-01-11T10:00:00.000000",
  "count": 100,
  "data": [...]
}
```

---

### Contact（お問い合わせ）

#### POST /contact

お問い合わせフォーム送信。

**認証**: 不要

**リクエスト**:
```json
{
  "name": "山田太郎",
  "email": "taro@example.com",
  "category": "sales",
  "message": "お問い合わせ内容..."
}
```

**カテゴリ一覧**:
- `general`: 一般
- `sales`: サービス・料金
- `technical`: 技術
- `billing`: 請求・支払い
- `privacy`: 個人情報
- `bug`: 不具合報告
- `feature`: 機能リクエスト
- `partnership`: 提携
- `other`: その他

**レスポンス**:
```json
{
  "success": true,
  "message": "お問い合わせを受け付けました。2営業日以内にご返信いたします。",
  "email_notification": true
}
```

---

### Newsletter（ニュースレター）

#### POST /api/newsletter/subscribe

ニュースレター購読登録。

**認証**: 不要

**リクエスト**:
```json
{
  "email": "user@example.com"
}
```

**レスポンス**:
```json
{
  "success": true,
  "message": "登録が完了しました！明日から毎朝8時にトレンドレポートをお届けします。",
  "email_notification": true
}
```

---

### Tracking（追跡）

#### POST /api/track/click

アフィリエイトクリックを追跡。

**認証**: 不要

**リクエスト**:
```json
{
  "asin": "B0XXXXXXXXX",
  "product_name": "商品名",
  "category": "electronics",
  "price": 29800,
  "rank": 15,
  "source": "website"
}
```

**レスポンス**:
```json
{
  "success": true,
  "tracked": true
}
```

---

#### GET /api/track/stats

クリック統計を取得。

**認証**: 必須

**レスポンス**:
```json
{
  "total_clicks": 1500,
  "by_source": {"website": 1000, "email": 500},
  "by_category": {"electronics": 800, "furniture": 700},
  "top_products": [
    {"asin": "B0XXX", "product_name": "商品名", "clicks": 150}
  ]
}
```

---

### Webhooks

#### POST /webhooks/stripe

Stripeイベント受信エンドポイント。

**認証**: Stripe署名検証

対応イベント:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

---

## エラーレスポンス

全てのエラーは以下の形式で返されます：

```json
{
  "detail": "エラーメッセージ"
}
```

### HTTPステータスコード

| コード | 説明 |
|--------|------|
| 200 | 成功 |
| 400 | リクエスト不正 |
| 401 | 認証エラー |
| 403 | 権限不足 |
| 404 | リソースなし |
| 429 | レート制限 |
| 500 | サーバーエラー |
| 503 | サービス利用不可 |

---

## SDKサンプル

### Python

```python
import requests

API_KEY = "eak_xxxxxxxxxxxx"
BASE_URL = "https://api.ecomtrend.ai"

headers = {"X-API-Key": API_KEY}

# トレンド取得
response = requests.get(f"{BASE_URL}/trends", headers=headers)
trends = response.json()

for item in trends["trends"]:
    print(f"{item['name']}: {item['rank_change_percent']}%")
```

### JavaScript

```javascript
const API_KEY = "eak_xxxxxxxxxxxx";
const BASE_URL = "https://api.ecomtrend.ai";

const response = await fetch(`${BASE_URL}/trends`, {
  headers: { "X-API-Key": API_KEY }
});
const { trends } = await response.json();

trends.forEach(item => {
  console.log(`${item.name}: ${item.rank_change_percent}%`);
});
```

---

## 更新履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2026-01-11 | 1.0.0 | 初版 |
