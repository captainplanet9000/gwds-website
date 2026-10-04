import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getProductGuide, productGuides, tutorialTitles } from '@/lib/product-learning';
import styles from '../learning.module.css';

export const dynamicParams = false;
export function generateStaticParams() { return productGuides.map(({ id }) => ({ id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const guide = getProductGuide((await params).id);
  return guide ? { title: `${guide.title} manual & tutorials | Cival Systems`, description: guide.summary, alternates: { canonical: `/docs/products/${guide.id}` } } : {};
}
export default async function ProductGuide({ params }: { params: Promise<{ id: string }> }) {
  const guide = getProductGuide((await params).id);
  if (!guide) notFound();
  const base = `/docs/products/${guide.id}`;
  return <div className="cival"><Navbar /><main className={styles.main}>
    <Link href="/docs/products">← All product guides</Link>
    <header className={styles.hero} style={{ marginTop: 24 }}><p className={styles.meta}>PRODUCT MANUAL · OCTOBER 3, 2026</p><h1>{guide.title}</h1><p>{guide.summary}</p><p className={styles.meta}>Release {guide.version}</p><div className={styles.actions}><a className="btn btn-primary" download href={`${base}/guide.pdf`}>Download PDF</a><a className="btn btn-secondary" download href={`${base}/guide.md`}>Markdown manual</a><a className="btn btn-secondary" download href={`${base}/tutorial.md`}>Practice tutorial</a><a className="btn btn-secondary" download href={`${base}/acceptance-checklist.md`}>Acceptance checklist</a><a className="btn btn-secondary" download href={`${base}/documentation.zip`}>Documentation pack</a></div><nav aria-label="Guide contents" className={styles.actions}>{[['requirements','Requirements'],['installation','Install'],['tutorial','Practice tutorial'],['videos','Video lessons'],['troubleshooting','Troubleshooting']].map(([id,label]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav></header>
    <section><h2>What this guide covers</h2><p>{guide.limits}</p><p>{guide.focus}</p></section>
    <section id="requirements"><h2>Before you start</h2><ul>{guide.requirements.map(text => <li key={text}>{text}</li>)}</ul></section>
    <section><h2>Purchase and download</h2><ol>{guide.access.map(text => <li key={text}>{text}</li>)}</ol><p className={styles.meta}>Expected archive SHA-256:<br />{guide.sha256}</p><p>Windows: <code>Get-FileHash .\your-download.zip -Algorithm SHA256</code>. Linux: <code>sha256sum your-download.zip</code>. macOS: <code>shasum -a 256 your-download.zip</code>.</p></section>
    <section id="installation"><h2>Install {guide.title}</h2><ol>{guide.install.map(text => <li key={text}>{text}</li>)}</ol><h3>Commands from the dashboard root</h3><pre className={styles.code}><code>{guide.commands}</code></pre></section>
    {guide.how && <section id="configuration"><h2>How the strategy works</h2><p>{guide.how}</p><p className={styles.meta}>Strategy ID: {guide.strategyId} · Path: {guide.installPath} · Intervals: {guide.timeframes?.join(', ')}</p><h3>Exact shipped defaults</h3><p>These defaults are a starting point for comparison, not recommended trading parameters or a loss limit. Candle counts depend on the interval. Refer to the shipped source for validation rules before changing them.</p><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th scope="col">Setting</th><th scope="col">Default</th><th scope="col">Meaning</th></tr></thead><tbody>{guide.settings.map(setting => <tr key={setting.key}><th scope="row">{setting.key}</th><td><code>{JSON.stringify(setting.value)}</code></td><td>{setting.description}</td></tr>)}</tbody></table></div><p><a download href={`${base}/default-config.json`}>Download default configuration JSON</a></p></section>}
    <section id="tutorial"><h2>Step-by-step practice tutorial</h2><p>Work in an isolated paper or research environment. The exercise teaches installation and signal interpretation; it does not send an order.</p><div className={styles.grid}>{guide.tutorial.map(([title,body],index) => <article className={styles.card} key={title}><p className={styles.meta}>STEP {index+1}</p><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section id="videos"><h2>Supporting video lessons</h2><p>Narrated, captioned lessons showing the broader demo dashboard. Some screens and hosted workflows differ from the purchased source edition. Use this product’s written installation and practice tutorial for the exact release.</p><div className={styles.grid}>{guide.videos.map(id => <article className={styles.card} key={id}><h3>{tutorialTitles[id]}</h3><video className={styles.video} controls playsInline preload="none" poster={`/tutorials/${id}.png`} aria-label={tutorialTitles[id]}><source src={`/tutorials/${id}.mp4`} type="video/mp4" /><track kind="captions" src={`/tutorials/${id}.vtt`} srcLang="en" label="English" default />Your browser does not support video.</video><p><a href={`/tutorials/${id}.mp4`} download>Download video</a> · <a href={`/tutorials/${id}.vtt`} download>Captions</a></p></article>)}</div></section>
    <section><h2>Record your acceptance checks</h2>{guide.acceptance.map(text => <div key={text} className={styles.check}>□ {text}</div>)}<p>{guide.inspect}</p></section>
    <section><h2>Maintain, update and customize</h2><ul>{guide.operations.map(text => <li key={text}>{text}</li>)}</ul></section>
    <section id="troubleshooting"><h2>Troubleshooting</h2>{guide.troubleshooting.map(([title,body]) => <details key={title}><summary>{title}</summary><p>{body}</p></details>)}</section>
    <section><h2>Related product guides</h2><div className={styles.actions}>{guide.related.map(id => <Link className="btn btn-secondary" key={id} href={`/docs/products/${id}`}>{getProductGuide(id)?.title}</Link>)}</div></section>
    <section className={styles.card}><h2>Get installation help</h2><p>Include your order reference, product/version, operating system, Node version, failed step and a redacted error. Never send environment files, passwords, private keys or seed phrases.</p><div className={styles.actions}><Link href="/contact" className="btn btn-primary">Contact support</Link><Link href="/account" className="btn btn-secondary">My purchases</Link><Link href="/refund-request" className="btn btn-secondary">Request a refund</Link><Link href={`/store/${guide.id}`} className="btn btn-secondary">Product page</Link></div><p className={styles.meta}>Source references: {guide.files.join(', ')}</p></section>
  </main><Footer /></div>;
}
