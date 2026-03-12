/**
 * Reddit Pixel Event Tracking Utilities
 * 
 * Helper functions for firing custom Reddit Pixel events throughout the app.
 */

interface RedditPixelEvent {
  itemCount?: number;
  products?: Array<{ id: string; category?: string }>;
  value?: number;
  currency?: string;
  transactionId?: string;
  [key: string]: unknown;
}

/**
 * Fire a custom Reddit Pixel event
 */
export function trackRedditEvent(
  eventName: string,
  params?: RedditPixelEvent
): void {
  if (typeof window !== 'undefined' && window.rdt) {
    window.rdt('track', eventName, params);
  }
}

/**
 * Track when a user adds an item to cart
 */
export function trackRedditAddToCart(params: {
  productId: string;
  value?: number;
  currency?: string;
}): void {
  trackRedditEvent('AddToCart', {
    itemCount: 1,
    products: [{ id: params.productId }],
    value: params.value,
    currency: params.currency || 'USD',
  });
}

/**
 * Track when a purchase is completed
 */
export function trackRedditPurchase(params: {
  value: number;
  currency?: string;
  transactionId?: string;
  products?: Array<{ id: string }>;
}): void {
  trackRedditEvent('Purchase', {
    value: params.value,
    currency: params.currency || 'USD',
    transactionId: params.transactionId,
    itemCount: params.products?.length || 0,
    products: params.products,
  });
}

/**
 * Track product page views
 */
export function trackRedditViewContent(params: {
  productId: string;
  value?: number;
  currency?: string;
}): void {
  trackRedditEvent('ViewContent', {
    itemCount: 1,
    products: [{ id: params.productId }],
    value: params.value,
    currency: params.currency || 'USD',
  });
}

/**
 * Track search events
 */
export function trackRedditSearch(searchQuery: string): void {
  trackRedditEvent('Search', {
    searchString: searchQuery,
  });
}

/**
 * Track when user signs up
 */
export function trackRedditSignUp(): void {
  trackRedditEvent('SignUp');
}

/**
 * Track custom conversions
 */
export function trackRedditCustomEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  trackRedditEvent(eventName, params);
}
