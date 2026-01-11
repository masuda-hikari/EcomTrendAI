import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { auth } from '@/lib/api';
import { trackPageView } from '@/lib/tracking';

interface ReferralStats {
  referral_code: string | null;
  referral_url: string | null;
  total_referrals: number;
  pending_referrals: number;
  qualified_referrals: number;
  total_earned: number;
  credit_balance: number;
  reward_per_referral: number;
  referrals: Array<{
    referral_id: string;
    status: string;
    created_at: string;
    qualified_at: string | null;
    reward_amount: number;
  }>;
}

export default function ReferralPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login?redirect=/referral');
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/referral/stats`, {
          headers: {
            'X-API-Key': auth.getApiKey() || '',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('紹介統計取得エラー:', error);
      }
      setLoading(false);
    };

    fetchStats();
  }, [router]);

  useEffect(() => {
    trackPageView('referral', { section: 'dashboard' });
  }, []);

  const copyReferralLink = async () => {
    if (stats?.referral_url) {
      try {
        await navigator.clipboard.writeText(stats.referral_url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch {
        // フォールバック
        const textArea = document.createElement('textarea');
        textArea.value = stats.referral_url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  const shareToTwitter = () => {
    if (stats?.referral_url) {
      const text = encodeURIComponent(
        `EcomTrendAI でEコマーストレンド分析を始めよう！\n私の紹介リンクから登録すると200円分のクレジットがもらえます\n`
      );
      window.open(
        `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(stats.referral_url)}`,
        '_blank'
      );
    }
  };

  const shareToLine = () => {
    if (stats?.referral_url) {
      const text = encodeURIComponent(
        `EcomTrendAI でEコマーストレンド分析を始めよう！私の紹介リンクから登録すると200円分のクレジットがもらえます ${stats.referral_url}`
      );
      window.open(`https://line.me/R/msg/text/?${text}`, '_blank');
    }
  };

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

  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: '待機中', color: 'bg-yellow-100 text-yellow-800' };
      case 'qualified':
        return { text: '条件達成', color: 'bg-blue-100 text-blue-800' };
      case 'rewarded':
        return { text: '報酬付与済', color: 'bg-green-100 text-green-800' };
      case 'expired':
        return { text: '期限切れ', color: 'bg-gray-100 text-gray-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <>
      <Head>
        <title>紹介プログラム - EcomTrendAI</title>
        <meta name="description" content="友達を紹介して報酬を獲得しましょう。紹介者には500円、被紹介者には200円のクレジットをプレゼント。" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ヘッダー */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              紹介プログラム
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              友達を紹介して報酬を獲得しましょう。<br className="hidden md:inline" />
              あなたも友達もお得になるWin-Winプログラムです。
            </p>
          </div>

          {/* 報酬説明 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">報酬について</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-primary-50 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🎁</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">あなたへの報酬</h3>
                <p className="text-3xl font-bold text-primary-600 mb-2">¥{stats?.reward_per_referral || 500}</p>
                <p className="text-sm text-gray-600">
                  紹介した友達が有料プランに加入すると
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">友達への特典</h3>
                <p className="text-3xl font-bold text-green-600 mb-2">¥200</p>
                <p className="text-sm text-gray-600">
                  登録時に即座にクレジット付与
                </p>
              </div>
            </div>
          </div>

          {/* 紹介コード・リンク */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">あなたの紹介リンク</h2>

            {stats?.referral_code ? (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">紹介コード</label>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 bg-gray-100 px-4 py-3 rounded-lg font-mono text-lg text-primary-600">
                      {stats.referral_code}
                    </code>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">紹介リンク</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      readOnly
                      value={stats.referral_url || ''}
                      className="flex-1 bg-gray-100 px-4 py-3 rounded-lg text-sm text-gray-600"
                    />
                    <button
                      onClick={copyReferralLink}
                      className={`px-6 py-3 rounded-lg font-medium transition ${
                        copySuccess
                          ? 'bg-green-600 text-white'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {copySuccess ? 'コピーしました！' : 'コピー'}
                    </button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <p className="text-sm text-gray-600 mb-4">SNSでシェア</p>
                  <div className="flex gap-3">
                    <button
                      onClick={shareToTwitter}
                      className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a91da] transition"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      X (Twitter)
                    </button>
                    <button
                      onClick={shareToLine}
                      className="flex items-center gap-2 px-4 py-2 bg-[#00B900] text-white rounded-lg hover:bg-[#00a000] transition"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                      </svg>
                      LINE
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">紹介コードを生成中...</p>
            )}
          </div>

          {/* 統計 */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-3xl font-bold text-primary-600">{stats?.total_referrals || 0}</p>
              <p className="text-sm text-gray-600 mt-1">総紹介数</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats?.pending_referrals || 0}</p>
              <p className="text-sm text-gray-600 mt-1">待機中</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-3xl font-bold text-green-600">{stats?.qualified_referrals || 0}</p>
              <p className="text-sm text-gray-600 mt-1">条件達成</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-3xl font-bold text-primary-600">¥{stats?.total_earned || 0}</p>
              <p className="text-sm text-gray-600 mt-1">獲得報酬</p>
            </div>
          </div>

          {/* クレジット残高 */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg p-8 mb-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h2 className="text-lg font-medium opacity-90">クレジット残高</h2>
                <p className="text-4xl font-bold mt-2">¥{stats?.credit_balance || 0}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-sm opacity-80 mb-2">クレジットは次回の支払いに自動適用されます</p>
                <Link
                  href="/pricing"
                  className="inline-block bg-white text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
                >
                  プランを見る
                </Link>
              </div>
            </div>
          </div>

          {/* 紹介履歴 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">紹介履歴</h2>

            {stats?.referrals && stats.referrals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">日付</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ステータス</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">条件達成日</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">報酬</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.referrals.map((referral) => {
                      const status = statusLabel(referral.status);
                      return (
                        <tr key={referral.referral_id} className="border-b last:border-b-0">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {new Date(referral.created_at).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                              {status.text}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {referral.qualified_at
                              ? new Date(referral.qualified_at).toLocaleDateString('ja-JP')
                              : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                            {referral.reward_amount > 0 ? `¥${referral.reward_amount}` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-4">👥</div>
                <p className="mb-2">まだ紹介実績がありません</p>
                <p className="text-sm">紹介リンクを共有して、友達を招待しましょう！</p>
              </div>
            )}
          </div>

          {/* 使い方 */}
          <div className="mt-8 bg-gray-50 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">紹介プログラムの流れ</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  1
                </div>
                <h3 className="font-medium text-gray-900 mb-1">リンクを共有</h3>
                <p className="text-sm text-gray-600">紹介リンクを友達に送る</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  2
                </div>
                <h3 className="font-medium text-gray-900 mb-1">友達が登録</h3>
                <p className="text-sm text-gray-600">友達が無料登録（200円クレジット付与）</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  3
                </div>
                <h3 className="font-medium text-gray-900 mb-1">有料プラン加入</h3>
                <p className="text-sm text-gray-600">友達が有料プランに加入</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  4
                </div>
                <h3 className="font-medium text-gray-900 mb-1">報酬獲得！</h3>
                <p className="text-sm text-gray-600">あなたに500円クレジット付与</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
