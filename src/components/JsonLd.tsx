export function OrganizationJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.civalsystems.com';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Cival Systems',
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    description: 'Trading workspace and strategy source-code templates for developers to inspect, test, and adapt.',
    sameAs: [
      'https://github.com/captainplanet9000',
      'https://discord.gg/EZk6gTx57k',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ProductJsonLd({ product }: { product: { name: string; id: string; description: string; price: number; emoji: string } }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.civalsystems.com';
  const salesEnabled = process.env.NEXT_PUBLIC_STORE_SALES_ENABLED === 'true';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    description: product.description,
    url: `${siteUrl}/store/${product.id}`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: salesEnabled ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    author: {
      '@type': 'Organization',
      name: 'Cival Systems',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
