'use client';

import MetaPixel from './MetaPixel';
import RedditPixel from './RedditPixel';
import TikTokPixel from './TikTokPixel';
import TwitterPixel from './TwitterPixel';

/**
 * Unified Tracking Pixels Component
 * 
 * Loads all enabled tracking pixels based on environment variables:
 * - NEXT_PUBLIC_META_PIXEL_ID
 * - NEXT_PUBLIC_REDDIT_PIXEL_ID
 * - NEXT_PUBLIC_TIKTOK_PIXEL_ID
 * - NEXT_PUBLIC_TWITTER_PIXEL_ID
 * 
 * Only pixels with configured IDs will be loaded.
 */
export default function TrackingPixels() {
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const redditPixelId = process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID;
  const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const twitterPixelId = process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID;

  return (
    <>
      {metaPixelId && <MetaPixel />}
      {redditPixelId && <RedditPixel />}
      {tiktokPixelId && <TikTokPixel />}
      {twitterPixelId && <TwitterPixel />}
    </>
  );
}
