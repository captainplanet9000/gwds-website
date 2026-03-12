/**
 * Meta Pixel Event Tracking Utilities
 * 
 * Helper functions for firing custom Meta Pixel events throughout the app.
 */

interface MetaPixelEvent {
  content_ids?: string[];
  content_type?: string;
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  num_items?: number;
  [key: string]: unknown;
}

/**
 * Fire a custom Meta Pixel event
 */
export function trackMetaEvent(
  eventName: string,
  params?: MetaPixelEvent
): void {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
}

/**
 * Track when a user adds an item to cart
 */
export function trackAddToCart(params: {
  productId: string;
  productName: string;
  value: number;
  currency?: string;
}): void {
  trackMetaEvent('AddToCart', {
    content_ids: [params.productId],
    content_name: params.productName,
    content_type: 'product',
    value: params.value,
    currency: params.currency || 'USD',
  });
}

/**
 * Track when checkout is initiated
 */
export function trackInitiateCheckout(params: {
  value: number;
  currency?: string;
  num_items?: number;
  content_ids?: string[];
}): void {
  trackMetaEvent('InitiateCheckout', {
    value: params.value,
    currency: params.currency || 'USD',
    num_items: params.num_items,
    content_ids: params.content_ids,
    content_type: 'product',
  });
}

/**
 * Track when a purchase is completed
 */
export function trackPurchase(params: {
  value: number;
  currency?: string;
  content_ids?: string[];
  num_items?: number;
  transactionId?: string;
}): void {
  trackMetaEvent('Purchase', {
    value: params.value,
    currency: params.currency || 'USD',
    content_ids: params.content_ids,
    content_type: 'product',
    num_items: params.num_items,
  });
}

/**
 * Track product page views
 */
export function trackViewContent(params: {
  productId: string;
  productName?: string;
  value?: number;
  currency?: string;
}): void {
  trackMetaEvent('ViewContent', {
    content_ids: [params.productId],
    content_name: params.productName,
    content_type: 'product',
    value: params.value,
    currency: params.currency || 'USD',
  });
}

/**
 * Track search events
 */
export function trackSearch(searchQuery: string): void {
  trackMetaEvent('Search', {
    search_string: searchQuery,
  });
}

/**
 * Track when user completes registration
 */
export function trackCompleteRegistration(): void {
  trackMetaEvent('CompleteRegistration');
}

/**
 * Track custom conversions
 */
export function trackCustomEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  trackMetaEvent(eventName, params);
}
