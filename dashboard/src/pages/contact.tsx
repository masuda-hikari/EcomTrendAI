import { useState, FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    // TODO: 実際のバックエンドAPI実装時に置き換え
    // 現在はデモ用の模擬送信
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
        </div>
      </main>

      <Footer />
    </>
  );
}
