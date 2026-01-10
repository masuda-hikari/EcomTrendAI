import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Docs() {
  return (
    <>
      <Head>
        <title>ドキュメント - EcomTrendAI</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">APIドキュメント</h1>

          {/* 概要 */}
          <section className="card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">概要</h2>
            <p className="text-gray-600 mb-4">
              EcomTrendAI APIは、RESTfulなAPIでEコマーストレンドデータにアクセスできます。
              すべてのリクエストにはAPIキーによる認証が必要です。
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="font-mono text-sm">
                <span className="text-gray-500">Base URL:</span>{' '}
                <code className="text-primary-600">https://api.ecomtrend.ai</code>
              </p>
            </div>
          </section>

          {/* 認証 */}
          <section className="card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">認証</h2>
            <p className="text-gray-600 mb-4">
              すべてのAPIリクエストには認証が必要です。以下のいずれかの方法でAPIキーを送信してください：
            </p>
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-mono text-sm mb-2">ヘッダー方式（推奨）:</p>
                <code className="text-primary-600">X-API-Key: ect_your_api_key</code>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-mono text-sm mb-2">Bearer方式:</p>
                <code className="text-primary-600">Authorization: Bearer ect_your_api_key</code>
              </div>
            </div>
          </section>

          {/* エンドポイント */}
          <section className="card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">エンドポイント</h2>

            {/* GET /trends */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono">GET</span>
                <code className="text-lg font-mono">/trends</code>
              </div>
              <p className="text-gray-600 mb-4">最新のトレンドデータを取得します。</p>
              <h4 className="font-semibold text-gray-900 mb-2">パラメータ</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">名前</th>
                    <th className="text-left py-2">型</th>
                    <th className="text-left py-2">説明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-mono">limit</td>
                    <td className="py-2">integer</td>
                    <td className="py-2">取得件数（デフォルト: 20）</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono">category</td>
                    <td className="py-2">string</td>
                    <td className="py-2">カテゴリフィルタ</td>
                  </tr>
                </tbody>
              </table>
              <h4 className="font-semibold text-gray-900 mt-4 mb-2">レスポンス例</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "date": "2026-01-10",
  "count": 20,
  "trends": [
    {
      "name": "商品名",
      "asin": "B08XXXXXXX",
      "category": "electronics",
      "current_rank": 15,
      "previous_rank": 42,
      "rank_change": 27,
      "rank_change_percent": 64.3,
      "price": 3980,
      "affiliate_url": "https://..."
    }
  ]
}`}
              </pre>
            </div>

            {/* GET /trends/categories */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono">GET</span>
                <code className="text-lg font-mono">/trends/categories</code>
              </div>
              <p className="text-gray-600 mb-4">カテゴリ別のトレンドデータを取得します。</p>
            </div>

            {/* GET /trends/significant */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono">GET</span>
                <code className="text-lg font-mono">/trends/significant</code>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Pro以上</span>
              </div>
              <p className="text-gray-600 mb-4">大幅変動した商品を取得します。</p>
              <h4 className="font-semibold text-gray-900 mb-2">パラメータ</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-2 font-mono">threshold</td>
                    <td className="py-2">float</td>
                    <td className="py-2">変動率閾値（デフォルト: 80.0）</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* GET /export/csv */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono">GET</span>
                <code className="text-lg font-mono">/export/csv</code>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Pro以上</span>
              </div>
              <p className="text-gray-600">トレンドデータをCSV形式でエクスポートします。</p>
            </div>

            {/* GET /export/json */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono">GET</span>
                <code className="text-lg font-mono">/export/json</code>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Pro以上</span>
              </div>
              <p className="text-gray-600">トレンドデータをJSON形式でエクスポートします。</p>
            </div>
          </section>

          {/* エラーコード */}
          <section className="card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">エラーコード</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">コード</th>
                  <th className="text-left py-2">説明</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-mono">401</td>
                  <td className="py-2">認証エラー（APIキーが無効または未指定）</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">403</td>
                  <td className="py-2">アクセス拒否（プラン制限またはサブスクリプション無効）</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">429</td>
                  <td className="py-2">レート制限超過</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono">500</td>
                  <td className="py-2">サーバーエラー</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* SDKサンプル */}
          <section className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">コード例</h2>

            <h3 className="font-semibold text-gray-900 mb-2">Python</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mb-6">
{`import requests

API_KEY = "ect_your_api_key"
BASE_URL = "https://api.ecomtrend.ai"

response = requests.get(
    f"{BASE_URL}/trends",
    headers={"X-API-Key": API_KEY},
    params={"limit": 20}
)

data = response.json()
for trend in data["trends"]:
    print(f"{trend['name']}: {trend['rank_change_percent']}%")`}
            </pre>

            <h3 className="font-semibold text-gray-900 mb-2">JavaScript</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mb-6">
{`const API_KEY = "ect_your_api_key";
const BASE_URL = "https://api.ecomtrend.ai";

const response = await fetch(\`\${BASE_URL}/trends?limit=20\`, {
  headers: {
    "X-API-Key": API_KEY
  }
});

const data = await response.json();
data.trends.forEach(trend => {
  console.log(\`\${trend.name}: \${trend.rank_change_percent}%\`);
});`}
            </pre>

            <h3 className="font-semibold text-gray-900 mb-2">cURL</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X GET "https://api.ecomtrend.ai/trends?limit=20" \\
  -H "X-API-Key: ect_your_api_key"`}
            </pre>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
