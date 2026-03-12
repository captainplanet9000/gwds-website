'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    rdt?: (action: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

export default function RedditPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pixelId = process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID;

  useEffect(() => {
    if (!pixelId) return;

    // Initialize Reddit Pixel
    const script = document.createElement('script');
    script.innerHTML = `
      !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
      rdt('init', '${pixelId}', {"optOut":false,"useDecimalCurrencyValues":true});
      rdt('track', 'PageVisit');
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [pixelId]);

  useEffect(() => {
    if (!pixelId || !window.rdt) return;

    // Track PageVisit on route change
    window.rdt('track', 'PageVisit');

    // Track ViewContent on product pages
    if (pathname?.startsWith('/store/') && pathname !== '/store') {
      window.rdt('track', 'ViewContent', {
        itemCount: 1,
        products: [{
          id: pathname.split('/').pop(),
        }],
      });
    }
  }, [pathname, searchParams, pixelId]);

  return null;
}
