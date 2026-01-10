import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Terms() {
  return (
    <>
      <Head>
        <title>利用規約 - EcomTrendAI</title>
        <meta name="description" content="EcomTrendAIの利用規約。サービスの利用条件について説明します。" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <p className="text-gray-600">
              本利用規約（以下「本規約」）は、EcomTrendAI（以下「当サービス」）の利用条件を定めるものです。
              ユーザーは、本規約に同意の上、当サービスを利用するものとします。
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第1条（適用）</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>本規約は、当サービスの提供条件および当サービスとユーザーとの間の権利義務関係を定めることを目的とします。</li>
                <li>ユーザーは、本規約に同意した上で当サービスを利用するものとします。</li>
                <li>当サービスが別途定める個別規定は、本規約の一部を構成します。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第2条（サービス内容）</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>当サービスは、Eコマースプラットフォームのトレンドデータを分析し、APIおよびダッシュボードを通じて提供します。</li>
                <li>当サービスは、予告なくサービス内容を変更、追加、または削除することがあります。</li>
                <li>当サービスが提供するデータは参考情報であり、その正確性、完全性を保証するものではありません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第3条（アカウント登録）</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>ユーザーは、正確かつ最新の情報を登録するものとします。</li>
                <li>ユーザーは、アカウント情報（APIキーを含む）を適切に管理し、第三者に開示または貸与してはなりません。</li>
                <li>アカウントの不正使用による損害について、当サービスは責任を負いません。</li>
                <li>18歳未満の方は、保護者の同意を得た上でサービスを利用するものとします。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第4条（料金および支払い）</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>有料プランの料金は、料金ページに記載のとおりとします。</li>
                <li>支払いはStripeを通じて処理され、月額または年額で課金されます。</li>
                <li>支払い後の返金は、支払いから14日以内の場合に限り、全額返金いたします。</li>
                <li>料金の変更は、30日前に通知の上、次回更新時から適用されます。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第5条（禁止事項）</h2>
              <p className="text-gray-600 mb-4">ユーザーは、以下の行為を行ってはなりません：</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>法令または公序良俗に違反する行為</li>
                <li>当サービスの運営を妨害する行為</li>
                <li>不正アクセスまたはそれを試みる行為</li>
                <li>APIの過度な呼び出しやスクレイピング</li>
                <li>虚偽の情報での登録</li>
                <li>第三者へのアカウント譲渡または共有</li>
                <li>当サービスのデータの再販売または再配布</li>
                <li>他のユーザーの利用を妨げる行為</li>
                <li>その他、当サービスが不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第6条（利用制限）</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>各プランにはAPI呼び出し回数などの利用制限があります。</li>
                <li>利用制限を超えた場合、一時的にサービスが制限されることがあります。</li>
                <li>当サービスは、ユーザーが本規約に違反した場合、事前の通知なくアカウントを停止または削除することができます。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第7条（知的財産権）</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>当サービスに関するすべての知的財産権は、当サービスまたは正当な権利者に帰属します。</li>
                <li>ユーザーは、取得したデータを自己の事業目的でのみ利用でき、再配布は禁止されます。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第8条（免責事項）</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>当サービスは、データの正確性、完全性、有用性について保証しません。</li>
                <li>当サービスの利用に基づく投資判断、事業判断はユーザーの責任において行うものとします。</li>
                <li>システム障害、メンテナンス等によるサービス停止について、当サービスは責任を負いません。</li>
                <li>当サービスは、ユーザーに生じた損害について、故意または重過失がある場合を除き、責任を負いません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第9条（サービスの変更・終了）</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>当サービスは、事前の通知なくサービス内容を変更することがあります。</li>
                <li>当サービスは、30日前の通知をもってサービスを終了することができます。</li>
                <li>サービス終了時、有料プランのユーザーには日割り計算で返金を行います。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第10条（規約の変更）</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>当サービスは、必要に応じて本規約を変更することがあります。</li>
                <li>重要な変更がある場合は、サービス上で通知します。</li>
                <li>変更後もサービスを継続して利用する場合、変更後の規約に同意したものとみなします。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第11条（準拠法・管轄）</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>本規約は日本法に準拠します。</li>
                <li>本規約に関する紛争は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第12条（お問い合わせ）</h2>
              <p className="text-gray-600">
                本規約に関するお問い合わせは、
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
