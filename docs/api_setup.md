# Amazon Product Advertising API セットアップガイド

## 概要

EcomTrendAIでAmazon PA-APIを使用するための設定手順。

## 前提条件

1. Amazonアソシエイトプログラムへの登録
2. PA-APIへのアクセス申請・承認

## セットアップ手順

### 1. Amazonアソシエイト登録

1. [Amazonアソシエイト](https://affiliate.amazon.co.jp/)にアクセス
2. アカウント作成・審査通過
3. アソシエイトIDを取得（例: `yourtag-22`）

### 2. PA-APIアクセス申請

1. アソシエイトセントラルにログイン
2. ツール → Product Advertising API
3. 認証情報を生成
   - Access Key
   - Secret Key

### 3. 環境変数設定

```bash
# .envファイルを編集
AMAZON_ACCESS_KEY=AKIAXXXXXXXXXX
AMAZON_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AMAZON_PARTNER_TAG=yourtag-22
AMAZON_AFFILIATE_ID=yourtag-22
```

### 4. 動作確認

```bash
cd O:\Dev\Work\EcomTrendAI
python -c "from src.config import config; print(config.amazon.is_configured())"
# True が表示されればOK
```

## レート制限

| 条件 | 制限 |
|------|------|
| 初期 | 1リクエスト/秒 |
| 売上発生後 | 最大8600リクエスト/日 |

## 注意事項

- APIキーは絶対にGitにコミットしない
- `.env`ファイルは`.gitignore`に追加済み
- 本番環境では環境変数で管理すること

## トラブルシューティング

### 「InvalidSignature」エラー

- Secret Keyが正しいか確認
- タイムゾーン設定を確認（UTC同期必須）

### 「TooManyRequests」エラー

- レート制限に達している
- `REQUEST_DELAY_SECONDS`を増やす

## 参考リンク

- [PA-API公式ドキュメント](https://webservices.amazon.com/paapi5/documentation/)
- [Amazonアソシエイト](https://affiliate.amazon.co.jp/)
