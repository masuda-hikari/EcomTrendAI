import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmailCapture from '@/components/EmailCapture';
import ABTestCTA, { ABTestHeroHeadline } from '@/components/ABTestCTA';
import Link from 'next/link';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { trackPageView } from '@/lib/tracking';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ページビュー追跡
  useEffect(() => {
    trackPageView('home', { section: 'landing' });
  }, []);

  const faqs = [
    {
      question: 'EcomTrendAIは何ができますか？',
      answer: 'Amazonの売れ筋商品やトレンドをAIで分析し、急上昇商品をいち早く検出します。せどり、物販、EC事業者の方の仕入れ判断をサポートします。'
    },
    {
      question: '無料プランでも使えますか？',
      answer: 'はい、無料プランでも日次10件のトレンドレポート、2カテゴリの分析、API 100回/日の呼び出しが可能です。まずは無料でお試しください。'
    },
    {
      question: 'データはどのくらいの頻度で更新されますか？',
      answer: 'データは毎日自動で収集・更新されます。Proプラン以上ではリアルタイムアラート機能もご利用いただけます。'
    },
    {
      question: '解約はいつでもできますか？',
      answer: 'はい、いつでも解約可能です。解約手続きはダッシュボードから簡単に行えます。日割り計算での返金も対応しています。'
    }
  ];

  return (
    <>
      <Head>
        <title>EcomTrendAI - AIによるEコマーストレンド分析 | せどり・物販の仕入れ判断</title>
        <meta name="description" content="AIを活用してAmazonのトレンドを分析。急上昇商品をいち早くキャッチして、せどり・物販のビジネスチャンスを逃しません。無料で始められます。" />
        <meta name="keywords" content="Amazon,トレンド分析,せどり,物販,EC,仕入れ,売れ筋,AI分析" />
        <meta property="og:title" content="EcomTrendAI - AIによるEコマーストレンド分析" />
        <meta property="og:description" content="Amazonの急上昇商品をAIで検出。せどり・物販の仕入れ判断をサポートします。" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/api/og?title=AIで見つける次の売れ筋商品&subtitle=Amazonのトレンドをリアルタイムで分析" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="EcomTrendAI - AIによるEコマーストレンド分析" />
        <meta name="twitter:description" content="Amazonの急上昇商品をAIで検出。せどり・物販の仕入れ判断をサポートします。" />
        <meta name="twitter:image" content="/api/og?title=AIで見つける次の売れ筋商品&subtitle=Amazonのトレンドをリアルタイムで分析" />
      </Head>

      <Header />

      <main role="main" id="main-content">
        {/* ヒーローセクション */}
        <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white relative overflow-hidden" aria-labelledby="hero-heading">
          {/* 背景装飾 */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
            <div className="text-center">
              {/* バッジ */}
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6 border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                <span>累計10,000商品以上を分析</span>
              </div>

              {/* A/Bテスト対応ヒーロー見出し */}
              <ABTestHeroHeadline />
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* A/Bテスト対応CTAボタン */}
                <ABTestCTA href="/register" />
                <Link
                  href="/sample-report"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all"
                >
                  サンプルレポートを見る
                </Link>
              </div>
              <p className="mt-6 text-primary-200 text-sm flex items-center justify-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  クレジットカード不要
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  即時開始
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  いつでも解約可能
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* 実績・統計セクション */}
        <section className="py-12 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">10,000+</div>
                <div className="text-gray-600 text-sm">分析商品数</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">95%</div>
                <div className="text-gray-600 text-sm">トレンド検出精度</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">24h</div>
                <div className="text-gray-600 text-sm">データ更新頻度</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">50+</div>
                <div className="text-gray-600 text-sm">対応カテゴリ</div>
              </div>
            </div>
          </div>
        </section>

        {/* 特徴セクション */}
        <section id="features" className="py-24 bg-gray-50" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
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

        {/* テスティモニアル（お客様の声）セクション */}
        <section className="py-24 bg-white" aria-labelledby="testimonials-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                お客様の声
              </h2>
              <p className="text-xl text-gray-600">
                EcomTrendAIを活用して成果を上げているお客様の声をご紹介
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* テスティモニアル1 */}
              <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 relative">
                <div className="absolute -top-4 left-8 text-6xl text-primary-200 font-serif">&ldquo;</div>
                <div className="relative z-10">
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    以前は毎日2時間かけてランキングをチェックしていましたが、EcomTrendAIのおかげで<span className="font-semibold text-primary-600">作業時間が1/4</span>になりました。しかも見逃していた急上昇商品も発見できるようになり、月の利益が3割増加しました。
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      T
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">T.K. 様</div>
                      <div className="text-sm text-gray-500">せどり歴3年 / Proプラン</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              {/* テスティモニアル2 */}
              <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 relative">
                <div className="absolute -top-4 left-8 text-6xl text-primary-200 font-serif">&ldquo;</div>
                <div className="relative z-10">
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    EC事業の仕入れ担当として使っています。カテゴリ別のトレンド分析が特に便利で、<span className="font-semibold text-primary-600">競合より早く</span>売れ筋商品を仕入れられるようになりました。API連携で自社システムとの統合も簡単でした。
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      M
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">M.S. 様</div>
                      <div className="text-sm text-gray-500">EC事業 仕入れ担当 / Enterpriseプラン</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              {/* テスティモニアル3 */}
              <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 relative">
                <div className="absolute -top-4 left-8 text-6xl text-primary-200 font-serif">&ldquo;</div>
                <div className="relative z-10">
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    副業でせどりを始めたばかりの初心者ですが、何を仕入れるべきか迷わなくなりました。<span className="font-semibold text-primary-600">無料プランでも十分使える</span>のがありがたいです。今では週末だけで月5万円の副収入を得ています。
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">A.Y. 様</div>
                      <div className="text-sm text-gray-500">会社員（副業）/ Freeプラン</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 実績バッジ */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-primary-700">顧客満足度 98%</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-primary-700">平均レビュー 4.9/5.0</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-primary-700">継続率 95%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Before/After 比較セクション */}
        <section className="py-24 bg-gray-50" aria-labelledby="comparison-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="comparison-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                EcomTrendAI 導入のビフォー・アフター
              </h2>
              <p className="text-xl text-gray-600">
                手作業からAI活用へ。業務効率が劇的に改善
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Before */}
              <div className="bg-white p-8 rounded-xl border-2 border-red-200 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-red-100 text-red-700 font-semibold rounded-full text-sm">
                  Before
                </div>
                <ul className="space-y-4 mt-4">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-gray-700">毎日2時間以上のランキングチェック</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-gray-700">トレンド商品の発見が遅れがち</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-gray-700">感覚に頼った仕入れ判断</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-gray-700">カテゴリごとの分析が困難</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-gray-700">競合に先を越されることが多い</span>
                  </li>
                </ul>
              </div>

              {/* After */}
              <div className="bg-white p-8 rounded-xl border-2 border-green-200 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-100 text-green-700 font-semibold rounded-full text-sm">
                  After
                </div>
                <ul className="space-y-4 mt-4">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong className="text-green-600">30分</strong>で完了するリサーチ作業</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">急上昇商品を<strong className="text-green-600">24時間以内</strong>に検出</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong className="text-green-600">データに基づいた</strong>仕入れ判断</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong className="text-green-600">50+カテゴリ</strong>をワンクリックで分析</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">競合より<strong className="text-green-600">早く</strong>トレンドを把握</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 中央の矢印 */}
            <div className="hidden md:flex justify-center -mt-8 mb-8">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* メディア掲載・信頼セクション */}
        <section className="py-16 bg-white border-b" aria-labelledby="trust-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p id="trust-heading" className="text-center text-gray-500 text-sm mb-8 uppercase tracking-wider">
              多くのプロフェッショナルに選ばれています
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
              {/* プレースホルダーロゴ（実際の導入企業ロゴに差し替え） */}
              <div className="text-2xl font-bold text-gray-400">TECH MEDIA</div>
              <div className="text-2xl font-bold text-gray-400">EC JOURNAL</div>
              <div className="text-2xl font-bold text-gray-400">STARTUP NEWS</div>
              <div className="text-2xl font-bold text-gray-400">BUSINESS+</div>
              <div className="text-2xl font-bold text-gray-400">AI WEEKLY</div>
            </div>
          </div>
        </section>

        {/* ユースケースセクション */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                こんな方におすすめ
              </h2>
              <p className="text-xl text-gray-600">
                EcomTrendAIは様々なビジネスシーンで活躍します
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* ユースケース1 */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">せどり・転売</h3>
                <p className="text-gray-600 text-sm">
                  急上昇商品をいち早くキャッチして、仕入れのタイミングを逃しません。利益率の高い商品を効率的に見つけられます。
                </p>
              </div>

              {/* ユースケース2 */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">EC事業者</h3>
                <p className="text-gray-600 text-sm">
                  市場トレンドを把握して、商品ラインナップの最適化に活用。競合の動向も把握できます。
                </p>
              </div>

              {/* ユースケース3 */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">マーケティング担当</h3>
                <p className="text-gray-600 text-sm">
                  カテゴリ別のトレンド分析で、プロモーション戦略の立案に役立てられます。
                </p>
              </div>

              {/* ユースケース4 */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">副業・個人事業主</h3>
                <p className="text-gray-600 text-sm">
                  本業の合間でも、効率的に売れ筋商品を見つけられます。時間をかけずにリサーチが可能です。
                </p>
              </div>

              {/* ユースケース5 */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">開発者・エンジニア</h3>
                <p className="text-gray-600 text-sm">
                  REST APIで自分のシステムと連携。独自のトレンド分析ツールを構築できます。
                </p>
              </div>

              {/* ユースケース6 */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">コンサルタント</h3>
                <p className="text-gray-600 text-sm">
                  クライアントへの提案資料作成に活用。データに基づいた説得力のある提案が可能です。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* メールキャプチャセクション */}
        <EmailCapture
          variant="banner"
          title="無料トレンドレポートを毎朝お届け"
          description="メールアドレスを登録するだけで、毎朝8時に最新のトレンドレポートをお届けします。"
          buttonText="登録する"
        />

        {/* FAQセクション */}
        <section className="py-24 bg-white" aria-labelledby="faq-heading">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                よくある質問
              </h2>
              <p className="text-xl text-gray-600">
                お客様からよくいただく質問にお答えします
              </p>
            </div>

            <div className="space-y-4" role="region" aria-label="よくある質問一覧">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <h3>
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
                      aria-expanded={openFaq === index}
                      aria-controls={`faq-answer-${index}`}
                      id={`faq-question-${index}`}
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </h3>
                  {openFaq === index && (
                    <div
                      id={`faq-answer-${index}`}
                      className="px-6 py-4 bg-gray-50 border-t border-gray-200"
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                    >
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA セクション */}
        <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
          {/* 背景装飾 */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/30 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              今すぐトレンド分析を始めましょう
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              無料プランで基本機能をお試しいただけます。
              <br />
              より高度な分析が必要な場合は、いつでもアップグレード可能です。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* フッターCTAもA/Bテスト対応 */}
              <ABTestCTA href="/register" />
              <Link
                href="/contact"
                className="inline-block border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all"
              >
                お問い合わせ
              </Link>
            </div>
            <p className="mt-6 text-primary-200 text-sm">
              30秒で登録完了・クレジットカード不要
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
