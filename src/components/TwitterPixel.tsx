'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    twq?: (action: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

export default function TwitterPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pixelId = process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID;

  useEffect(() => {
    if (!pixelId) return;

    // Initialize Twitter Pixel
    const script = document.createElement('script');
    script.innerHTML = `
      !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
      },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
      a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
      twq('config','${pixelId}');
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [pixelId]);

  useEffect(() => {
    if (!pixelId || !window.twq) return;

    // Track PageView on route change
    window.twq('event', 'tw-' + pixelId + '-pageview', {});

    // Track ViewContent on product pages
    if (pathname?.startsWith('/store/') && pathname !== '/store') {
      window.twq('event', 'tw-' + pixelId + '-view_content', {
        content_type: 'product',
        content_id: pathname.split('/').pop(),
      });
    }
  }, [pathname, searchParams, pixelId]);

  return null;
}
