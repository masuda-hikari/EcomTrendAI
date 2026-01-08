# EcomTrendAI - ステータス

最終更新: 2026-01-09

## 現在の状態
- 状態: Phase 3.5 完了（本番デプロイ準備完了）
- 進捗: 認証・課金・API実装済み、デプロイドキュメント完備、テスト76件全合格

## 次のアクション
1. **Stripeアカウント本番設定**: `docs/STRIPE_SETUP.md` に従い設定
2. **サーバーデプロイ**: `docs/DEPLOYMENT_GUIDE.md` に従いVPS/クラウドへデプロイ
3. **Phase 4開始**: Webダッシュボード構築（Next.js）
4. **ランディングページ作成**: サービス紹介・登録導線

## 最近の変更
- 2026-01-09: 本番デプロイ準備
  - docs/DEPLOYMENT_GUIDE.md: 本番デプロイ手順
  - docs/STRIPE_SETUP.md: Stripe本番設定ガイド
  - scripts/deploy.py: デプロイ管理スクリプト
- 2026-01-09: Phase 3 認証・課金システム実装
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
# サーバー起動（開発）
python src/api.py --host 0.0.0.0 --port 8000

# サーバー起動（本番）
python scripts/deploy.py prod --workers 4

# ユーザー登録
curl -X POST http://localhost:8000/users/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# トレンド取得
curl http://localhost:8000/trends \
  -H "X-API-Key: ect_your_api_key"
```

## デプロイチェックリスト
- [ ] Stripeアカウント本番有効化
- [ ] 商品・価格ID設定（Pro: ¥980, Enterprise: ¥4,980）
- [ ] Webhook設定（URL + 署名シークレット）
- [ ] VPS/クラウドサーバー準備
- [ ] ドメイン設定
- [ ] SSL証明書取得
- [ ] Nginx/リバースプロキシ設定
- [ ] systemdサービス登録

## 環境設定（.env）
```bash
# Stripe設定（必須：課金機能使用時）
STRIPE_SECRET_KEY=sk_live_xxxxx  # 本番キー
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_PRO=price_xxxxx_pro
STRIPE_PRICE_ENTERPRISE=price_xxxxx_enterprise
```

## 技術メモ
- 認証: APIキーベース（Bearer/X-API-Key）
- 決済: Stripe Checkout Session
- プラン制限: リクエストごとにチェック
- データ永続化: JSONファイル（将来DB移行予定）
- デプロイ: uvicorn + Gunicorn + Nginx
