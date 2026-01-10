import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, auth } from '@/lib/api';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await api.register(email);

    if (result.success && result.data) {
      // APIキーを保存
      if (result.data.api_key) {
        auth.setApiKey(result.data.api_key);
        setApiKey(result.data.api_key);
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '処理中...' : '無料で登録'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
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
