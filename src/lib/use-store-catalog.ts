'use client';
import { useEffect, useState } from 'react';

export function useStoreCatalog() {
  const [catalog, setCatalog] = useState<Record<string, { available: boolean; version: string | null }> | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/store/catalog', { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Unavailable');
        const result = await response.json();
        if (!Array.isArray(result.products)) throw new Error('Invalid catalog');
        setCatalog(Object.fromEntries(result.products.map((item: {id: string; available: boolean; version: string | null}) => [item.id, item])));
        setError(false);
      }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [attempt]);
  return { catalog, error, retry: () => { setError(false); setAttempt(value => value + 1); } };
}
