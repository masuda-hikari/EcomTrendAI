import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, auth } from '@/lib/api';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [referralBonus, setReferralBonus] = useState(0);

  // URLから紹介コードを取得
  useEffect(() => {
    const ref = router.query.ref as string;
    if (ref) {
      setReferralCode(ref);
      validateReferralCode(ref);
    }
  }, [router.query.ref]);

  // 紹介コード検証
  const validateReferralCode = async (code: string) => {
    if (!code) {
      setReferralValid(null);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/referral/validate/${code}`
      );
      const data = await response.json();
      setReferralValid(data.valid);
    } catch {
      setReferralValid(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 紹介コード付きで登録
    const result = await api.registerWithReferral(email, referralCode || undefined);

    if (result.success && result.data) {
      // APIキーを保存
      if (result.data.api_key) {
        auth.setApiKey(result.data.api_key);
        setApiKey(result.data.api_key);
      }
      // 紹介特典があれば表示
      if (referralValid && referralCode) {
        setReferralBonus(200);
      }
      setSuccess(true);
    } else {
      setError(result.error || '登録に失敗しました');
    }

    setLoading(false);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    alert('APIキーをコピーしました');
  };

  return (
    <>
      <Head>
        <title>新規登録 - EcomTrendAI</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          {!success ? (
            <div className="card">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">アカウント作成</h1>
                <p className="text-gray-600">無料でEcomTrendAIを始めましょう</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                {/* 紹介コード入力 */}
                <div className="mb-6">
                  <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
                    紹介コード（お持ちの場合）
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="referralCode"
                      value={referralCode}
                      onChange={(e) => {
                        setReferralCode(e.target.value.toUpperCase());
                        validateReferralCode(e.target.value.toUpperCase());
                      }}
                      className={`input ${
                        referralValid === true
                          ? 'border-green-500 focus:ring-green-500'
                          : referralValid === false
                          ? 'border-red-500 focus:ring-red-500'
                          : ''
                      }`}
                      placeholder="例: ECT12345678"
                    />
                    {referralValid === true && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {referralValid === true && (
                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                      <span>🎉</span> 有効な紹介コードです！200円分のクレジットがもらえます
                    </p>
                  )}
                  {referralValid === false && referralCode && (
                    <p className="mt-1 text-sm text-red-600">
                      この紹介コードは無効または期限切れです
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '処理中...' : '無料で登録'}
                </button>
              </form>

              {/* セキュリティ保証 */}
              <div className="mt-6 flex items-center justify-center gap-6 py-4 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  SSL暗号化
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  クレカ不要
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  30秒で完了
                </div>
              </div>

              <div className="mt-4 text-center text-sm text-gray-600">
                <p>
                  登録することで、
                  <Link href="/terms" className="text-primary-600 hover:underline">
                    利用規約
                  </Link>
                  と
                  <Link href="/privacy" className="text-primary-600 hover:underline">
                    プライバシーポリシー
                  </Link>
                  に同意したものとみなされます。
                </p>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  すでにアカウントをお持ちですか？{' '}
                  <Link href="/login" className="text-primary-600 hover:underline font-medium">
                    ログイン
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">登録完了!</h1>
                <p className="text-gray-600">APIキーが発行されました</p>
              </div>

              {/* 紹介特典表示 */}
              {referralBonus > 0 && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🎁</span>
                    <div>
                      <p className="font-medium text-green-800">紹介特典が適用されました！</p>
                      <p className="text-sm text-green-700">
                        {referralBonus}円分のクレジットがアカウントに追加されました
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">あなたのAPIキー</span>
                  <button
                    onClick={handleCopyApiKey}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    コピー
                  </button>
                </div>
                <code className="block text-sm bg-white p-3 rounded border break-all">{apiKey}</code>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg mb-6 text-sm text-yellow-800">
                <strong>重要:</strong> このAPIキーは一度しか表示されません。安全な場所に保存してください。
              </div>

              <Link href="/dashboard" className="block w-full btn-primary text-center">
                ダッシュボードへ
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
