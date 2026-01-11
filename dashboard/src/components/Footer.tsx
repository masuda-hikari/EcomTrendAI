import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ロゴ・説明 */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                <span className="text-white font-bold text-sm">ET</span>
              </div>
              <span className="font-bold text-xl text-white">EcomTrendAI</span>
            </div>
            <p className="text-sm">
              AIを活用したEコマーストレンド分析サービス。
              売れ筋商品の発見と市場動向の把握を支援します。
            </p>
          </div>

          {/* 製品 */}
          <nav aria-label="製品">
            <h3 className="text-white font-semibold mb-4">製品</h3>
            <ul className="space-y-2 text-sm" role="list">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  機能
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  料金プラン
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-white transition-colors">
                  APIドキュメント
                </Link>
              </li>
            </ul>
          </nav>

          {/* サポート */}
          <nav aria-label="サポート">
            <h3 className="text-white font-semibold mb-4">サポート</h3>
            <ul className="space-y-2 text-sm" role="list">
              <li>
                <Link href="/docs/getting-started" className="hover:text-white transition-colors">
                  はじめに
                </Link>
              </li>
              <li>
                <Link href="/docs/api" className="hover:text-white transition-colors">
                  APIリファレンス
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </nav>

          {/* 法的情報 */}
          <nav aria-label="法的情報">
            <h3 className="text-white font-semibold mb-4">法的情報</h3>
            <ul className="space-y-2 text-sm" role="list">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/legal/commerce" className="hover:text-white transition-colors">
                  特定商取引法に基づく表記
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} EcomTrendAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
