import Link from 'next/link';
import { useRouter } from 'next/router';
import { auth } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(auth.isAuthenticated());
  }, []);

  const handleLogout = () => {
    auth.clearApiKey();
    setIsLoggedIn(false);
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* ロゴ */}
          <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ET</span>
            </div>
            <span className="font-bold text-xl text-gray-900">EcomTrendAI</span>
          </Link>

          {/* デスクトップナビゲーション */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              機能
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              料金
            </Link>
            <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
              ドキュメント
            </Link>
          </div>

          {/* デスクトップ認証ボタン */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                  ダッシュボード
                </Link>
                <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                  ログイン
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  無料で始める
                </Link>
              </>
            )}
          </div>

          {/* モバイルメニューボタン */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="メニューを開く"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="flex flex-col space-y-4">
              {/* ナビゲーションリンク */}
              <Link
                href="/#features"
                className="text-gray-600 hover:text-gray-900 py-2 transition-colors"
                onClick={closeMobileMenu}
              >
                機能
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 py-2 transition-colors"
                onClick={closeMobileMenu}
              >
                料金
              </Link>
              <Link
                href="/docs"
                className="text-gray-600 hover:text-gray-900 py-2 transition-colors"
                onClick={closeMobileMenu}
              >
                ドキュメント
              </Link>

              {/* 区切り線 */}
              <div className="border-t border-gray-100 my-2"></div>

              {/* 認証ボタン */}
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-gray-900 py-2 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    ダッシュボード
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-sm py-3 px-4 w-full"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 py-2 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary text-sm py-3 px-4 text-center"
                    onClick={closeMobileMenu}
                  >
                    無料で始める
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
