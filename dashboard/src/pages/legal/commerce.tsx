import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Commerce() {
  return (
    <>
      <Head>
        <title>特定商取引法に基づく表記 - EcomTrendAI</title>
        <meta name="description" content="EcomTrendAIの特定商取引法に基づく表記。事業者情報、返品・キャンセルポリシーについて。" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">特定商取引法に基づく表記</h1>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <th className="py-4 pr-4 text-left text-gray-900 font-semibold align-top w-1/3">
                    販売事業者名
                  </th>
                  <td className="py-4 text-gray-600">
                    EcomTrendAI
                    <p className="text-sm text-gray-500 mt-1">
                      ※法人設立準備中。設立後、法人名を記載します。
                    </p>
                  </td>
                </tr>

                <tr>
                  <th className="py-4 pr-4 text-left text-gray-900 font-semibold align-top">
                    運営責任者
                  </th>
                  <td className="py-4 text-gray-600">
                    ※お問い合わせいただければ開示いたします
                  </td>
                </tr>

                <tr>
                  <th className="py-4 pr-4 text-left text-gray-900 font-semibold align-top">
                    所在地
                  </th>
                  <td className="py-4 text-gray-600">
                    ※お問い合わせいただければ開示いたします
                  </td>
                </tr>

                <tr>
                  <th className="py-4 pr-4 text-left text-gray-900 font-semibold align-top">
                    電話番号
                  </th>
                  <td className="py-4 text-gray-600">
                    ※お問い合わせいただければ開示いたします
                    <p className="text-sm text-gray-500 mt-1">
                      お問い合わせはメールでお願いいたします
                    </p>
                  </td>
                </tr>

                <tr>
                  <th className="py-4 pr-4 text-left text-gray-900 font-semibold align-top">
                    お問い合わせ
                  </th>
                  <td className="py-4 text-gray-600">
                    <Link href="/contact" className="text-primary-600 hover:underline">
                      お問い合わせフォーム
                    </Link>
                  </td>
                </tr>

                <tr>
                  <th className="py-4 pr-4 text-left text-gray-900 font-semibold align-top">
                    販売価格
                  </th>
                  <td className="py-4 text-gray-600">
                    <ul className="space-y-1">
                      <li>Free プラン: 無料</li>
                      <li>Pro プラン: 月額 980円（税込）</li>
                      <li>Enterprise プラン: 月額 4,980円（税込）</li>
                    </ul>
                    <p className="text-sm text-gray-500 mt-2">
                      詳細は<Link href="/pricing" className="text-primary-600 hover:underline">料金ページ</Link>をご確認ください
                    </p>
                  </td>
                </tr>

                <tr>
                  <th className="py-4 pr-4 text-left text-gray-900 font-semibold align-top">
                    販売価格以外の必要料金
                  </th>
                  <td className="py-4 text-gray-600">
                    なし
                    <p className="text-sm text-gray-500 mt-1">
                      ※インターネット接続にかかる通信費はお客様のご負担となります
                    </p>
                  </td>
                </tr>

                <tr>
                  <th className="py-4 pr-4 text-left text-gray-900 font-semibold align-top">
                    支払方法
                  </th>
                  <td className="py-4 text-gray-600">
                    クレジットカード決済（Stripe経由）
                    <ul className="text-sm text-gray-500 mt-1 space-y-1">
                      <li>Visa</li>
                      <li>Mastercard</li>
                      <li>American Express</li>
                      <li>JCB</li>
                    </ul>
                  </td>
                </tr>

                <tr>
                  <th className="py-4 pr-4 text-left text-gray-900 font-semibold align-top">
                    支払時期
                  </th>
                  <td className="py-4 text-gray-600">
                    月額プラン: 毎月、契約日と同日に課金
                    <p className="text-sm text-gray-500 mt-1">
                      初回は登録時に即時課金
                    </p>
                  </td>
                </tr>

                <tr>
                  <th className="py-4 pr-4 text-left text-gray-900 font-semibold align-top">
                    サービス提供時期
                  </th>
                  <td className="py-4 text-gray-600">
                    決済完了後、即時利用可能
                  </td>
                </tr>

                <tr>
                  <th className="py-4 pr-4 text-left text-gray-900 font-semibold align-top">
                    返品・キャンセル
                  </th>
                  <td className="py-4 text-gray-600">
                    <p className="font-medium mb-2">返金ポリシー</p>
                    <ul className="space-y-1 text-sm">
                      <li>・お支払いから14日以内: 全額返金</li>
                      <li>・14日を超えた場合: 返金不可（次回更新をキャンセル可能）</li>
                    </ul>
                    <p className="mt-3 font-medium mb-2">キャンセル方法</p>
                    <ul className="space-y-1 text-sm">
                      <li>・ダッシュボードの設定画面から解約可能</li>
                      <li>・解約後、現在の期間終了までサービス利用可能</li>
                    </ul>
                  </td>
                </tr>

                <tr>
                  <th className="py-4 pr-4 text-left text-gray-900 font-semibold align-top">
                    動作環境
                  </th>
                  <td className="py-4 text-gray-600">
                    <p className="font-medium mb-2">Webブラウザ</p>
                    <ul className="space-y-1 text-sm">
                      <li>・Google Chrome（最新版）</li>
                      <li>・Firefox（最新版）</li>
                      <li>・Safari（最新版）</li>
                      <li>・Microsoft Edge（最新版）</li>
                    </ul>
                    <p className="mt-3 font-medium mb-2">API</p>
                    <ul className="space-y-1 text-sm">
                      <li>・HTTPSでアクセス可能な環境</li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="pt-8 mt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
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
