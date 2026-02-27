'use client';

import { useEffect } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'banner' | 'vertical';
  className?: string;
}

export default function AdUnit({
  slot,
  format = 'auto',
  className = '',
}: AdUnitProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      if (window.adsbygoogle && process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  // Don't render if no AdSense client is configured
  if (!process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT) {
    return (
      <div className={`bg-gray-100 border border-gray-300 rounded-lg p-4 text-center ${className}`}>
        <p className="text-xs text-gray-500">[Ad Placement]</p>
      </div>
    );
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
