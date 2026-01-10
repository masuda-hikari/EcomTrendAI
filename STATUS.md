# EcomTrendAI - ステータス

最終更新: 2026-01-10

## 現在の状態
- 状態: Phase 9 品質向上・SEO最適化完了
- 進捗: SEOメタタグ強化、テスト83件全パス、収益メトリクス作成

## 次のアクション
1. **Vercel連携**: https://vercel.com/new でプロジェクト作成
2. **Stripeアカウント本番設定**: `docs/STRIPE_SETUP.md` に従い設定
3. **VPS/クラウドサーバー契約**: バックエンドAPI用
4. **Docker Composeデプロイ**: `docker-compose up -d`
5. **ドメイン取得**: ecomtrend.ai

## 最近の変更
- 2026-01-10: Phase 9 品質向上
  - SEO・メタタグ最適化（Open Graph、Twitter Card、JSON-LD構造化データ）
  - テスト83件全パス（Webhook処理テスト追加）
  - REVENUE_METRICS.md作成（収益計画・ロードマップ）
  - ESLintエラーなし、ビルド成功（12ページ）
- 2026-01-10: Phase 8 お問い合わせAPI実装
  - POST /contact エンドポイント追加
  - 管理者へのメール通知機能
  - フロントエンドをAPIに接続
  - テスト追加（80件全パス）
- 2026-01-10: Phase 7 法務対応
  - プライバシーポリシー、利用規約、特商法表記ページ

## テスト状況
- バックエンド: 83件合格（0.96秒）
- フロントエンドLint: エラーなし
- フロントエンドビルド: 12ページ成功

## ページ一覧（12ページ）
| ページ | パス | 説明 |
|--------|------|------|
| トップ | `/` | ランディングページ |
| ログイン | `/login` | ユーザーログイン |
| 登録 | `/register` | ユーザー登録 |
| 料金 | `/pricing` | 料金プラン |
| ダッシュボード | `/dashboard` | メインダッシュボード |
| ドキュメント | `/docs` | APIドキュメント |
| プライバシーポリシー | `/privacy` | 個人情報保護方針 |
| 利用規約 | `/terms` | サービス利用規約 |
| 特商法表記 | `/legal/commerce` | 特定商取引法表記 |
| お問い合わせ | `/contact` | お問い合わせフォーム |

## デプロイ構成

### GitHub Actions CI/CD
```
.github/workflows/ci.yml
├── backend-test: pytest実行
├── frontend-build: npm run build
├── security-scan: bandit + safety
├── deploy-backend: SSHデプロイ（要シークレット設定）
└── deploy-frontend: Vercel連携
```

### Docker Compose
```
docker-compose.yml
├── api: バックエンドAPI（FastAPI + Gunicorn）
├── redis: キャッシュ・セッション
├── nginx: リバースプロキシ
└── certbot: SSL証明書自動更新
```

## 起動方法

### 開発環境
```bash
# バックエンドAPI起動
python src/api.py --host 0.0.0.0 --port 8000

# フロントエンド起動（別ターミナル）
cd dashboard
npm run dev
```

### 本番環境（Docker）
```bash
# 環境変数設定
cp .env.example .env
# .envを編集（Stripeキー等）

# 起動
docker-compose up -d

# SSL証明書初期取得
docker-compose run --rm certbot certonly --webroot -w /var/www/certbot -d api.ecomtrend.ai
```

## デプロイチェックリスト
- [ ] GitHubリポジトリ
  - [ ] リポジトリ作成・push
  - [ ] Actionsシークレット設定（STRIPE_SECRET_KEY等）
- [ ] バックエンド
  - [ ] VPS/クラウドサーバー準備
  - [ ] Docker + Docker Composeインストール
  - [ ] docker-compose up -d
  - [ ] SSL証明書取得
- [ ] フロントエンド
  - [ ] Vercel連携
  - [ ] 環境変数設定（NEXT_PUBLIC_API_URL）
- [ ] Stripe
  - [ ] 本番モード有効化
  - [ ] 商品・価格ID作成
  - [ ] Webhookエンドポイント設定
- [ ] ドメイン
  - [ ] ecomtrend.ai取得
  - [ ] api.ecomtrend.ai設定

## 課金プラン
| プラン | 月額 | 機能 |
|--------|------|------|
| Free | ¥0 | 日次10件、カテゴリ2、API 100回/日 |
| Pro | ¥980 | 日次100件、全カテゴリ、リアルタイムアラート、CSV/JSON出力 |
| Enterprise | ¥4,980 | 無制限、カスタムダッシュボード、専用サポート |

## 技術スタック
- バックエンド: Python FastAPI + Stripe + SQLite/PostgreSQL
- フロントエンド: Next.js 14 + TypeScript + Tailwind CSS
- インフラ: Docker + Nginx + Let's Encrypt
- CI/CD: GitHub Actions + Vercel
- テスト: pytest + Playwright
