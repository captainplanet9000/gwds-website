import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { productGuides } from '@/lib/product-learning';
import styles from './learning.module.css';

export const metadata: Metadata = { title: 'Product manuals and tutorials | Cival Systems', description: 'Installation, configuration, practice tutorials and downloadable manuals for Core, Trader and all six Cival strategy add-ons.' };
export default function ProductLibrary() {
  return <div className="cival"><Navbar /><main className={styles.main}>
    <div className={styles.hero}><p className={styles.meta}>CIVAL SYSTEMS · PRODUCT LIBRARY</p><h1>Your product. Your guide.</h1><p>Choose the product you purchased. Each guide matches the registered September 28 source release and includes installation, a practice tutorial, troubleshooting and a downloadable PDF.</p><div className={styles.actions}><Link className="btn btn-secondary" href="/account">My purchases</Link><Link className="btn btn-secondary" href="/docs/setup">General setup & hosted dashboard</Link></div></div>
    <section className={styles.grid} aria-label="Product guides">{productGuides.map(guide => <article key={guide.id} className={styles.card}><p className={styles.meta}>{guide.kind === 'edition' ? 'DASHBOARD SOURCE' : 'STRATEGY ADD-ON'}</p><h2 style={{ fontSize: 27 }}>{guide.title}</h2><p>{guide.summary}</p><p className={styles.meta}>{guide.version}</p><div className={styles.actions}><Link href={`/docs/products/${guide.id}`} className="btn btn-primary">Open guide & tutorials</Link><a href={`/docs/products/${guide.id}/guide.pdf`} download className="btn btn-secondary">PDF manual</a></div></article>)}</section>
  </main><Footer /></div>;
}
