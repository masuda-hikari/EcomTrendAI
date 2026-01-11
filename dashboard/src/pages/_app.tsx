import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import GoogleAnalytics from '@/components/GoogleAnalytics';

export default function App({ Component, pageProps }: AppProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecomtrend.ai';

  // Service Worker登録（PWA対応）
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered:', registration.scope);
          })
          .catch((error) => {
            console.log('SW registration failed:', error);
          });
      });
    }
  }, []);

  return (
    <>
      <Head>
        {/* 基本メタタグ */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#4F46E5" />

        {/* 基本SEO */}
        <title>EcomTrendAI - AIによるEコマーストレンド分析サービス</title>
        <meta name="description" content="EcomTrendAIは、AIを活用してAmazon等のEコマースのトレンドを特定・分析。売れ筋商品や市場動向をリアルタイムで可視化し、ビジネスチャンスを逃しません。" />
        <meta name="keywords" content="Eコマース,トレンド分析,Amazon,売れ筋,ランキング,AI,マーケットリサーチ" />
        <meta name="author" content="EcomTrendAI" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="EcomTrendAI" />
        <meta property="og:title" content="EcomTrendAI - AIによるEコマーストレンド分析" />
        <meta property="og:description" content="AIを活用してEコマースのトレンドを分析。売れ筋商品や市場動向をリアルタイムで可視化。" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content={`${siteUrl}/og-image.png`} />
        <meta property="og:locale" content="ja_JP" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="EcomTrendAI - AIによるEコマーストレンド分析" />
        <meta name="twitter:description" content="AIを活用してEコマースのトレンドを分析。売れ筋商品や市場動向をリアルタイムで可視化。" />
        <meta name="twitter:image" content={`${siteUrl}/og-image.png`} />

        {/* Favicon & PWA */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EcomTrendAI" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* 構造化データ (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "EcomTrendAI",
              "description": "AIを活用したEコマーストレンド分析サービス",
              "url": siteUrl,
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "JPY",
                "lowPrice": "0",
                "highPrice": "4980",
                "offerCount": "3"
              },
              "provider": {
                "@type": "Organization",
                "name": "EcomTrendAI",
                "url": siteUrl
              }
            })
          }}
        />
      </Head>
      {/* スキップリンク（アクセシビリティ用） */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
      >
        メインコンテンツへスキップ
      </a>
      <GoogleAnalytics />
      <Component {...pageProps} />
    </>
  );
}
