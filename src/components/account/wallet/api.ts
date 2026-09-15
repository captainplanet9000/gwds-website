// Authenticated JSON calls to the /api/account/funding routes. Every route takes the Supabase
// access token as a Bearer header and answers {error, code} on failure.

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code: string | null) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function requestJson<T>(
  url: string,
  accessToken: string,
  init?: { method?: 'GET' | 'POST'; body?: unknown },
): Promise<T> {
  const hasBody = init?.body !== undefined;
  const response = await fetch(url, {
    method: init?.method ?? (hasBody ? 'POST' : 'GET'),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    },
    body: hasBody ? JSON.stringify(init?.body) : undefined,
    cache: 'no-store',
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body) {
    throw new ApiError(
      body?.error || `The request failed (${response.status}). Please try again.`,
      response.status,
      typeof body?.code === 'string' ? body.code : null,
    );
  }
  return body as T;
}
