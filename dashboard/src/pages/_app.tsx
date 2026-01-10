import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>EcomTrendAI - Eコマーストレンド分析</title>
        <meta name="description" content="AIを活用してEコマースのトレンドを特定・分析。売れ筋商品や市場動向を可視化します。" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
