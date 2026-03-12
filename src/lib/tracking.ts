/**
 * Unified Tracking Library
 * 
 * Central hub for firing tracking events across all platforms.
 * Import this file and use the consolidated functions to track events
 * on all enabled pixels simultaneously.
 */

import { trackAddToCart as metaAddToCart, trackInitiateCheckout as metaInitiateCheckout, trackPurchase as metaPurchase, trackViewContent as metaViewContent, trackSearch as metaSearch } from './meta-pixel';
import { trackRedditAddToCart, trackRedditPurchase, trackRedditViewContent, trackRedditSearch } from './reddit-pixel';
import { trackTikTokAddToCart, trackTikTokInitiateCheckout, trackTikTokPurchase, trackTikTokViewContent, trackTikTokSearch } from './tiktok-pixel';
import { trackTwitterAddToCart, trackTwitterInitiateCheckout, trackTwitterPurchase, trackTwitterViewContent, trackTwitterSearch } from './twitter-pixel';

/**
 * Track AddToCart event across all enabled pixels
 */
export function trackAddToCart(params: {
  productId: string;
  productName: string;
  value: number;
  currency?: string;
}): void {
  metaAddToCart(params);
  trackRedditAddToCart(params);
  trackTikTokAddToCart(params);
  trackTwitterAddToCart(params);
}

/**
 * Track InitiateCheckout event across all enabled pixels
 */
export function trackInitiateCheckout(params: {
  value: number;
  currency?: string;
  num_items?: number;
  content_ids?: string[];
}): void {
  metaInitiateCheckout(params);
  trackTikTokInitiateCheckout({
    value: params.value,
    currency: params.currency,
    contents: params.content_ids?.map(id => ({ content_id: id })),
  });
  trackTwitterInitiateCheckout(params);
}

/**
 * Track Purchase event across all enabled pixels
 */
export function trackPurchase(params: {
  value: number;
  currency?: string;
  content_ids?: string[];
  num_items?: number;
  transactionId?: string;
}): void {
  metaPurchase(params);
  trackRedditPurchase({
    value: params.value,
    currency: params.currency,
    transactionId: params.transactionId,
    products: params.content_ids?.map(id => ({ id })),
  });
  trackTikTokPurchase({
    value: params.value,
    currency: params.currency,
    contents: params.content_ids?.map(id => ({ content_id: id })),
  });
  trackTwitterPurchase(params);
}

/**
 * Track ViewContent event across all enabled pixels
 */
export function trackViewContent(params: {
  productId: string;
  productName?: string;
  value?: number;
  currency?: string;
}): void {
  metaViewContent(params);
  trackRedditViewContent(params);
  trackTikTokViewContent(params);
  trackTwitterViewContent(params);
}

/**
 * Track Search event across all enabled pixels
 */
export function trackSearch(searchQuery: string): void {
  metaSearch(searchQuery);
  trackRedditSearch(searchQuery);
  trackTikTokSearch(searchQuery);
  trackTwitterSearch(searchQuery);
}

/**
 * Example usage in your components:
 * 
 * // In a product page
 * import { trackViewContent } from '@/lib/tracking';
 * trackViewContent({
 *   productId: product.id,
 *   productName: product.name,
 *   value: product.price,
 * });
 * 
 * // When adding to cart
 * import { trackAddToCart } from '@/lib/tracking';
 * trackAddToCart({
 *   productId: product.id,
 *   productName: product.name,
 *   value: product.price,
 * });
 * 
 * // When initiating checkout
 * import { trackInitiateCheckout } from '@/lib/tracking';
 * trackInitiateCheckout({
 *   value: cartTotal,
 *   num_items: cartItems.length,
 *   content_ids: cartItems.map(item => item.id),
 * });
 * 
 * // After successful purchase
 * import { trackPurchase } from '@/lib/tracking';
 * trackPurchase({
 *   value: orderTotal,
 *   content_ids: orderItems.map(item => item.id),
 *   num_items: orderItems.length,
 *   transactionId: orderId,
 * });
 */
