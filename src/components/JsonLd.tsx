export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Gamma Waves Design Studio',
    url: 'https://gwds-website.vercel.app',
    logo: 'https://gwds-website.vercel.app/images/logo.png',
    description: 'AI-powered trading tools, dashboard templates, and algorithmic trading agents.',
    email: 'gammawavesdesign@gmail.com',
    sameAs: [
      'https://twitter.com/gwds_studio',
      'https://github.com/captainplanet9000',
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
      name: 'Gamma Waves Design Studio',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
