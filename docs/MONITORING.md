# EcomTrendAI 監視ガイド

## 概要

本番環境の監視設定ガイドです。

---

## エンドポイント

### 1. 基本ヘルスチェック

```bash
GET /health
```

**用途**: ロードバランサー、CDNのヘルスチェック

**レスポンス**:
```json
{"status": "healthy"}
```

**監視ツール設定例**:
- UptimeRobot: 1分間隔
- Pingdom: 1分間隔
- AWS ALB: 30秒間隔

---

### 2. 詳細ヘルスチェック

```bash
GET /health/detailed
```

**用途**: 内部監視、アラート設定

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

**ステータス種別**:
| status | 意味 |
|--------|------|
| healthy | 正常 |
| degraded | 一部機能低下 |
| unhealthy | 異常 |
| warning | 警告（動作に影響なし） |

---

### 3. Prometheusメトリクス

```bash
GET /metrics
```

**用途**: Prometheus + Grafana

**レスポンス** (text/plain):
```
ecomtrend_users_total 50
ecomtrend_subscribers_total 150
ecomtrend_api_up 1
```

---

## Prometheus設定

### prometheus.yml

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ecomtrend-api'
    static_configs:
      - targets: ['api.ecomtrend.ai:443']
    scheme: https
    metrics_path: '/metrics'
```

---

## Grafanaダッシュボード

### 推奨パネル

1. **ユーザー数推移**
   - Query: `ecomtrend_users_total`
   - Type: Graph

2. **購読者数推移**
   - Query: `ecomtrend_subscribers_total`
   - Type: Graph

3. **API稼働状況**
   - Query: `ecomtrend_api_up`
   - Type: Stat

### アラート設定

```yaml
# Grafana Alert Rule例
- name: API Down Alert
  condition: when avg() of query(A, 5m, now) is below 1
  annotations:
    summary: "EcomTrendAI APIが停止しています"
  labels:
    severity: critical
```

---

## UptimeRobot設定

### 基本ヘルスチェック

1. モニター追加
2. タイプ: HTTP(s)
3. URL: `https://api.ecomtrend.ai/health`
4. 間隔: 1分
5. キーワード: `healthy`
6. アラート連絡先設定

### フロントエンドチェック

1. URL: `https://ecomtrend.ai`
2. 間隔: 1分
3. キーワード: `EcomTrendAI`

---

## アラート設定例

### Slack通知

```bash
# 環境変数
ALERT_SLACK_WEBHOOK=https://hooks.slack.com/services/XXX/YYY/ZZZ
```

### Discord通知

```bash
# 環境変数
ALERT_DISCORD_WEBHOOK=https://discord.com/api/webhooks/XXX/YYY
```

### メール通知

```bash
# 環境変数（SMTP設定と共用）
ALERT_EMAIL_TO=admin@example.com
```

---

## ログ監視

### ログファイル場所

```
logs/
├── api.log          # APIリクエストログ
├── error.log        # エラーログ
└── audit.log        # 監査ログ（セキュリティイベント）
```

### Loguru設定

```python
# src/config.py または環境変数
LOG_LEVEL=INFO
LOG_FILE=logs/api.log
LOG_ROTATION=10 MB
LOG_RETENTION=7 days
```

### 重要ログパターン

```bash
# エラー検出
grep "ERROR" logs/api.log

# レート制限超過
grep "rate_limit_exceeded" logs/audit.log

# 認証失敗
grep "auth_failed" logs/audit.log
```

---

## メトリクス追加（カスタム）

### API応答時間

```python
# middleware追加例
@app.middleware("http")
async def add_response_time_header(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

### メトリクス拡張

```python
# /metricsエンドポイント拡張
lines.append(f"ecomtrend_requests_total {request_count}")
lines.append(f"ecomtrend_response_time_avg {avg_response_time}")
lines.append(f"ecomtrend_error_rate {error_rate}")
```

---

## 推奨監視ツール

| ツール | 用途 | 料金 |
|--------|------|------|
| UptimeRobot | 外形監視 | 無料（50モニター） |
| Prometheus + Grafana | メトリクス | 無料（セルフホスト） |
| Sentry | エラー追跡 | 無料（5000イベント/月） |
| Datadog | 統合監視 | 有料 |

---

## チェックリスト

### デプロイ前

- [ ] `/health` が `healthy` を返す
- [ ] `/health/detailed` 全チェック通過
- [ ] `/metrics` がメトリクスを返す
- [ ] ログファイルが書き込み可能

### 本番運用

- [ ] UptimeRobotモニター設定
- [ ] Slackアラート設定
- [ ] 週次ログ確認
- [ ] 月次メトリクスレビュー

---

## トラブルシューティング

### APIがunhealthyを返す

1. `/health/detailed` で問題箇所を特定
2. 該当コンポーネントのログを確認
3. 環境変数設定を確認

### メトリクスが取得できない

1. `/metrics` エンドポイントへのアクセス確認
2. CORS設定確認
3. ファイアウォール設定確認

### アラートが届かない

1. Webhook URLの有効性確認
2. 通知先の設定確認
3. レート制限に引っかかっていないか確認

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-11 | 初版作成 |
