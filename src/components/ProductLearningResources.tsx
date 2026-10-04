import Link from 'next/link';
import { getProductGuide } from '@/lib/product-learning';

export default function ProductLearningResources({ productId }: { productId: string }) {
  const guide = getProductGuide(productId);
  if (!guide) return null;
  const base = `/docs/products/${productId}`;
  return <section aria-label={`${guide.title} documentation`} style={{ maxWidth: 1200, margin: '56px auto 0', padding: '0 28px' }}>
    <div className="card" style={{ padding: 'clamp(20px,4vw,36px)', border: '1px solid var(--color-divider)' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>DOCUMENTATION & TUTORIALS</p>
      <h2 style={{ fontSize: 'clamp(26px,3vw,34px)', margin: '12px 0', lineHeight: 1.2 }}>Learn to install and use {guide.title}</h2>
      <p style={{ maxWidth: 760, lineHeight: 1.7 }}>Version-specific installation, a guided practice exercise, {guide.kind === 'strategy' ? 'the exact default settings, ' : ''}troubleshooting and recovery checks. Available before purchase and from your account afterward.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
        <Link href={base} className="btn btn-primary">Read guide & watch lessons</Link>
        <a href={`${base}/guide.pdf`} className="btn btn-secondary" download>Download PDF manual</a>
        <Link href={`${base}#tutorial`} className="btn btn-secondary">Step-by-step tutorial</Link>
        <a href={`${base}/documentation.zip`} className="btn btn-secondary" download>Documentation pack</a>
      </div>
      <p style={{ fontSize: 12, marginTop: 20, overflowWrap: 'anywhere' }}>For release {guide.version} · Updated October 3, 2026. Supporting videos show the broader demo; installation instructions match the shipped source.</p>
    </div>
  </section>;
}
