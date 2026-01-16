import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllPosts, getAllCategories, BlogPost } from '@/lib/blog';
import { trackPageView } from '@/lib/tracking';
import { useEffect, useState } from 'react';

export default function BlogIndex() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    trackPageView('/blog', { title: 'ブログ一覧' });
  }, []);

  const filteredPosts = selectedCategory
    ? posts.filter((post) => post.category === selectedCategory)
    : posts;

  return (
    <>
      <Head>
        <title>ブログ - EcomTrendAI | ECトレンド分析・EC事業ノウハウ</title>
        <meta
          name="description"
          content="Amazonトレンド分析、EC事業のデータ活用、商品リサーチのノウハウをお届け。AIを活用した最新のEC戦略を解説します。"
        />
        <meta name="keywords" content="EC,Amazon,トレンド分析,商品リサーチ,データ分析,需要予測" />
        <link rel="canonical" href="https://ecomtrend.ai/blog" />
        <meta property="og:title" content="ブログ - EcomTrendAI" />
        <meta
          property="og:description"
          content="Amazonトレンド分析、EC事業のデータ活用、商品リサーチのノウハウをお届け。"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ecomtrend.ai/blog" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main className="flex-grow" role="main">
          {/* ヒーローセクション */}
          <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                EcomTrendAI ブログ
              </h1>
              <p className="text-lg text-primary-100 max-w-2xl">
                Amazonトレンド分析、EC事業のデータ活用、商品リサーチのノウハウをお届けします。
                AIを活用した最新のEC戦略を解説。
              </p>
            </div>
          </section>

          {/* カテゴリフィルター */}
          <section className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500 mr-2">カテゴリ:</span>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategory === null
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  すべて
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 記事一覧 */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {filteredPosts.length === 0 ? (
                <p className="text-gray-500 text-center py-12">
                  該当する記事がありません
                </p>
              ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPosts.map((post) => (
                    <BlogCard key={post.slug} post={post} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* CTA セクション */}
          <section className="bg-primary-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                トレンド分析を今すぐ始めよう
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                EcomTrendAIで、AIによるリアルタイムトレンド分析を体験してください。
                14日間の無料トライアルで、すべての機能をお試しいただけます。
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/demo"
                  className="btn-secondary px-8 py-3 text-lg"
                >
                  無料デモを試す
                </Link>
                <Link
                  href="/register"
                  className="btn-primary px-8 py-3 text-lg"
                >
                  無料で始める
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

// ブログカードコンポーネント
function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* サムネイル（将来的に画像を追加） */}
      <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
        <div className="text-primary-600">
          <svg
            className="w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </div>

      <div className="p-6">
        {/* カテゴリ・読了時間 */}
        <div className="flex items-center gap-3 mb-3">
          <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded">
            {post.category}
          </span>
          <span className="text-gray-400 text-sm flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {post.readingTime}分
          </span>
        </div>

        {/* タイトル */}
        <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-primary-600 transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        {/* 説明 */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {post.description}
        </p>

        {/* メタ情報 */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{post.author.name}</span>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
      </div>
    </article>
  );
}
