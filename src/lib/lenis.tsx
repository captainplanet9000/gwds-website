'use client';
import { createContext, useContext, useEffect, useRef } from 'react';
import Lenis from 'lenis';

const LenisContext = createContext<Lenis | null>(null);

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Lenis owns scroll position entirely once mounted: the browser's native jump-to-#hash
    // behavior (on first load with a hash in the URL, and on every in-page `<a href="#x">` /
    // `<Link href="#x">` click) gets silently overridden on the very next animation frame,
    // because Lenis's own render loop keeps applying ITS last known position regardless of what
    // the browser just scrolled to. Nothing about this page's own logic was wrong — no handler
    // anywhere ever drove Lenis itself to the target, so every same-page anchor link on the site
    // (not just this one button) has been a silent no-op since Lenis was added.
    //
    // Fixed once, globally, by intercepting same-page hash clicks and calling lenis.scrollTo()
    // directly, rather than patching every individual link. The target element can be missing at
    // the exact moment of the click (e.g. #wallet is mounted by a client-only dynamic import that
    // hasn't resolved yet) or not present until this component's own effect has run, so this
    // retries briefly instead of giving up on the first miss.
    function scrollToId(id: string, attempt = 0): boolean {
      const el = document.getElementById(id);
      if (el) {
        lenis.scrollTo(el, { offset: 0 });
        return true;
      }
      if (attempt < 20) setTimeout(() => scrollToId(id, attempt + 1), 100);
      return false;
    }

    function onDocumentClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.pathname !== window.location.pathname || url.search !== window.location.search || !url.hash) return;
      const id = url.hash.slice(1);
      if (!id) return;
      e.preventDefault();
      history.pushState(null, '', url.hash);
      scrollToId(id);
    }
    document.addEventListener('click', onDocumentClick);

    // A direct/bookmarked/shared link to a hash (e.g. .../account/hosting#wallet) needs the same
    // treatment on first load, once the target has had a chance to mount.
    if (window.location.hash) scrollToId(window.location.hash.slice(1));

    return () => {
      document.removeEventListener('click', onDocumentClick);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <LenisContext.Provider value={lenisRef.current}>{children}</LenisContext.Provider>;
}

export const useLenis = () => useContext(LenisContext);
