import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Custom500() {
  return (
    <>
      <Head>
        <title>サーバーエラー - EcomTrendAI</title>
        <meta name="description" content="サーバーエラーが発生しました。" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="max-w-lg mx-auto px-4 text-center">
          {/* エラーアイコン */}
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* エラーメッセージ */}
          <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            サーバーエラー
          </h2>
          <p className="text-gray-600 mb-8">
            申し訳ございません。サーバーで問題が発生しました。
            <br />
            しばらく時間をおいてから、再度お試しください。
          </p>

          {/* ナビゲーションリンク */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              ページを再読み込み
            </button>
            <Link
              href="/"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              トップページへ
            </Link>
          </div>

          {/* ステータス情報 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              問題が解決しない場合
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              エラーが続く場合は、お手数ですがお問い合わせください。
              <br />
              技術チームが迅速に対応いたします。
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              お問い合わせ
            </Link>
          </div>

          {/* サービス状況リンク */}
          <p className="mt-8 text-sm text-gray-500">
            サービスの稼働状況は
            <Link href="/docs" className="text-primary-600 hover:underline ml-1">
              ステータスページ
            </Link>
            でご確認いただけます。
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
