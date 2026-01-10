/**
 * OGP画像生成API
 * ソーシャルシェア時の画像を動的に生成
 */
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // パラメータ取得
  const title = searchParams.get('title') || 'EcomTrendAI';
  const subtitle = searchParams.get('subtitle') || 'AIによるEコマーストレンド分析';
  const type = searchParams.get('type') || 'default'; // default, report, pricing

  // 背景スタイルを選択
  const getBgGradient = () => {
    switch (type) {
      case 'report':
        return 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)';
      case 'pricing':
        return 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)';
      default:
        return 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)';
    }
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: getBgGradient(),
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* 背景装飾 */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-15%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        />

        {/* ロゴ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              fontWeight: 'bold',
              color: '#7c3aed',
            }}
          >
            ET
          </div>
          <span
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            EcomTrendAI
          </span>
        </div>

        {/* タイトル */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.2,
            marginBottom: '24px',
          }}
        >
          {title}
        </div>

        {/* サブタイトル */}
        <div
          style={{
            fontSize: '32px',
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          {subtitle}
        </div>

        {/* 特徴バッジ */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '48px',
          }}
        >
          {['トレンド分析', 'リアルタイム更新', 'API提供'].map((badge, i) => (
            <div
              key={i}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '999px',
                fontSize: '24px',
                color: 'white',
              }}
            >
              {badge}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
