/**
 * Twitter/X Pixel Event Tracking Utilities
 * 
 * Helper functions for firing custom Twitter Pixel events throughout the app.
 */

interface TwitterPixelEvent {
  content_id?: string;
  content_type?: string;
  content_name?: string;
  value?: string | number;
  currency?: string;
  num_items?: number;
  [key: string]: unknown;
}

/**
 * Fire a custom Twitter Pixel event
 */
export function trackTwitterEvent(
  eventName: string,
  params?: TwitterPixelEvent
): void {
  if (typeof window !== 'undefined' && window.twq) {
    const pixelId = process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID;
    if (pixelId) {
      window.twq('event', `tw-${pixelId}-${eventName}`, params);
    }
  }
}

/**
 * Track when a user adds an item to cart
 */
export function trackTwitterAddToCart(params: {
  productId: string;
  productName?: string;
  value: number;
  currency?: string;
}): void {
  trackTwitterEvent('add_to_cart', {
    content_id: params.productId,
    content_name: params.productName,
    content_type: 'product',
    value: params.value.toString(),
    currency: params.currency || 'USD',
    num_items: 1,
  });
}

/**
 * Track when checkout is initiated
 */
export function trackTwitterInitiateCheckout(params: {
  value: number;
  currency?: string;
  num_items?: number;
}): void {
  trackTwitterEvent('initiate_checkout', {
    value: params.value.toString(),
    currency: params.currency || 'USD',
    num_items: params.num_items,
    content_type: 'product',
  });
}

/**
 * Track when a purchase is completed
 */
export function trackTwitterPurchase(params: {
  value: number;
  currency?: string;
  num_items?: number;
  content_ids?: string[];
}): void {
  trackTwitterEvent('purchase', {
    value: params.value.toString(),
    currency: params.currency || 'USD',
    num_items: params.num_items,
    content_ids: params.content_ids,
    content_type: 'product',
  });
}

/**
 * Track product page views
 */
export function trackTwitterViewContent(params: {
  productId: string;
  productName?: string;
  value?: number;
  currency?: string;
}): void {
  trackTwitterEvent('view_content', {
    content_id: params.productId,
    content_name: params.productName,
    content_type: 'product',
    value: params.value?.toString(),
    currency: params.currency || 'USD',
  });
}

/**
 * Track search events
 */
export function trackTwitterSearch(searchQuery: string): void {
  trackTwitterEvent('search', {
    search_string: searchQuery,
  });
}

/**
 * Track when user completes registration
 */
export function trackTwitterCompleteRegistration(): void {
  trackTwitterEvent('sign_up');
}

/**
 * Track custom conversions
 */
export function trackTwitterCustomEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  trackTwitterEvent(eventName, params);
}
