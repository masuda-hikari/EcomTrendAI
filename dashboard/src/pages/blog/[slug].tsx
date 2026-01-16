import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPostBySlug, getAllPosts, BlogPost } from '@/lib/blog';
import { trackPageView } from '@/lib/tracking';
import { useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';

interface BlogPostPageProps {
  post: BlogPost | null;
  relatedPosts: BlogPost[];
}

export default function BlogPostPage({ post, relatedPosts }: BlogPostPageProps) {
  const router = useRouter();

  useEffect(() => {
    if (post) {
      trackPageView(`/blog/${post.slug}`, { title: post.title });
    }
  }, [post]);

  // フォールバック表示
  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // 記事が見つからない場合
  if (!post) {
    return (
      <>
        <Head>
          <title>記事が見つかりません - EcomTrendAI</title>
        </Head>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                記事が見つかりません
              </h1>
              <p className="text-gray-600 mb-8">
                お探しの記事は存在しないか、削除された可能性があります。
              </p>
              <Link href="/blog" className="btn-primary">
                ブログ一覧へ戻る
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // Markdownをシンプルに変換（本番ではremark/rehypeを使用推奨）
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let listType: 'ul' | 'ol' | null = null;
    let inCodeBlock = false;
    let codeContent: string[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        if (listType === 'ol') {
          elements.push(
            <ol key={elements.length} className="list-decimal list-inside mb-4 space-y-2 text-gray-700">
              {currentList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={elements.length} className="list-disc list-inside mb-4 space-y-2 text-gray-700">
              {currentList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          );
        }
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      // コードブロック
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={elements.length} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm">
              <code>{codeContent.join('\n')}</code>
            </pre>
          );
          codeContent = [];
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      // 見出し
      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={elements.length} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            {line.slice(3)}
          </h2>
        );
        return;
      }

      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={elements.length} className="text-xl font-bold text-gray-900 mt-6 mb-3">
            {line.slice(4)}
          </h3>
        );
        return;
      }

      // 番号付きリスト
      const numberedMatch = line.match(/^\d+\.\s\*\*(.+?)\*\*\s*[-–]\s*(.+)$/);
      if (numberedMatch) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        currentList.push(`${numberedMatch[1]} - ${numberedMatch[2]}`);
        return;
      }

      const simpleNumberedMatch = line.match(/^\d+\.\s\*\*(.+?)\*\*(.*)$/);
      if (simpleNumberedMatch) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        currentList.push(`${simpleNumberedMatch[1]}${simpleNumberedMatch[2]}`);
        return;
      }

      // 箇条書き
      if (line.startsWith('- ')) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        currentList.push(line.slice(2).replace(/\*\*(.+?)\*\*/g, '$1'));
        return;
      }

      // 水平線
      if (line === '---') {
        flushList();
        elements.push(<hr key={elements.length} className="my-8 border-gray-200" />);
        return;
      }

      // 空行
      if (line.trim() === '') {
        flushList();
        return;
      }

      // 通常の段落
      flushList();
      const processedLine = line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-primary-600">$1</code>');
      elements.push(
        <p
          key={elements.length}
          className="text-gray-700 leading-relaxed mb-4"
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    });

    flushList();
    return elements;
  };

  return (
    <>
      <Head>
        <title>{post.title} - EcomTrendAI</title>
        <meta name="description" content={post.description} />
        <meta name="keywords" content={post.tags.join(',')} />
        <link rel="canonical" href={`https://ecomtrend.ai/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://ecomtrend.ai/blog/${post.slug}`} />
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:author" content={post.author.name} />
        <meta property="article:section" content={post.category} />
        {post.tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main className="flex-grow" role="main">
          {/* 記事ヘッダー */}
          <section className="bg-white border-b">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* パンくずリスト */}
              <nav className="text-sm mb-6" aria-label="パンくずリスト">
                <ol className="flex items-center space-x-2 text-gray-500">
                  <li>
                    <Link href="/" className="hover:text-primary-600">
                      ホーム
                    </Link>
                  </li>
                  <li>/</li>
                  <li>
                    <Link href="/blog" className="hover:text-primary-600">
                      ブログ
                    </Link>
                  </li>
                  <li>/</li>
                  <li className="text-gray-900 truncate max-w-[200px]">{post.title}</li>
                </ol>
              </nav>

              {/* カテゴリ */}
              <span className="inline-block bg-primary-100 text-primary-700 text-sm font-medium px-3 py-1 rounded mb-4">
                {post.category}
              </span>

              {/* タイトル */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>

              {/* メタ情報 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {post.author.name}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {post.readingTime}分で読めます
                </span>
              </div>
            </div>
          </section>

          {/* 記事本文 */}
          <article className="py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10">
                {/* 説明文 */}
                <p className="text-lg text-gray-600 mb-8 pb-8 border-b border-gray-100">
                  {post.description}
                </p>

                {/* 本文 */}
                <div className="prose prose-lg max-w-none">
                  {renderContent(post.content)}
                </div>

                {/* タグ */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-500">タグ:</span>
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* シェアボタン */}
              <div className="mt-8 flex items-center justify-center gap-4">
                <span className="text-sm text-gray-500">この記事をシェア:</span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://ecomtrend.ai/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Xでシェア"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://ecomtrend.ai/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Facebookでシェア"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(`https://ecomtrend.ai/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="LINEでシェア"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                </a>
              </div>
            </div>
          </article>

          {/* 関連記事 */}
          {relatedPosts.length > 0 && (
            <section className="py-12 bg-white">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">関連記事</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.slug}
                      href={`/blog/${relatedPost.slug}`}
                      className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-xs text-primary-600 font-medium">
                        {relatedPost.category}
                      </span>
                      <h3 className="text-gray-900 font-medium mt-1 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {relatedPost.readingTime}分で読めます
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CTA セクション */}
          <section className="bg-primary-50 py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                トレンド分析を今すぐ始めよう
              </h2>
              <p className="text-gray-600 mb-8">
                EcomTrendAIで、AIによるリアルタイムトレンド分析を体験してください。
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/demo" className="btn-secondary px-8 py-3">
                  無料デモを試す
                </Link>
                <Link href="/register" className="btn-primary px-8 py-3">
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

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllPosts();
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<BlogPostPageProps> = async ({ params }) => {
  const slug = params?.slug as string;
  const post = getPostBySlug(slug) || null;

  // 関連記事を取得（同じカテゴリの記事、最大2件）
  let relatedPosts: BlogPost[] = [];
  if (post) {
    const allPosts = getAllPosts();
    relatedPosts = allPosts
      .filter((p) => p.slug !== post.slug && p.category === post.category)
      .slice(0, 2);

    // 同じカテゴリの記事が少ない場合は、他の記事を追加
    if (relatedPosts.length < 2) {
      const otherPosts = allPosts
        .filter((p) => p.slug !== post.slug && !relatedPosts.includes(p))
        .slice(0, 2 - relatedPosts.length);
      relatedPosts = [...relatedPosts, ...otherPosts];
    }
  }

  return {
    props: {
      post,
      relatedPosts,
    },
    revalidate: 3600, // 1時間ごとに再生成
  };
};
