'use client';
import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

export function useViewport() {
  const [bp, setBp] = useState<Breakpoint>('desktop');
  const [width, setWidth] = useState(0);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      setWidth(w);
      if (w < 640) setBp('mobile');
      else if (w < 1024) setBp('tablet');
      else if (w < 1440) setBp('desktop');
      else setBp('wide');
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return {
    bp,
    width,
    isMobile: bp === 'mobile',
    isTablet: bp === 'tablet',
    isDesktop: bp === 'desktop',
    isWide: bp === 'wide',
  };
}
