/**
 * TikTok Pixel Event Tracking Utilities
 * 
 * Helper functions for firing custom TikTok Pixel events throughout the app.
 */

interface TikTokPixelEvent {
  content_id?: string;
  content_type?: string;
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  quantity?: number;
  contents?: Array<{ content_id: string; content_name?: string }>;
  [key: string]: unknown;
}

/**
 * Fire a custom TikTok Pixel event
 */
export function trackTikTokEvent(
  eventName: string,
  params?: TikTokPixelEvent
): void {
  if (typeof window !== 'undefined' && window.ttq) {
    window.ttq.track(eventName, params);
  }
}

/**
 * Track when a user adds an item to cart
 */
export function trackTikTokAddToCart(params: {
  productId: string;
  productName?: string;
  value: number;
  currency?: string;
}): void {
  trackTikTokEvent('AddToCart', {
    content_id: params.productId,
    content_name: params.productName,
    content_type: 'product',
    value: params.value,
    currency: params.currency || 'USD',
    quantity: 1,
  });
}

/**
 * Track when checkout is initiated
 */
export function trackTikTokInitiateCheckout(params: {
  value: number;
  currency?: string;
  contents?: Array<{ content_id: string; content_name?: string }>;
}): void {
  trackTikTokEvent('InitiateCheckout', {
    value: params.value,
    currency: params.currency || 'USD',
    contents: params.contents,
    content_type: 'product',
  });
}

/**
 * Track when a purchase is completed
 */
export function trackTikTokPurchase(params: {
  value: number;
  currency?: string;
  contents?: Array<{ content_id: string; content_name?: string }>;
}): void {
  trackTikTokEvent('CompletePayment', {
    value: params.value,
    currency: params.currency || 'USD',
    contents: params.contents,
    content_type: 'product',
  });
}

/**
 * Track product page views
 */
export function trackTikTokViewContent(params: {
  productId: string;
  productName?: string;
  value?: number;
  currency?: string;
}): void {
  trackTikTokEvent('ViewContent', {
    content_id: params.productId,
    content_name: params.productName,
    content_type: 'product',
    value: params.value,
    currency: params.currency || 'USD',
  });
}

/**
 * Track search events
 */
export function trackTikTokSearch(searchQuery: string): void {
  trackTikTokEvent('Search', {
    query: searchQuery,
  });
}

/**
 * Track when user completes registration
 */
export function trackTikTokCompleteRegistration(): void {
  trackTikTokEvent('CompleteRegistration');
}

/**
 * Track custom conversions
 */
export function trackTikTokCustomEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  trackTikTokEvent(eventName, params);
}
