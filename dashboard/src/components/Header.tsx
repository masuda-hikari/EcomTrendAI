import Link from 'next/link';
import { useRouter } from 'next/router';
import { auth } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(auth.isAuthenticated());
  }, []);

  const handleLogout = () => {
    auth.clearApiKey();
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* ロゴ */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ET</span>
            </div>
            <span className="font-bold text-xl text-gray-900">EcomTrendAI</span>
          </Link>

          {/* ナビゲーション */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-gray-600 hover:text-gray-900">
              機能
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              料金
            </Link>
            <Link href="/docs" className="text-gray-600 hover:text-gray-900">
              ドキュメント
            </Link>
          </div>

          {/* 認証ボタン */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  ダッシュボード
                </Link>
                <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900">
                  ログイン
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  無料で始める
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
