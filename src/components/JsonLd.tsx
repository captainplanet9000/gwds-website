export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Cival Systems',
    url: 'https://gwds-website.vercel.app',
    logo: 'https://gwds-website.vercel.app/images/logo.png',
    description: 'Trading infrastructure and autonomous agents, sold as source. An AI agent hedge fund starting point for Hyperliquid.',
    email: 'gammawavesdesign@gmail.com',
    sameAs: [
      'https://x.com/GWDSofficial',
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
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    description: product.description,
    url: `https://gwds-website.vercel.app/store/${product.id}`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
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
