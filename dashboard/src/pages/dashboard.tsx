import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, auth, TrendItem, User } from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 認証チェック
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    // データ取得
    const fetchData = async () => {
      setLoading(true);

      // ユーザー情報
      const userResult = await api.getCurrentUser();
      if (!userResult.success) {
        setError('セッションが無効です。再度ログインしてください。');
        auth.clearApiKey();
        router.push('/login');
        return;
      }
      setUser(userResult.data!);

      // トレンドデータ
      const trendsResult = await api.getTrends(20);
      if (trendsResult.success) {
        setTrends(trendsResult.data!.trends);
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  // アップグレード成功メッセージ
  useEffect(() => {
    if (router.query.upgraded === 'true') {
      alert('プランのアップグレードが完了しました！');
      router.replace('/dashboard', undefined, { shallow: true });
    }
  }, [router.query.upgraded, router]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>ダッシュボード - EcomTrendAI</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
            <p className="text-gray-600 mt-1">
              {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* ユーザー情報カード */}
          {user && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="card">
                <h3 className="text-sm font-medium text-gray-500 mb-1">現在のプラン</h3>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900">{user.plan_name}</span>
                  {user.plan !== 'enterprise' && (
                    <Link href="/pricing" className="ml-3 text-sm text-primary-600 hover:underline">
                      アップグレード
                    </Link>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 className="text-sm font-medium text-gray-500 mb-1">メールアドレス</h3>
                <p className="text-lg font-semibold text-gray-900 truncate">{user.email}</p>
              </div>

              <div className="card">
                <h3 className="text-sm font-medium text-gray-500 mb-1">ステータス</h3>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.is_active ? 'アクティブ' : '非アクティブ'}
                </span>
              </div>
            </div>
          )}

          {/* トレンドデータ */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">トレンド商品</h2>
              <span className="text-sm text-gray-500">{trends.length}件</span>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>
            )}

            {trends.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">商品名</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">カテゴリ</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">現在ランク</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">変動</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">価格</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">リンク</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trends.map((trend, index) => (
                      <tr key={trend.asin} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="text-gray-900 font-medium">{trend.name}</span>
                          <br />
                          <span className="text-xs text-gray-500">{trend.asin}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{trend.category}</td>
                        <td className="py-3 px-4 text-right text-gray-900 font-mono">
                          #{trend.current_rank.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${
                              trend.rank_change > 0
                                ? 'bg-green-100 text-green-800'
                                : trend.rank_change < 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {trend.rank_change > 0 && '+'}
                            {trend.rank_change_percent.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900 font-mono">
                          {trend.price ? `¥${trend.price.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <a
                            href={trend.affiliate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>トレンドデータがありません</p>
                <p className="text-sm mt-2">データ取得が完了するまでお待ちください</p>
              </div>
            )}
          </div>

          {/* クイックアクション */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">APIキー</h3>
              <p className="text-gray-600 text-sm mb-4">
                APIを使用してプログラムからトレンドデータにアクセスできます。
              </p>
              <code className="block bg-gray-100 p-3 rounded text-sm font-mono text-gray-700 mb-4 truncate">
                {auth.getApiKey()?.slice(0, 20)}...
              </code>
              <Link href="/docs/api" className="text-primary-600 hover:underline text-sm font-medium">
                APIドキュメントを見る &rarr;
              </Link>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">もっと機能が必要ですか？</h3>
              <p className="text-gray-600 text-sm mb-4">
                Proプランにアップグレードすると、リアルタイムアラートやCSV/JSONエクスポートが利用できます。
              </p>
              <Link href="/pricing" className="btn-primary inline-block text-sm py-2 px-4">
                プランを比較する
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
