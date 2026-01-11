# EcomTrendAI - ステータス

最終更新: 2026-01-11

## 現在の状態
- 状態: Phase 25 セキュリティ強化完了・デプロイ待ち
- 進捗: テスト191件全パス、フロントエンドビルド成功（15ページ）、レート制限実装

## 次のアクション
1. **Vercel連携**: https://vercel.com/new でプロジェクト作成、GitHubリポジトリ連携
2. **Render連携**: `render.yaml` を使ってワンクリックデプロイ
3. **Stripeアカウント本番設定**: `docs/STRIPE_SETUP.md` に従い設定
4. **ドメイン取得**: ecomtrend.ai
5. **GA4設定**: Google Analytics 4で測定IDを取得し、環境変数に設定

## 最近の変更
- 2026-01-11: Phase 25 セキュリティ強化
  - レート制限ミドルウェア追加（IP/認証別・エンドポイント別）
  - セキュリティヘッダー追加（OWASP推奨）
  - DDoS対策（ブルートフォース防止・自動ブロック）
  - リクエストログミドルウェア追加（監査対応）
  - テスト14件追加（191件合計）
- 2026-01-11: Phase 22 UX改善
  - カスタム404ページ追加（ユーザー誘導リンク付き）
  - カスタム500ページ追加（エラーリカバリー案内）
  - .gitignore更新（ユーザーデータ保護）
- 2026-01-11: Phase 21 コンバージョン最適化
  - PricingCard: 返金保証バッジ追加、CTAボタン改善、社会的証明追加
  - 登録ページ: セキュリティ保証バッジ追加（SSL/クレカ不要/30秒完了）
- 2026-01-11: Phase 20 品質改善
  - バックエンドセキュリティ改善（bandit警告対応）
  - GitHub Actions強化（Vercel/Render自動デプロイ対応）
  - フロントエンドパフォーマンス最適化（Recharts遅延読み込み）
  - sample-reportページサイズ: 107kB → 7.39kB（93%削減）

## テスト状況
- バックエンド: 191件合格（5.98秒）
- カバレッジ: 81%（目標80%達成）
- フロントエンドLint: エラーなし
- フロントエンドビルド: 15ページ成功
- セキュリティスキャン: bandit警告0件

## セキュリティ機能（Phase 25）
| 機能 | 説明 | 設定 |
|------|------|------|
| IPレート制限 | 1秒10回、1分100回 | RATE_LIMIT_IP_* |
| 認証済み制限 | 1分300回（緩和） | RATE_LIMIT_AUTH_* |
| ログイン試行制限 | 1分5回まで | RATE_LIMIT_LOGIN_* |
| 登録試行制限 | 1分3回まで | RATE_LIMIT_REGISTER_* |
| 自動ブロック | 制限超過で5分間ブロック | block_duration |
| セキュリティヘッダー | X-Content-Type-Options, X-Frame-Options, CSP等 | 自動適用 |
| リクエストログ | 監査用ログ記録 | 自動有効 |

## 収益化機能（統合済み）
| 機能 | 適用ページ | 効果 |
|------|-----------|------|
| A/Bテスト対応CTA | ランディング, サンプルレポート | コンバージョン最適化 |
| A/Bテスト対応ヒーロー見出し | ランディング | メッセージ最適化 |
| アフィリエイト追跡 | サンプルレポート, ダッシュボード | 収益分析 |
| アップセルプロンプト | ダッシュボード | Free→Pro転換 |
| オンボーディング | ダッシュボード | ユーザー定着 |
| ページビュー追跡 | 全ページ | 行動分析 |
| GA4連携 | 全ページ | コンバージョン測定 |
| PWA対応 | 全体 | モバイル体験向上 |
| 返金保証バッジ | 料金ページ | 信頼性向上・CVR改善 |
| セキュリティ保証 | 登録ページ | 不安解消・CVR改善 |

## デプロイチェックリスト
- [ ] GitHubリポジトリ
  - [x] リポジトリ作成・push
  - [ ] Actionsシークレット設定（VERCEL_TOKEN, RENDER_DEPLOY_HOOK_URL等）
- [ ] バックエンド
  - [ ] Render / VPS準備
  - [ ] 環境変数設定
  - [ ] デプロイ実行
- [ ] フロントエンド
  - [ ] Vercel連携
  - [ ] 環境変数設定（NEXT_PUBLIC_API_URL, NEXT_PUBLIC_GA_MEASUREMENT_ID）
- [ ] Stripe
  - [ ] 本番モード有効化
  - [ ] 商品・価格ID作成
  - [ ] Webhookエンドポイント設定
- [ ] ドメイン
  - [ ] ecomtrend.ai取得
  - [ ] DNS設定
- [ ] Analytics
  - [ ] GA4プロパティ作成
  - [ ] 測定ID取得・環境変数設定

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
- CI/CD: GitHub Actions + Vercel自動デプロイ
- テスト: pytest + Playwright
- セキュリティ: レート制限 + セキュリティヘッダー + 監査ログ
- OGP生成: @vercel/og
- A/Bテスト: カスタム実装（localStorage + イベント追跡）
- 追跡: カスタム実装 + Google Analytics 4
- PWA: Service Worker + Web App Manifest
