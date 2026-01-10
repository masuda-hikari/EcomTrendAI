﻿# EcomTrendAI - ステータス

最終更新: 2026-01-11

## 現在の状態
- 状態: Phase 16 本番デプロイ準備完了・デプロイ待ち
- 進捗: テスト172件全パス、カバレッジ81%、フロントエンドビルド成功（13ページ + OGP API）

## 次のアクション
1. **Vercel連携**: https://vercel.com/new でプロジェクト作成、GitHubリポジトリ連携
2. **Render連携**: `render.yaml` を使ってワンクリックデプロイ
3. **Stripeアカウント本番設定**: `docs/STRIPE_SETUP.md` に従い設定
4. **ドメイン取得**: ecomtrend.ai

## 最近の変更
- 2026-01-11: Phase 16 本番デプロイ準備
  - ニュースレター購読API追加（`/api/newsletter/subscribe`）
  - 詳細ヘルスチェックエンドポイント追加（`/health/detailed`）
  - Prometheusメトリクスエンドポイント追加（`/metrics`）
  - テスト5件追加（172件全パス）
- 2026-01-11: Phase 15 収益化強化機能
  - ソーシャルシェアボタン追加（Twitter/X, Facebook, LINE, リンクコピー）
    - `SocialShare.tsx` コンポーネント作成
    - サンプルレポートページに配置
  - メールキャプチャ機能追加
    - `EmailCapture.tsx` コンポーネント作成（3バリアント: inline, card, banner）
    - ランディングページにバナー配置
    - サンプルレポートにカードフォーム配置
    - 無料トレンドレポート登録フロー
  - OGP画像動的生成
    - `/api/og` エンドポイント作成（@vercel/og使用）
    - ランディングページ・サンプルレポートにOGPメタタグ追加
    - Twitter Card対応
- 2026-01-11: Phase 14 収益化加速機能
- 2026-01-11: Phase 13 UI/UX改善
- 2026-01-10: Phase 12 セキュリティ監査・デプロイ準備完了
- 2026-01-10: Phase 11 テストカバレッジ80%達成

## テスト状況
- バックエンド: 172件合格
- カバレッジ: 81%（目標80%達成）
- フロントエンドLint: エラーなし
- フロントエンドビルド: 13ページ + 1 API成功
- セキュリティスキャン: bandit PASS / pip-audit PASS

## ページ一覧（13ページ + 1 API）
| ページ | パス | 説明 |
|--------|------|------|
| トップ | `/` | ランディングページ（メールキャプチャバナー追加） |
| サンプルレポート | `/sample-report` | トレンド分析サンプル（ソーシャルシェア・メールキャプチャ追加） |
| ログイン | `/login` | ユーザーログイン |
| 登録 | `/register` | ユーザー登録 |
| 料金 | `/pricing` | 料金プラン |
| ダッシュボード | `/dashboard` | メインダッシュボード |
| ドキュメント | `/docs` | APIドキュメント |
| プライバシーポリシー | `/privacy` | 個人情報保護方針 |
| 利用規約 | `/terms` | サービス利用規約 |
| 特商法表記 | `/legal/commerce` | 特定商取引法表記 |
| お問い合わせ | `/contact` | お問い合わせフォーム |
| **OGP画像生成** | `/api/og` | 動的OGP画像生成API |

## 新規APIエンドポイント（Phase 16）
| エンドポイント | 機能 |
|---------------|------|
| `POST /api/newsletter/subscribe` | ニュースレター購読登録 |
| `GET /health/detailed` | 詳細ヘルスチェック |
| `GET /metrics` | Prometheusメトリクス |

## 新規コンポーネント（Phase 15）
| コンポーネント | パス | 機能 |
|---------------|------|------|
| SocialShare | `components/SocialShare.tsx` | SNSシェアボタン（Twitter/X, Facebook, LINE, リンクコピー） |
| EmailCapture | `components/EmailCapture.tsx` | メール登録フォーム（inline/card/banner 3バリアント） |

## デプロイ構成

### ワンクリックデプロイ
| サービス | 用途 | 設定ファイル |
|---------|------|-------------|
| Vercel | フロントエンド | `dashboard/` ディレクトリ指定 |
| Render | バックエンド | `render.yaml` |

### GitHub Actions CI/CD
```
.github/workflows/ci.yml
├── backend-test: pytest実行
├── frontend-build: npm run build
├── security-scan: bandit + safety
├── deploy-backend: SSHデプロイ（要シークレット設定）
└── deploy-frontend: Vercel連携
```

### Docker Compose（VPS用）
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
  - [x] リポジトリ作成・push
  - [ ] Actionsシークレット設定（STRIPE_SECRET_KEY等）
- [ ] バックエンド
  - [ ] Render / VPS準備
  - [ ] 環境変数設定
  - [ ] デプロイ実行
- [ ] フロントエンド
  - [ ] Vercel連携
  - [ ] 環境変数設定（NEXT_PUBLIC_API_URL）
- [ ] Stripe
  - [ ] 本番モード有効化
  - [ ] 商品・価格ID作成
  - [ ] Webhookエンドポイント設定
- [ ] ドメイン
  - [ ] ecomtrend.ai取得
  - [ ] DNS設定

## 課金プラン
| プラン | 月額 | 機能 |
|--------|------|------|
| Free | ¥0 | 日次10件、カテゴリ2、API 100回/日 |
| Pro | ¥980 | 日次100件、全カテゴリ、リアルタイムアラート、CSV/JSON出力 |
| Enterprise | ¥4,980 | 無制限、カスタムダッシュボード、専用サポート |

## 技術スタック
- バックエンド: Python FastAPI + Stripe + SQLite/PostgreSQL
- フロントエンド: Next.js 14 + TypeScript + Tailwind CSS + Recharts
- インフラ: Docker + Nginx + Let's Encrypt / Vercel + Render
- CI/CD: GitHub Actions + Vercel
- テスト: pytest + Playwright
- OGP生成: @vercel/og
