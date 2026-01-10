import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, auth } from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // APIキーを一時的に設定してユーザー情報を取得
    auth.setApiKey(apiKey);
    const result = await api.getCurrentUser();

    if (result.success) {
      // 認証成功
      router.push('/dashboard');
    } else {
      // 認証失敗
      auth.clearApiKey();
      setError('無効なAPIキーです。APIキーを確認してください。');
    }

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>ログイン - EcomTrendAI</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">ログイン</h1>
              <p className="text-gray-600">APIキーでログインしてください</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                  APIキー
                </label>
                <input
                  type="text"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="input font-mono"
                  placeholder="ect_xxxxxxxxxxxx"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  登録時に発行されたAPIキーを入力してください
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '認証中...' : 'ログイン'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                アカウントをお持ちでないですか？{' '}
                <Link href="/register" className="text-primary-600 hover:underline font-medium">
                  新規登録
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                APIキーを紛失した場合は、新しいAPIキーを発行できます。
                <br />
                <Link href="/contact" className="text-primary-600 hover:underline">
                  サポートに問い合わせる
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
