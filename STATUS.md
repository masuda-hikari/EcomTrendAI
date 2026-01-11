﻿﻿﻿﻿﻿# EcomTrendAI - ステータス

最終更新: 2026-01-12

## 現在の状態
- 状態: Phase 33 紹介プログラム（リファラル）機能完了
- 進捗: テスト229件全パス、フロントエンドビルド成功（15ページ）、セキュリティスキャン警告0件

## 次のアクション（人間作業）
1. **Vercel連携**: https://vercel.com/new でプロジェクト作成、GitHubリポジトリ連携
2. **Render連携**: `render.yaml` を使ってワンクリックデプロイ
3. **Stripeアカウント本番設定**: `docs/STRIPE_SETUP.md` に従い設定
4. **Sentryアカウント作成**: https://sentry.io でプロジェクト作成、DSN取得
5. **ドメイン取得**: ecomtrend.ai
6. **GA4設定**: Google Analytics 4で測定IDを取得し、環境変数に設定

## 最近の変更
- 2026-01-12: Phase 33 紹介プログラム（リファラル）機能
  - バックエンド実装
    - `src/referral.py` - 紹介コード生成・検証・報酬計算ロジック
    - 紹介者報酬: ¥500、被紹介者特典: ¥200
    - クレジット残高管理機能
    - 有料プラン加入時の報酬自動付与
  - APIエンドポイント追加
    - `POST /referral/code` - 紹介コード生成
    - `GET /referral/code` - 自分のコード取得
    - `GET /referral/validate/{code}` - コード検証（公開）
    - `GET /referral/stats` - 紹介統計取得
    - `GET /referral/credits` - クレジット残高取得
    - `POST /referral/credits/use` - クレジット使用
  - ユーザー登録API拡張
    - 紹介コード付き登録対応（`referral_code`パラメータ）
  - フロントエンド実装
    - `dashboard/src/pages/referral.tsx` - 紹介プログラムダッシュボード
      - 紹介コード・リンク表示
      - SNSシェアボタン（X/LINE）
      - 紹介統計（総紹介数・待機中・条件達成・獲得報酬）
      - クレジット残高表示
      - 紹介履歴一覧
      - 利用方法説明
    - 登録ページ改善
      - 紹介コード入力フィールド追加
      - URLパラメータからのコード自動入力
      - リアルタイムコード検証
      - 紹介特典表示
    - ヘッダー更新
      - 紹介プログラムへのリンク追加（¥500バッジ付き）
  - テスト追加
    - `tests/test_referral.py` - 25件のテスト
- 2026-01-12: Phase 32 デモ体験機能・コンバージョン導線強化
  - デモダッシュボードページ新規作成（/demo）
  - お問い合わせページ改善
  - ヘッダーナビゲーション更新

## テスト状況
- バックエンド: 229件合格（6.26秒）※紹介テスト25件追加
- カバレッジ: 81%+（目標80%達成）
- フロントエンドLint: エラーなし
- フロントエンドビルド: 15ページ + 1 API成功（referralページ追加）
- セキュリティスキャン: bandit警告0件
- E2Eテスト: 7ファイル

## ドキュメント
| ドキュメント | パス | 内容 |
|-------------|------|------|
| README | README.md | 商用品質の製品紹介・クイックスタート |
| API仕様書 | docs/API_REFERENCE.md | 全エンドポイント詳細・SDKサンプル |
| 監視ガイド | docs/MONITORING.md | Prometheus/Grafana/UptimeRobot設定 |
| デプロイガイド | docs/DEPLOY_GUIDE.md | Vercel/Render/Docker設定手順 |
| Stripe設定 | docs/STRIPE_SETUP.md | 決済システム設定手順 |

## 紹介プログラム機能（Phase 33追加）
| 機能 | 説明 | 設定 |
|------|------|------|
| 紹介者報酬 | 紹介した友達が有料プラン加入時 | ¥500クレジット |
| 被紹介者特典 | 紹介コードで登録時に即時付与 | ¥200クレジット |
| 条件達成期間 | 登録から有料プラン加入まで | 30日以内 |
| コード形式 | ECT + ランダム8文字（大文字） | 例: ECT12345678 |
| SNSシェア | X(Twitter)・LINE対応 | ワンクリック |

## セキュリティ機能
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
| 紹介プログラム | /referral | バイラル成長・新規獲得 |
| デモダッシュボード | /demo | 登録前の価値体験・CVR向上 |
| A/Bテスト対応CTA | ランディング, サンプルレポート, デモ | コンバージョン最適化 |
| A/Bテスト対応ヒーロー見出し | ランディング | メッセージ最適化 |
| アフィリエイト追跡 | サンプルレポート, ダッシュボード | 収益分析 |
| アップセルプロンプト | ダッシュボード | Free→Pro転換 |
| オンボーディング | ダッシュボード | ユーザー定着 |
| ページビュー追跡 | 全ページ | 行動分析 |
| GA4連携 | 全ページ | コンバージョン測定 |
| PWA対応 | 全体 | モバイル体験向上 |
| 返金保証バッジ | 料金ページ | 信頼性向上・CVR改善 |
| セキュリティ保証 | 登録ページ | 不安解消・CVR改善 |
| コンバージョン導線 | お問い合わせページ | 離脱防止・デモ誘導 |

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
- 紹介プログラム: カスタム実装（コード生成・報酬管理）
