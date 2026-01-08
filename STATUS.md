# EcomTrendAI - ステータス

最終更新: 2026-01-09

## 現在の状態
- 状態: Phase 3 完了（認証・課金システム実装済み）
- 進捗: ユーザー認証、Stripe決済統合、REST API実装、テスト76件全合格

## 次のアクション
1. **Stripe本番設定**: Stripeアカウント作成、価格ID設定、Webhook設定
2. **API公開準備**: ドメイン設定、SSL証明書、uvicornデプロイ
3. **Phase 4**: Webダッシュボード構築（Next.js）

## 最近の変更
- 2026-01-09: Phase 3 認証・課金システム実装
  - auth.py: ユーザー認証、プラン管理、APIキー管理
  - api.py: FastAPI REST API（トレンド取得、エクスポート、課金）
  - Stripe統合: Checkout、Webhook処理
  - テスト47件追加（合計76件）
- 2026-01-09: Phase 2 レポート配信機能実装
- 2026-01-08: 日次自動実行基盤構築

## テスト状況
- 合計: 76件
- 合格: 76件
- 失敗: 0件

## 課金プラン
| プラン | 月額 | 機能 |
|--------|------|------|
| Free | ¥0 | 日次10件、カテゴリ2、API 100回/日 |
| Pro | ¥980 | 日次100件、全カテゴリ、リアルタイムアラート、CSV/JSON出力 |
| Enterprise | ¥4,980 | 無制限、カスタムダッシュボード、専用サポート |

## API使用方法
```bash
# サーバー起動
python src/api.py --host 0.0.0.0 --port 8000

# ユーザー登録
curl -X POST http://localhost:8000/users/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# トレンド取得
curl http://localhost:8000/trends \
  -H "X-API-Key: ect_your_api_key"
```

## 環境設定（.env）
```bash
# Stripe設定（必須：課金機能使用時）
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_PRO=price_xxxxx_pro
STRIPE_PRICE_ENTERPRISE=price_xxxxx_enterprise
```

## 技術メモ
- 認証: APIキーベース（Bearer/X-API-Key）
- 決済: Stripe Checkout Session
- プラン制限: リクエストごとにチェック
- データ永続化: JSONファイル（将来DB移行予定）
