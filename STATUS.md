# EcomTrendAI - ステータス

最終更新: 2026-01-10

## 現在の状態
- 状態: Phase 6 CI/CD完全自動化完了
- 進捗: GitHub Actions、Docker、Vercel設定完了

## 次のアクション
1. **GitHubリポジトリ作成・Push**: コードをGitHubにpush
2. **Vercel連携**: https://vercel.com/new でプロジェクト作成
3. **Stripeアカウント本番設定**: `docs/STRIPE_SETUP.md` に従い設定
4. **VPS/クラウドサーバー契約**: バックエンドAPI用
5. **Docker Composeデプロイ**: `docker-compose up -d`

## 最近の変更
- 2026-01-10: Phase 6 CI/CD自動化
  - GitHub Actions CI/CDパイプライン（`.github/workflows/ci.yml`）
  - Vercelデプロイ設定（`vercel.json`）
  - Docker Compose本番環境（`docker-compose.yml`、`Dockerfile`）
  - Nginx設定テンプレート（`nginx/`）
  - E2Eテスト（Playwright: `dashboard/e2e/`）
  - ESLint設定追加
- 2026-01-10: Phase 5 デプロイ準備
  - npm install完了（424パッケージ）
  - npm run build成功（全8ページ生成）
  - pytest 76件全パス

## テスト状況
- バックエンド: 76件合格
- フロントエンドLint: エラーなし
- フロントエンドビルド: 8ページ成功
- E2Eテスト: 設定完了（Playwrightブラウザ未インストール）

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

### Nginx設定
```
nginx/
├── nginx.conf: メイン設定
└── conf.d/
    └── api.conf: API用設定（HTTPS、CORS、レートリミット）
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
