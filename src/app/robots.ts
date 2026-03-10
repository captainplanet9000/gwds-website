import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/success', '/account/'],
      },
    ],
    sitemap: 'https://gwds-website.vercel.app/sitemap.xml',
  };
}
