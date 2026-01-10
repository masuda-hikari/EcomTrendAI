import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>EcomTrendAI - AIによるEコマーストレンド分析</title>
        <meta name="description" content="AIを活用してEコマースのトレンドを特定・分析。売れ筋商品や市場動向をリアルタイムで可視化します。" />
      </Head>

      <Header />

      <main>
        {/* ヒーローセクション */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                AIで見つける
                <br />
                <span className="text-primary-200">次の売れ筋商品</span>
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
                Amazonのトレンドをリアルタイムで分析。
                <br />
                急上昇商品をいち早くキャッチして、ビジネスチャンスを逃しません。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors"
                >
                  無料で始める
                </Link>
                <Link
                  href="/pricing"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
                >
                  料金プランを見る
                </Link>
              </div>
              <p className="mt-4 text-primary-200 text-sm">クレジットカード不要・即時開始</p>
            </div>
          </div>
        </section>

        {/* 特徴セクション */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                EcomTrendAIの特徴
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                最先端のAI技術で、Eコマースの市場動向を正確に把握
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* 特徴1 */}
              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">リアルタイムトレンド分析</h3>
                <p className="text-gray-600">
                  Amazonのランキングデータを日次で収集・分析。急上昇商品をいち早くお知らせします。
                </p>
              </div>

              {/* 特徴2 */}
              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">カテゴリ別分析</h3>
                <p className="text-gray-600">
                  電子機器、ファッション、食品など、あらゆるカテゴリのトレンドを個別に追跡できます。
                </p>
              </div>

              {/* 特徴3 */}
              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">REST API提供</h3>
                <p className="text-gray-600">
                  シンプルなREST APIで、あなたのシステムやツールと簡単に連携できます。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 使い方セクション */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                かんたん3ステップ
              </h2>
              <p className="text-xl text-gray-600">
                今すぐトレンド分析を始めましょう
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">無料登録</h3>
                <p className="text-gray-600">
                  メールアドレスだけで即座に登録完了。クレジットカードは不要です。
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">APIキー取得</h3>
                <p className="text-gray-600">
                  ダッシュボードからAPIキーを取得。すぐにAPIを利用できます。
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">トレンド分析開始</h3>
                <p className="text-gray-600">
                  APIまたはダッシュボードで最新のトレンドデータにアクセス。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA セクション */}
        <section className="py-24 bg-primary-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              今すぐトレンド分析を始めましょう
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              無料プランで基本機能をお試しいただけます。
              <br />
              より高度な分析が必要な場合は、いつでもアップグレード可能です。
            </p>
            <Link
              href="/register"
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors"
            >
              無料アカウントを作成
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
