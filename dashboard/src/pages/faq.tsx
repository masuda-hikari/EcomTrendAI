import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { trackPageView } from '@/lib/tracking';

// FAQカテゴリとデータ定義
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    id: 'general',
    name: '基本情報',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    items: [
      {
        question: 'EcomTrendAIとは何ですか？',
        answer: 'EcomTrendAIは、AIを活用してAmazonなどのEコマースプラットフォームのトレンドを分析するサービスです。急上昇商品の検出、カテゴリ別トレンド分析、トレンドスコアの算出など、せどり・物販・EC事業者の仕入れ判断をサポートします。'
      },
      {
        question: 'どのようなデータを分析していますか？',
        answer: '主にAmazonのベストセラーランキング、売れ筋ランキング、急上昇商品（Movers & Shakers）のデータを日次で収集・分析しています。価格変動、レビュー数、評価、ランク変動率などを総合的に分析してトレンドスコアを算出します。'
      },
      {
        question: 'データの更新頻度はどのくらいですか？',
        answer: 'データは毎日自動で収集・更新されます。Proプラン以上ではリアルタイムアラート機能もご利用いただけ、急上昇商品を即座に通知します。'
      },
      {
        question: 'どのカテゴリに対応していますか？',
        answer: '電子機器、ファッション、食品、ホーム&キッチン、ビューティー、スポーツ、おもちゃ、本、ペット用品など、Amazonの主要50カテゴリ以上に対応しています。'
      }
    ]
  },
  {
    id: 'pricing',
    name: '料金・プラン',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    items: [
      {
        question: '無料プランでは何ができますか？',
        answer: '無料プランでは、日次10件のトレンドレポート、2カテゴリまでの分析、API 100回/日の呼び出しが可能です。まずは無料でお試しいただき、必要に応じてアップグレードできます。'
      },
      {
        question: 'Proプランと無料プランの違いは何ですか？',
        answer: 'Proプラン（月額¥980）では、日次100件のトレンドレポート、全カテゴリ分析、リアルタイムアラート、CSV/JSONエクスポート、API 10,000回/日など、ビジネスで本格的に活用するための機能が利用できます。'
      },
      {
        question: 'Enterpriseプランはどのような企業向けですか？',
        answer: 'Enterpriseプラン（月額¥4,980）は、大規模なEC事業者や複数メンバーでの利用を想定しています。無制限のデータアクセス、カスタムダッシュボード、専用サポート、SLA保証など、企業向けの機能を提供します。'
      },
      {
        question: '支払い方法は何がありますか？',
        answer: 'クレジットカード（Visa、Mastercard、American Express、JCB）でのお支払いに対応しています。決済はStripeを通じて安全に処理されます。'
      },
      {
        question: '返金はできますか？',
        answer: 'はい、14日間の返金保証があります。サービスにご満足いただけない場合は、理由を問わず全額返金いたします。お問い合わせフォームからご連絡ください。'
      },
      {
        question: '解約はいつでもできますか？',
        answer: 'はい、いつでも解約可能です。ダッシュボードから簡単に解約手続きができます。解約後も現在の請求期間終了まではサービスをご利用いただけます。'
      }
    ]
  },
  {
    id: 'account',
    name: 'アカウント',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    items: [
      {
        question: '登録に必要な情報は何ですか？',
        answer: 'メールアドレスとパスワードのみで登録できます。クレジットカード情報は無料プランでは不要です。約30秒で登録が完了します。'
      },
      {
        question: 'パスワードを忘れた場合はどうすればよいですか？',
        answer: 'ログインページの「パスワードを忘れた方」リンクからパスワードリセットをリクエストできます。登録メールアドレス宛にリセットリンクが送信されます。'
      },
      {
        question: 'メールアドレスを変更できますか？',
        answer: 'はい、ダッシュボードの「設定」からメールアドレスを変更できます。変更後は新しいメールアドレスでの確認が必要です。'
      },
      {
        question: 'アカウントを削除するにはどうすればよいですか？',
        answer: 'お問い合わせフォームからアカウント削除をリクエストしてください。削除リクエストから7日以内に処理されます。削除後はデータを復元できませんのでご注意ください。'
      }
    ]
  },
  {
    id: 'api',
    name: 'API・技術',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    items: [
      {
        question: 'APIキーはどこで取得できますか？',
        answer: 'ダッシュボードにログイン後、「APIキー」セクションから新しいAPIキーを生成できます。APIキーは安全に保管し、他人と共有しないでください。'
      },
      {
        question: 'APIのレート制限はありますか？',
        answer: 'はい、プランによってレート制限が異なります。Freeプランは100回/日、Proプランは10,000回/日、Enterpriseプランは無制限です。また、1秒あたり10リクエストの制限があります。'
      },
      {
        question: 'APIドキュメントはどこにありますか？',
        answer: 'APIドキュメントは「ドキュメント」ページからアクセスできます。エンドポイント一覧、リクエスト/レスポンス例、認証方法、エラーコードなどの詳細を記載しています。'
      },
      {
        question: 'Webhookは利用できますか？',
        answer: '現在Webhookは開発中です。Proプラン以上ではリアルタイムアラート機能（メール/Slack通知）をご利用いただけます。Webhook対応の予定についてはお問い合わせください。'
      },
      {
        question: 'どのプログラミング言語に対応していますか？',
        answer: 'EcomTrendAI APIはRESTful APIで、どのプログラミング言語からでも利用可能です。ドキュメントにはPython、JavaScript/TypeScriptのサンプルコードを掲載しています。'
      }
    ]
  },
  {
    id: 'referral',
    name: '紹介プログラム',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    items: [
      {
        question: '紹介プログラムとは何ですか？',
        answer: '紹介プログラムは、友人や知人にEcomTrendAIを紹介することで報酬を得られる制度です。紹介した方が有料プランに加入すると、紹介者に¥500のクレジットが付与されます。被紹介者も登録時に¥200のクレジットを受け取れます。'
      },
      {
        question: '紹介コードはどこで確認できますか？',
        answer: 'ログイン後、ダッシュボードの「紹介プログラム」ページから確認できます。コードをコピーしたり、SNSで直接シェアすることもできます。'
      },
      {
        question: '紹介報酬はいつ付与されますか？',
        answer: '紹介した方が有料プランに加入した時点で、紹介者に¥500のクレジットが自動的に付与されます。条件達成期間は登録から30日以内です。'
      },
      {
        question: 'クレジットは何に使えますか？',
        answer: 'クレジットは月額料金の支払いに充当できます。例えばProプラン（¥980/月）をご利用の場合、¥500のクレジットがあれば¥480のお支払いで済みます。'
      },
      {
        question: '紹介人数に上限はありますか？',
        answer: 'いいえ、紹介人数に上限はありません。多くの方を紹介すればするほど、より多くのクレジットを獲得できます。'
      }
    ]
  },
  {
    id: 'troubleshooting',
    name: 'トラブルシューティング',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    items: [
      {
        question: 'ログインできません',
        answer: 'メールアドレスとパスワードが正しいか確認してください。パスワードを忘れた場合は「パスワードを忘れた方」からリセットできます。それでも解決しない場合は、お問い合わせフォームからご連絡ください。'
      },
      {
        question: 'APIエラーが発生します',
        answer: 'APIキーが正しいか、レート制限に達していないか確認してください。エラーコードの詳細はAPIドキュメントを参照してください。401エラーは認証問題、429エラーはレート制限超過を示します。'
      },
      {
        question: 'データが更新されていないようです',
        answer: 'データは毎日自動更新されますが、更新に遅延が発生する場合があります。24時間以上データが更新されない場合は、お問い合わせフォームからご連絡ください。'
      },
      {
        question: '決済に失敗しました',
        answer: 'クレジットカード情報が正しいか、有効期限切れでないか確認してください。カード会社によっては海外決済がブロックされている場合があります。問題が続く場合は別のカードをお試しいただくか、お問い合わせください。'
      },
      {
        question: 'メールが届きません',
        answer: '迷惑メールフォルダを確認してください。また、@ecomtrend.ai からのメールを受信できるよう設定してください。それでも届かない場合はお問い合わせフォームからご連絡ください。'
      }
    ]
  }
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // ページビュー追跡
  useEffect(() => {
    trackPageView('faq', { section: 'help' });
  }, []);

  // FAQ項目の開閉トグル
  const toggleItem = (categoryId: string, index: number) => {
    const key = `${categoryId}-${index}`;
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // 検索フィルター
  const filteredCategories = searchQuery
    ? faqCategories.map(category => ({
        ...category,
        items: category.items.filter(
          item =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.items.length > 0)
    : faqCategories;

  const currentCategory = searchQuery
    ? filteredCategories
    : filteredCategories.filter(c => c.id === selectedCategory);

  return (
    <>
      <Head>
        <title>よくある質問（FAQ） | EcomTrendAI ヘルプセンター</title>
        <meta name="description" content="EcomTrendAIのよくある質問をまとめています。料金、使い方、API、トラブルシューティングなど、お困りの際はこちらをご確認ください。" />
        <meta property="og:title" content="よくある質問（FAQ） | EcomTrendAI" />
        <meta property="og:description" content="EcomTrendAIのよくある質問と回答をまとめたヘルプセンター" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        {/* ヘッダーセクション */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              ヘルプセンター
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              よくある質問をまとめています。解決しない場合はお問い合わせください。
            </p>

            {/* 検索ボックス */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="質問を検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
          </div>
        </section>

        {/* クイックリンク */}
        <section className="py-8 border-b bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>お問い合わせ</span>
              </Link>
              <Link
                href="/docs"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>APIドキュメント</span>
              </Link>
              <Link
                href="/demo"
                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>デモを試す</span>
              </Link>
            </div>
          </div>
        </section>

        {/* メインコンテンツ */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* カテゴリサイドバー（検索時は非表示） */}
              {!searchQuery && (
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                    <div className="p-4 border-b border-gray-200">
                      <h2 className="font-semibold text-gray-900">カテゴリ</h2>
                    </div>
                    <nav className="p-2">
                      {faqCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className={selectedCategory === category.id ? 'text-primary-600' : 'text-gray-400'}>
                            {category.icon}
                          </span>
                          <span className="font-medium">{category.name}</span>
                          <span className="ml-auto text-xs text-gray-400">
                            {category.items.length}
                          </span>
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              )}

              {/* FAQ一覧 */}
              <div className={searchQuery ? 'lg:col-span-4' : 'lg:col-span-3'}>
                {currentCategory.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      該当する質問が見つかりませんでした
                    </h3>
                    <p className="text-gray-600 mb-6">
                      キーワードを変えて検索するか、お問い合わせください。
                    </p>
                    <Link
                      href="/contact"
                      className="btn-primary inline-block"
                    >
                      お問い合わせ
                    </Link>
                  </div>
                ) : (
                  currentCategory.map((category) => (
                    <div key={category.id} className="mb-8">
                      {searchQuery && (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-primary-600">{category.icon}</span>
                          <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                        </div>
                      )}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {category.items.map((item, index) => {
                          const isOpen = openItems.has(`${category.id}-${index}`);
                          return (
                            <div
                              key={index}
                              className={index !== 0 ? 'border-t border-gray-200' : ''}
                            >
                              <button
                                onClick={() => toggleItem(category.id, index)}
                                className="w-full px-6 py-4 text-left flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
                                aria-expanded={isOpen}
                              >
                                <span className="font-medium text-gray-900">{item.question}</span>
                                <svg
                                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {isOpen && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                  <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 問い合わせCTA */}
        <section className="py-16 bg-white border-t">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              解決しましたか？
            </h2>
            <p className="text-gray-600 mb-8">
              上記のFAQで解決しない場合は、お気軽にお問い合わせください。<br />
              通常1営業日以内にご返信いたします。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary">
                お問い合わせ
              </Link>
              <Link
                href="/register"
                className="btn-secondary"
              >
                無料で始める
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
