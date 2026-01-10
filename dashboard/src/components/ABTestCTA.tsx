/**
 * A/Bテスト対応CTAボタン
 *
 * 複数のバリアントを切り替えて表示し、コンバージョンを追跡
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAssignment, trackClick, trackConversion } from '@/lib/abtest';

interface ABTestCTAProps {
  experimentId?: string;
  href: string;
  className?: string;
}

// CTAボタンのバリアント定義
const CTA_VARIANTS: Record<string, {
  text: string;
  subtext?: string;
  style: string;
}> = {
  'control': {
    text: '無料で始める',
    style: 'bg-white text-primary-600 hover:bg-primary-50',
  },
  'variant-a': {
    text: '今すぐ無料で試す',
    subtext: '30秒で登録完了',
    style: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700',
  },
  'variant-b': {
    text: '無料アカウントを作成',
    subtext: 'クレジットカード不要',
    style: 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50',
  },
};

export default function ABTestCTA({
  experimentId = 'cta-button',
  href,
  className = '',
}: ABTestCTAProps) {
  const [variant, setVariant] = useState<string>('control');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const assignedVariant = getAssignment(experimentId);
    setVariant(assignedVariant);
  }, [experimentId]);

  const handleClick = () => {
    trackClick(experimentId, 'cta-button');
  };

  const config = CTA_VARIANTS[variant] || CTA_VARIANTS['control'];

  // SSR時はデフォルト表示
  if (!mounted) {
    return (
      <Link
        href={href}
        className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg ${CTA_VARIANTS['control'].style} ${className}`}
      >
        {CTA_VARIANTS['control'].text}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg inline-block ${config.style} ${className}`}
    >
      <span className="block">{config.text}</span>
      {config.subtext && (
        <span className="block text-xs opacity-80 mt-1">{config.subtext}</span>
      )}
    </Link>
  );
}

/**
 * A/Bテスト対応ヒーロー見出し
 */
export function ABTestHeroHeadline() {
  const [variant, setVariant] = useState<string>('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const assignedVariant = getAssignment('hero-headline');
    setVariant(assignedVariant);
  }, []);

  const headlines: Record<string, { main: string; sub: string }> = {
    'default': {
      main: 'AIで見つける次の売れ筋商品',
      sub: 'Amazonのトレンドをリアルタイムで分析。急上昇商品をいち早くキャッチして、ビジネスチャンスを逃しません。',
    },
    'benefit-focused': {
      main: '仕入れ判断を10倍速く、精度を2倍に',
      sub: 'AIが24時間365日、Amazonの売れ筋を監視。あなたは結果を見るだけ。',
    },
    'urgency': {
      main: '今日見逃すと、明日の利益を逃す',
      sub: '急上昇商品は待ってくれません。AIがリアルタイムでトレンドをキャッチし、チャンスをお知らせします。',
    },
  };

  const content = headlines[variant] || headlines['default'];

  // SSR時はデフォルト表示
  if (!mounted) {
    return (
      <>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          {headlines['default'].main.split('次の').map((part, i) =>
            i === 0 ? (
              <span key={i}>{part}
                <br />
                <span className="bg-gradient-to-r from-primary-200 to-white bg-clip-text text-transparent">
                  次の売れ筋商品
                </span>
              </span>
            ) : null
          )}
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto leading-relaxed">
          {headlines['default'].sub}
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
        {content.main}
      </h1>
      <p className="text-lg md:text-xl lg:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto leading-relaxed">
        {content.sub}
      </p>
    </>
  );
}

/**
 * コンバージョン追跡ヘルパー
 */
export function useABTestConversion(experimentId: string) {
  return {
    trackConversion: (metadata?: Record<string, unknown>) => {
      trackConversion(experimentId, metadata);
    },
  };
}
