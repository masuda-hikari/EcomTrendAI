import Link from 'next/link';
import { useRouter } from 'next/router';
import { auth } from '@/lib/api';
import { useState, useEffect, useCallback, useRef } from 'react';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsLoggedIn(auth.isAuthenticated());
  }, []);

  // Escキーでモバイルメニューを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        !menuButtonRef.current?.contains(e.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleLogout = useCallback(() => {
    auth.clearApiKey();
    setIsLoggedIn(false);
    setIsMobileMenuOpen(false);
    router.push('/');
  }, [router]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50" role="banner">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="メインナビゲーション">
        <div className="flex justify-between h-16 items-center">
          {/* ロゴ */}
          <Link
            href="/"
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
            onClick={closeMobileMenu}
            aria-label="EcomTrendAI ホームページへ"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-bold text-sm">ET</span>
            </div>
            <span className="font-bold text-xl text-gray-900">EcomTrendAI</span>
          </Link>

          {/* デスクトップナビゲーション */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              機能
            </Link>
            <Link href="/demo" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
              <span>デモ</span>
              <span className="bg-green-100 text-green-700 text-xs font-medium px-1.5 py-0.5 rounded">無料</span>
            </Link>
            <Link href="/sample-report" className="text-gray-600 hover:text-gray-900 transition-colors">
              サンプルレポート
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              料金
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">
              ブログ
            </Link>
            <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
              ドキュメント
            </Link>
            <Link href="/faq" className="text-gray-600 hover:text-gray-900 transition-colors">
              FAQ
            </Link>
          </div>

          {/* デスクトップ認証ボタン */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                  ダッシュボード
                </Link>
                <Link href="/referral" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                  <span>紹介プログラム</span>
                  <span className="bg-primary-100 text-primary-700 text-xs font-medium px-1.5 py-0.5 rounded">¥500</span>
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
            ref={menuButtonRef}
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label={isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            className="md:hidden border-t border-gray-100 py-4"
            role="menu"
            aria-orientation="vertical"
            data-testid="mobile-menu"
          >
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
                href="/demo"
                className="text-gray-600 hover:text-gray-900 py-2 transition-colors flex items-center gap-2"
                onClick={closeMobileMenu}
              >
                <span>デモ</span>
                <span className="bg-green-100 text-green-700 text-xs font-medium px-1.5 py-0.5 rounded">無料</span>
              </Link>
              <Link
                href="/sample-report"
                className="text-gray-600 hover:text-gray-900 py-2 transition-colors"
                onClick={closeMobileMenu}
              >
                サンプルレポート
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 py-2 transition-colors"
                onClick={closeMobileMenu}
              >
                料金
              </Link>
              <Link
                href="/blog"
                className="text-gray-600 hover:text-gray-900 py-2 transition-colors"
                onClick={closeMobileMenu}
              >
                ブログ
              </Link>
              <Link
                href="/docs"
                className="text-gray-600 hover:text-gray-900 py-2 transition-colors"
                onClick={closeMobileMenu}
              >
                ドキュメント
              </Link>
              <Link
                href="/faq"
                className="text-gray-600 hover:text-gray-900 py-2 transition-colors"
                onClick={closeMobileMenu}
              >
                FAQ
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
                  <Link
                    href="/referral"
                    className="text-gray-600 hover:text-gray-900 py-2 transition-colors flex items-center gap-2"
                    onClick={closeMobileMenu}
                  >
                    <span>紹介プログラム</span>
                    <span className="bg-primary-100 text-primary-700 text-xs font-medium px-1.5 py-0.5 rounded">¥500</span>
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
