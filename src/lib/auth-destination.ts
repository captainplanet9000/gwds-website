const destinations = new Set(['/account', '/account/hosting', '/account/instance', '/account/funding', '/checkout']);

/** Only return first-party customer destinations; never accept an external redirect. */
export function authDestination(requested: string | null | undefined): string {
  if (!requested || !requested.startsWith('/') || requested.startsWith('//') || /[\\\r\n]/.test(requested)) return '/account';
  try {
    const url = new URL(requested, 'https://www.civalsystems.com');
    return url.origin === 'https://www.civalsystems.com' && destinations.has(url.pathname)
      ? `${url.pathname}${url.search}${url.hash}` : '/account';
  } catch { return '/account'; }
}
