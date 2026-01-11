import { useState, FormEvent, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { trackPageView } from '@/lib/tracking';

interface FormData {
  name: string;
  email: string;
  category: string;
  message: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    category: 'general',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // ページビュー追跡
  useEffect(() => {
    trackPageView('contact', { section: 'inquiry-form' });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('送信に失敗しました');
      }

      setStatus('sent');
      setFormData({ name: '', email: '', category: 'general', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <Head>
        <title>お問い合わせ - EcomTrendAI</title>
        <meta name="description" content="EcomTrendAIへのお問い合わせ。サービスに関するご質問、ご要望をお聞かせください。" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">お問い合わせ</h1>
            <p className="text-gray-600">
              サービスに関するご質問、ご要望がございましたらお気軽にお問い合わせください。<br />
              通常2営業日以内にご返信いたします。
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            {status === 'sent' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  お問い合わせを受け付けました
                </h2>
                <p className="text-gray-600 mb-6">
                  ご連絡ありがとうございます。<br />
                  2営業日以内にご返信いたします。
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-primary-600 hover:underline"
                >
                  新しいお問い合わせを送信
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="山田 太郎"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    お問い合わせ種別 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="general">一般的なお問い合わせ</option>
                    <option value="sales">サービス・料金について</option>
                    <option value="technical">技術的な質問</option>
                    <option value="billing">請求・支払いについて</option>
                    <option value="privacy">個人情報について</option>
                    <option value="bug">不具合の報告</option>
                    <option value="feature">機能リクエスト</option>
                    <option value="partnership">提携・協業について</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    お問い合わせ内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="お問い合わせ内容をご記入ください"
                  />
                </div>

                {status === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    送信中にエラーが発生しました。時間をおいて再度お試しください。
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {status === 'sending' ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        送信中...
                      </>
                    ) : (
                      '送信する'
                    )}
                  </button>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  送信することで、
                  <Link href="/privacy" className="text-primary-600 hover:underline">プライバシーポリシー</Link>
                  に同意したものとみなします。
                </p>
              </form>
            )}
          </div>

          {/* よくある質問へのリンク */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              よくある質問は料金ページでも確認できます
            </p>
            <Link href="/pricing#faq" className="text-primary-600 hover:underline font-medium">
              よくある質問を見る &rarr;
            </Link>
          </div>

          {/* コンバージョン導線 */}
          <div className="mt-16 bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  お問い合わせの前に…
                </h2>
                <p className="text-gray-600 mb-6">
                  EcomTrendAIの機能を実際に体験してみませんか？
                  デモダッシュボードなら、登録不要・無料で今すぐトレンド分析をお試しいただけます。
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/demo"
                    className="inline-flex items-center justify-center bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md"
                  >
                    🎯 デモを試す
                  </Link>
                  <Link
                    href="/sample-report"
                    className="inline-flex items-center justify-center bg-white text-primary-600 border border-primary-300 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                  >
                    📊 サンプルレポートを見る
                  </Link>
                </div>
              </div>
              <div className="flex-shrink-0 hidden md:block">
                <div className="w-48 h-48 bg-gradient-to-br from-primary-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-6xl">📈</span>
                </div>
              </div>
            </div>
          </div>

          {/* サポート情報 */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">迅速な対応</h3>
              <p className="text-sm text-gray-600">2営業日以内にご返信いたします</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">安心サポート</h3>
              <p className="text-sm text-gray-600">日本語で丁寧にサポートいたします</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enterprise相談</h3>
              <p className="text-sm text-gray-600">カスタム導入のご相談も承ります</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
