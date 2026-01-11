/**
 * Google Analytics 4 コンポーネント
 * _app.tsxで読み込んでGA4を有効化
 */

import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { GA_MEASUREMENT_ID, pageview, isGAEnabled } from '@/lib/analytics';

export default function GoogleAnalytics() {
  const router = useRouter();

  useEffect(() => {
    if (!isGAEnabled()) return;

    // ページ遷移時にページビューを送信
    const handleRouteChange = (url: string) => {
      pageview(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // GA4が設定されていない場合は何も表示しない
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      {/* Google Tag Manager */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
    </>
  );
}
