# Tracking Pixels Integration Guide

## Overview

Comprehensive tracking pixel integration for Meta (Facebook), Reddit, TikTok, and Twitter/X. All pixels are client-side components that load dynamically based on environment variables.

## Environment Variables

Add these to your `.env.local` and Vercel environment variables:

```bash
NEXT_PUBLIC_META_PIXEL_ID=your-meta-pixel-id
NEXT_PUBLIC_REDDIT_PIXEL_ID=your-reddit-pixel-id
NEXT_PUBLIC_TIKTOK_PIXEL_ID=your-tiktok-pixel-id
NEXT_PUBLIC_TWITTER_PIXEL_ID=your-twitter-pixel-id
```

**Note:** Pixels only load if their env var is set. Leave blank to disable a specific pixel.

## What's Already Integrated

The `<TrackingPixels />` component is already added to `src/app/layout.tsx` and handles:

### Automatic Events
- **PageView** — Fires on every route change
- **ViewContent** — Fires automatically on product pages (`/store/[id]`)

## Manual Event Tracking

For cart, checkout, and purchase events, use the unified tracking library:

### 1. When User Adds to Cart

```typescript
import { trackAddToCart } from '@/lib/tracking';

// In your add-to-cart handler
trackAddToCart({
  productId: product.id,
  productName: product.name,
  value: product.price,
  currency: 'USD', // optional, defaults to USD
});
```

### 2. When Checkout Starts

```typescript
import { trackInitiateCheckout } from '@/lib/tracking';

// When user clicks "Checkout"
trackInitiateCheckout({
  value: cartTotal,
  num_items: cartItems.length,
  content_ids: cartItems.map(item => item.id),
  currency: 'USD', // optional
});
```

### 3. After Successful Purchase

```typescript
import { trackPurchase } from '@/lib/tracking';

// On the success page after Stripe checkout
trackPurchase({
  value: orderTotal,
  content_ids: orderItems.map(item => item.id),
  num_items: orderItems.length,
  transactionId: orderId, // optional but recommended
  currency: 'USD', // optional
});
```

### 4. Search Events

```typescript
import { trackSearch } from '@/lib/tracking';

// When user performs a search
trackSearch('AI trading dashboard');
```

## Platform-Specific Tracking

If you need to fire events to a single platform only:

```typescript
// Meta only
import { trackAddToCart } from '@/lib/meta-pixel';
trackAddToCart({ productId: '123', productName: 'Dashboard', value: 99 });

// Reddit only
import { trackRedditPurchase } from '@/lib/reddit-pixel';
trackRedditPurchase({ value: 99, transactionId: 'order_123' });

// TikTok only
import { trackTikTokViewContent } from '@/lib/tiktok-pixel';
trackTikTokViewContent({ productId: '123', value: 99 });

// Twitter only
import { trackTwitterSearch } from '@/lib/twitter-pixel';
trackTwitterSearch('trading agents');
```

## Files Created

### Components (Client-Side)
- `src/components/MetaPixel.tsx` — Meta/Facebook pixel loader
- `src/components/RedditPixel.tsx` — Reddit pixel loader
- `src/components/TikTokPixel.tsx` — TikTok pixel loader
- `src/components/TwitterPixel.tsx` — Twitter/X pixel loader
- `src/components/TrackingPixels.tsx` — Unified loader (already in layout)

### Helper Libraries
- `src/lib/meta-pixel.ts` — Meta event tracking functions
- `src/lib/reddit-pixel.ts` — Reddit event tracking functions
- `src/lib/tiktok-pixel.ts` — TikTok event tracking functions
- `src/lib/twitter-pixel.ts` — Twitter event tracking functions
- `src/lib/tracking.ts` — **Unified API** (fire to all platforms at once)

## Implementation Checklist

- [x] Create pixel components
- [x] Integrate into root layout
- [x] Automatic PageView tracking
- [x] Automatic ViewContent on product pages
- [ ] Add `trackAddToCart()` to cart button handlers
- [ ] Add `trackInitiateCheckout()` to checkout flow
- [ ] Add `trackPurchase()` to success page
- [ ] (Optional) Add `trackSearch()` to search functionality
- [ ] Configure pixel IDs in Vercel environment variables
- [ ] Test in production with browser devtools Network tab

## Testing

1. **Local Development:**
   - Add pixel IDs to `.env.local`
   - Open browser DevTools → Network tab
   - Look for requests to `facebook.com/tr`, `redditstatic.com`, `analytics.tiktok.com`, `ads-twitter.com`

2. **Production:**
   - Add env vars in Vercel project settings
   - Deploy and test
   - Use each platform's pixel helper browser extension:
     - Meta Pixel Helper (Chrome)
     - Reddit Pixel Helper
     - TikTok Pixel Helper
     - Twitter Pixel Helper

## Debugging

If pixels aren't firing:
1. Check env vars are set (must start with `NEXT_PUBLIC_`)
2. Check browser console for errors
3. Verify scripts loaded in Network tab
4. Check `window.fbq`, `window.rdt`, `window.ttq`, `window.twq` exist in console
5. Use platform-specific pixel helper extensions

## Support

All pixels use inline styles (no external component library imports) as per Anthony's preference. Each pixel component is self-contained and will gracefully no-op if its env var isn't set.

---

**Branch:** `feat/tracking-pixels`  
**Commit:** `3f5aeee` — "feat: Add comprehensive tracking pixel integration"
