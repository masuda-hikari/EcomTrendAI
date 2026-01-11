# EcomTrendAI - ステータス

最終更新: 2026-01-11

## 現在の状態
- 状態: Phase 19 SEO・PWA・GA4対応完了・デプロイ待ち
- 進捗: テスト177件全パス、フロントエンドビルド成功（14ページ + OGP API）

## 次のアクション
1. **Vercel連携**: https://vercel.com/new でプロジェクト作成、GitHubリポジトリ連携
2. **Render連携**: `render.yaml` を使ってワンクリックデプロイ
3. **Stripeアカウント本番設定**: `docs/STRIPE_SETUP.md` に従い設定
4. **ドメイン取得**: ecomtrend.ai
5. **GA4設定**: Google Analytics 4で測定IDを取得し、環境変数に設定

## 最近の変更
- 2026-01-11: Phase 19 SEO・PWA・GA4対応
  - Google Analytics 4連携準備（analytics.ts, GoogleAnalytics.tsx）
  - PWA対応（manifest.json, sw.js, offline.html）
  - サイトマップ自動生成（sitemap.xml.tsx）
  - robots.txt追加
  - ファビコンSVG追加
  - 環境変数テンプレート更新（GA_MEASUREMENT_ID追加）
- 2026-01-11: Phase 18 コンポーネント統合
  - ランディングページにA/Bテスト対応CTAボタン統合
  - ランディングページにA/Bテスト対応ヒーロー見出し統合
  - サンプルレポートページにアフィリエイトクリック追跡追加
  - サンプルレポートページにA/Bテスト対応CTA追加
  - ダッシュボードにアップセルプロンプト追加
  - ダッシュボードにオンボーディングチェックリスト追加
  - ダッシュボードにウェルカムトースト追加
  - ダッシュボードにアフィリエイトクリック追跡追加
  - 全ページにページビュー追跡追加

## テスト状況
- バックエンド: 177件合格（5.30秒）
- カバレッジ: 81%（目標80%達成）
- フロントエンドLint: エラーなし
- フロントエンドビルド: 14ページ + 1 API成功
- セキュリティスキャン: bandit PASS / pip-audit PASS

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

## ページ一覧（14ページ + 1 API）
| ページ | パス | 追加機能 |
|--------|------|--------|
| トップ | `/` | A/B CTA + ヒーロー, ページビュー |
| サンプルレポート | `/sample-report` | A/B CTA, アフィリエイト追跡 |
| ログイン | `/login` | - |
| 登録 | `/register` | - |
| 料金 | `/pricing` | - |
| ダッシュボード | `/dashboard` | アップセル, オンボーディング |
| ドキュメント | `/docs` | - |
| プライバシーポリシー | `/privacy` | - |
| 利用規約 | `/terms` | - |
| 特商法表記 | `/legal/commerce` | - |
| お問い合わせ | `/contact` | - |
| **サイトマップ** | `/sitemap.xml` | SEO |
| **OGP画像生成** | `/api/og` | SNS共有 |

## PWA対応状況
- [x] manifest.json作成
- [x] Service Worker実装
- [x] オフラインページ作成
- [x] ホーム画面追加対応（iOS/Android）
- [x] プッシュ通知基盤（将来用）

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
- CI/CD: GitHub Actions + Vercel
- テスト: pytest + Playwright
- OGP生成: @vercel/og
- A/Bテスト: カスタム実装（localStorage + イベント追跡）
- 追跡: カスタム実装 + Google Analytics 4
- PWA: Service Worker + Web App Manifest
