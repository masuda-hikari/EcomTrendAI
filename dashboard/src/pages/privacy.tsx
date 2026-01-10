import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>プライバシーポリシー - EcomTrendAI</title>
        <meta name="description" content="EcomTrendAIのプライバシーポリシー。個人情報の取り扱いについて説明します。" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <p className="text-gray-600">
              EcomTrendAI（以下「当サービス」）は、ユーザーの個人情報の保護を重要視しています。
              本プライバシーポリシーは、当サービスがどのように個人情報を収集、使用、保護するかを説明します。
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 収集する情報</h2>
              <p className="text-gray-600 mb-4">当サービスは、以下の情報を収集することがあります：</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>メールアドレス（アカウント登録時）</li>
                <li>支払い情報（有料プラン契約時、Stripeを通じて処理）</li>
                <li>サービス利用履歴（API呼び出し履歴など）</li>
                <li>アクセスログ（IPアドレス、ブラウザ情報など）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 情報の利用目的</h2>
              <p className="text-gray-600 mb-4">収集した情報は、以下の目的で利用します：</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>サービスの提供・運営</li>
                <li>ユーザーサポートの提供</li>
                <li>サービスの改善・新機能の開発</li>
                <li>不正利用の防止</li>
                <li>法令に基づく対応</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 情報の共有</h2>
              <p className="text-gray-600 mb-4">
                当サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供しません：
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>ユーザーの同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>サービス提供に必要な外部委託先（Stripeなどの決済サービス）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 情報の保護</h2>
              <p className="text-gray-600">
                当サービスは、収集した個人情報を適切に管理し、不正アクセス、紛失、破壊、
                改ざん、漏洩などから保護するための合理的な安全対策を講じています。
                データはSSL/TLSにより暗号化され、適切なアクセス制御が実施されています。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Cookieの使用</h2>
              <p className="text-gray-600">
                当サービスは、ユーザー体験の向上とサービス改善のためにCookieを使用します。
                Cookieは、ログイン状態の維持、利用状況の分析などに利用されます。
                ブラウザの設定によりCookieを無効にすることができますが、
                一部の機能が制限される場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. ユーザーの権利</h2>
              <p className="text-gray-600 mb-4">ユーザーは以下の権利を有します：</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>個人情報の開示請求</li>
                <li>個人情報の訂正・削除請求</li>
                <li>個人情報の利用停止請求</li>
                <li>アカウントの削除</li>
              </ul>
              <p className="text-gray-600 mt-4">
                これらの請求は、お問い合わせページよりご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. 未成年者の保護</h2>
              <p className="text-gray-600">
                当サービスは、18歳未満の方からの個人情報を意図的に収集しません。
                18歳未満の方がサービスを利用する場合は、保護者の同意が必要です。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. ポリシーの変更</h2>
              <p className="text-gray-600">
                当サービスは、必要に応じて本プライバシーポリシーを変更することがあります。
                重要な変更がある場合は、サービス上で通知します。
                変更後もサービスを継続して利用する場合、変更後のポリシーに同意したものとみなします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. お問い合わせ</h2>
              <p className="text-gray-600">
                本プライバシーポリシーに関するお問い合わせは、
                <Link href="/contact" className="text-primary-600 hover:underline">お問い合わせページ</Link>
                よりご連絡ください。
              </p>
            </section>

            <div className="pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                制定日: 2026年1月10日<br />
                最終更新日: 2026年1月10日
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
