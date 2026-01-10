# EcomTrendAI - ステータス

最終更新: 2026-01-11

## 現在の状態
- 状態: Phase 17 収益化加速機能完了・デプロイ待ち
- 進捗: テスト177件全パス、フロントエンドビルド成功（13ページ + OGP API）

## 次のアクション
1. **Vercel連携**: https://vercel.com/new でプロジェクト作成、GitHubリポジトリ連携
2. **Render連携**: `render.yaml` を使ってワンクリックデプロイ
3. **Stripeアカウント本番設定**: `docs/STRIPE_SETUP.md` に従い設定
4. **ドメイン取得**: ecomtrend.ai

## 最近の変更
- 2026-01-11: Phase 17 収益化加速機能
  - A/Bテスト基盤追加（`dashboard/src/lib/abtest.ts`）
  - A/Bテスト対応CTAコンポーネント（`ABTestCTA.tsx`）
  - アフィリエイトクリック追跡機能（`tracking.ts`）
  - クリック追跡API追加（`/api/track/click`, `/api/track/stats`）
  - アップセル導線コンポーネント（`UpgradePrompt.tsx`）
  - ユーザーオンボーディングフロー（`OnboardingFlow.tsx`）
  - テスト5件追加（177件全パス）
- 2026-01-11: Phase 16 本番デプロイ準備
  - ニュースレター購読API追加
  - 詳細ヘルスチェック・メトリクスエンドポイント追加
- 2026-01-11: Phase 15 収益化強化機能
  - ソーシャルシェアボタン追加
  - メールキャプチャ機能追加
  - OGP画像動的生成

## テスト状況
- バックエンド: 177件合格
- カバレッジ: 81%（目標80%達成）
- フロントエンドLint: エラーなし
- フロントエンドビルド: 13ページ + 1 API成功
- セキュリティスキャン: bandit PASS / pip-audit PASS

## 新規コンポーネント（Phase 17）
| コンポーネント | パス | 機能 |
|---------------|------|------|
| ABTestCTA | `components/ABTestCTA.tsx` | A/Bテスト対応CTAボタン |
| UpgradePrompt | `components/UpgradePrompt.tsx` | アップセル導線（banner/card/inline） |
| OnboardingFlow | `components/OnboardingFlow.tsx` | ユーザーオンボーディングウィザード |

## 新規ライブラリ（Phase 17）
| ライブラリ | パス | 機能 |
|-----------|------|------|
| abtest | `lib/abtest.ts` | A/Bテスト基盤（実験定義・バリアント割り当て・イベント追跡） |
| tracking | `lib/tracking.ts` | アフィリエイトクリック追跡・ページビュー追跡 |

## 新規APIエンドポイント（Phase 17）
| エンドポイント | 機能 |
|---------------|------|
| `POST /api/track/click` | アフィリエイトクリック追跡 |
| `GET /api/track/stats` | クリック統計取得（認証必須） |

## ページ一覧（13ページ + 1 API）
| ページ | パス | 説明 |
|--------|------|------|
| トップ | `/` | ランディングページ |
| サンプルレポート | `/sample-report` | トレンド分析サンプル |
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
- A/Bテスト: カスタム実装（localStorage + イベント追跡）
