'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'essential');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-orange-50/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:gap-6 gap-3">
        <p className="text-sm text-gray-700 flex-1">
          We use essential cookies to keep the site running smoothly. We may introduce
          personalised advertising in future — if we do, we&apos;ll ask for your permission first.
        </p>
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={handleAccept}
            className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-orange-700 transition-colors"
          >
            Got it
          </button>
          <Link
            href="/privacy"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Learn more
          </Link>
        </div>
      </div>
    </div>
  );
}
