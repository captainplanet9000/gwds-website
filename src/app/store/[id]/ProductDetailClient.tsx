'use client';
import { useState } from 'react';
import Link from 'next/link';
import ProductGallery from '@/components/ProductGallery';
import { productMedia } from '@/lib/product-media';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductVideo from '@/components/ProductVideo';
import RequiresDashboardBanner from '@/components/RequiresDashboardBanner';
import { useCart } from '@/contexts/CartContext';
import { EDITION_INCLUDES, type Product } from '@/lib/products';
import { useStoreCatalog } from '@/lib/use-store-catalog';

function money(n: number) {
  return '$' + n.toLocaleString('en-US');
}

export default function ProductDetailClient({ product, related }: { product: Product; related: Product[] }) {
  const isAgent = product.productType === "agent";
  const isTrader = product.id === "multi-strat-bundle";
  const isCore = product.id === "trading-dashboard-template";
  const { items, dispatch } = useCart();
  const { catalog, error: catalogError, retry } = useStoreCatalog();
  const purchasable = !!catalog?.[product.id]?.available;
  const [added, setAdded] = useState(false);
  const coveredBy = (() => {
    for (const line of items) {
      const inc = EDITION_INCLUDES[line.product.id];
      if (inc && inc.includes(product.id)) return line.product.name;
    }
    return null;
  })();

  const addToCart = () => {
    if (!purchasable) return;
    dispatch({ type: 'ADD_ITEM', product });
    dispatch({ type: 'OPEN_CART' });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    if (!purchasable) return;
    dispatch({ type: 'CLEAR_CART' });
    dispatch({ type: 'ADD_ITEM', product });
  };

  const tagClass = product.productType === 'flagship' || product.productType === 'bundle' ? 'tag-accent' : product.productType === 'extension' ? 'tag-accent-2' : 'tag-neutral';

  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 28px 0', fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-neutral-600)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/store" style={{ color: 'var(--color-accent-700)', textDecoration: 'none' }}>Store</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text)' }}>{product.name}</span>
        </div>

        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 28px 0' }}>
          <div data-cv-2col style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,0.85fr)', gap: 48, alignItems: 'start' }}>
            {productMedia[product.id] ? <ProductGallery images={productMedia[product.id]} name={product.name} /> : <div>{product.image && <img src={product.image} alt={product.name} style={{width:'100%',borderRadius:14}} />}</div>}

            <div>
              <p style={{fontSize:12,lineHeight:1.5,color:'var(--color-neutral-700)'}}>{isCore ? "Preview images show the demo and hosted dashboards. Some features shown are not included in Core; see the contents below." : "Screens show the broader demo and hosted editions. Check the included features below for this download."}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                <span className={`tag ${tagClass}`}>{product.badge || product.productType}</span>
                {product.requiresDashboard && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>Add-on · needs an edition</span>}
              </div>
              <h1 style={{ fontSize: 'clamp(31px,3.4vw,44px)', lineHeight: 1.1, letterSpacing: '-0.015em', margin: '0 0 16px' }}>{product.name}</h1>
              <p style={{ fontSize: 16.5, lineHeight: 1.6, color: 'var(--color-neutral-800)', margin: '0 0 24px' }}>{product.description}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 22 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em' }}>{money(product.price)}</span>
                {product.wasPrice && <span style={{ fontSize: 14, color: 'var(--color-neutral-600)', textDecoration: 'line-through', fontFamily: 'var(--font-mono)' }}>{money(product.wasPrice)}</span>}
                <span style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>one-time product license</span>
              </div>

              {product.requiresDashboard && <RequiresDashboardBanner includedInCore={product.id === "darvas-indicator"} />}
              {product.isBundle && (
                <div style={{ background: 'var(--color-accent-2-100)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>✅</span>
                  <span style={{ color: 'var(--color-accent-2-800)', fontSize: 14, fontWeight: 600 }}>Includes Core and all six strategy frameworks. Hosting and third-party fees are separate.</span>
                </div>
              )}

              {!purchasable ? (
                <div role="status" style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-2-100)', color: 'var(--color-accent-2-900)', fontSize: 14, lineHeight: 1.55, marginBottom: 14 }}>
                  {catalogError ? 'Availability could not be checked.' : !catalog ? 'Checking product availability…' : isCore ? 'New purchases are paused while we fix installation and trading issues in this release. Existing customers can access their purchases from their account.' : 'This release is currently unavailable for new purchases. Existing licenses remain in your account.'}
                  {catalogError && <button className="btn btn-secondary" onClick={retry}>Retry</button>}
                </div>
              ) : coveredBy ? (
                <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-2-100)', color: 'var(--color-accent-2-800)', fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
                  Already included in your {coveredBy}
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                  <button onClick={addToCart} className="btn btn-primary" style={{ height: 50, padding: '0 26px', fontSize: 15 }}>
                    {added ? '✓ Added to cart' : 'Add to cart'}
                  </button>
                  <Link href="/checkout" onClick={buyNow} className="btn btn-secondary" style={{ height: 50, padding: '0 22px', fontSize: 15 }}>
                    Buy now
                  </Link>
                </div>
              )}

              {product.demoUrl && (
                <a href={product.demoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, marginBottom: 26 }}>
                  View the live demo
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                </a>
              )}

              <div style={{ display: 'grid', gap: 2, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-divider)' }}>
                {(isCore ? ['Downloadable software — installed by you', 'One-time license fee; hosting costs are separate', 'Darvas Box strategy included', 'Source code you can read and customize'] : isAgent ? ['Downloadable strategy source code', 'Requires a compatible dashboard installation', 'Included in Trader Edition', 'One-time software license fee'] : ['Core dashboard source included', 'All six strategy frameworks included', 'Installed and maintained by you', 'Hosting and trading funds are separate']).map((a) => (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', background: 'var(--color-neutral-100)', fontSize: 14 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-2-700)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 6 9 17l-5-5" /></svg>
                    {a}
                  </div>
                ))}
              </div>

              {product.techStack && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 20 }}>
                  {product.techStack.map((s: string) => (
                    <span key={s} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '5px 12px', borderRadius: 999, border: '1px solid var(--color-divider)', color: 'var(--color-neutral-700)' }}>{s}</span>
                  ))}
                </div>
              )}

              <p style={{ marginTop: 20, fontSize: 12, lineHeight: 1.55, color: 'var(--color-neutral-600)' }}>
                You are purchasing software source code — not financial advice or guaranteed returns. Trading involves substantial risk of loss.{' '}
                <a href="/disclaimer">Full disclaimer →</a>
              </p>
            </div>
          </div>
        </section>

        {product.videoUrl && (
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 28px 0' }}>
            <h2 style={{ fontSize: 'clamp(26px,2.6vw,34px)', letterSpacing: '-0.02em', margin: '0 0 24px' }}>Product demo</h2>
            <ProductVideo videoUrl={product.videoUrl} productName={product.name} accent="var(--color-accent)" poster={product.images?.[0] || product.image} />
          </section>
        )}

        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 28px 0' }}>
          <div data-cv-2col style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.25fr)', gap: 56, alignItems: 'start' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(26px,2.6vw,34px)', letterSpacing: '-0.02em', margin: '0 0 20px' }}>What&apos;s included</h2>
              <div style={{ display: 'grid', gap: 11 }}>
                {(product.features ?? []).map((f: string) => (
                  <div key={f} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', fontSize: 14.5, lineHeight: 1.5 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M20 6 9 17l-5-5" /></svg>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: 'clamp(26px,2.6vw,34px)', letterSpacing: '-0.02em', margin: '0 0 20px' }}>{isCore ? "What is Core Edition?" : isAgent ? "How this strategy works" : "What is Trader Edition?"}</h2>
              {(product.longDescription || '').split('\n\n').map((p: string, i: number) => (
                <p key={i} style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--color-neutral-800)' }}>{p}</p>
              ))}
              <div style={{ marginTop: 24, padding: '22px 24px', borderRadius: 'var(--radius-lg)', background: 'var(--color-accent-2-100)' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, marginBottom: 8, color: 'var(--color-accent-2-900)' }}>Not included</div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-accent-2-900)', margin: 0 }}>
                  {isCore ? "A hosted dashboard, server or database fees, installation services, trading funds and paid third-party services. Other strategy plugins are sold separately; Trader includes all six strategy frameworks." : isTrader ? "Managed hosting, server and database fees, installation services, trading funds and paid data or AI services. You install and maintain the software yourself." : "A standalone dashboard, managed hosting, trading funds, installation services or paid data subscriptions. The dashboard supplies market data and handles orders and positions; this download supplies the strategy code."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 28px 0' }}>
          <h2 style={{ fontSize: 'clamp(26px,2.6vw,34px)', letterSpacing: '-0.02em', margin: '0 0 8px' }}>{isAgent ? "How to install this strategy" : "How you get started"}</h2>
          <p style={{ fontSize: 15.5, color: 'var(--color-neutral-700)', margin: '0 0 28px' }}>{isAgent ? "Install the add-on into a working dashboard that supports its version. Read the included installation guide before changing your setup." : "When purchases reopen, download your edition from your account. You will need a compatible Node.js environment, a Supabase project and the ability to configure and maintain both."}</p>
          <div data-cv-2col style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 1, background: 'var(--color-divider)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {(!isAgent ? [
              { n: '01', t: 'Download your software', d: 'After payment is confirmed, download your edition from your account and extract it into a new folder.' },
              { n: '02', t: 'Set up your environment', d: 'Follow the included guide to install dependencies, connect Supabase and create the database tables.' },
              { n: '03', t: 'Configure your workspace', d: 'Start the dashboard, set up your account and configure your strategy, market and risk settings.' },
              { n: '04', t: 'Test before going live', d: 'Check login, saved settings and trading controls. Verify a full testnet trade before considering real funds.' },
            ] : [
              { n: '01', t: 'Check compatibility', d: 'Match the add-on version to your installed dashboard. Confirm the strategy is not already included in your edition.' },
              { n: '02', t: 'Back up and install', d: 'Back up your settings and plugins. Follow the included installation guide to copy the strategy into your dashboard.' },
              { n: '03', t: 'Choose your settings', d: 'Restart the dashboard, select the strategy and configure its market, timeframe and risk limits.' },
              { n: '04', t: 'Review a test run', d: 'Check signals, order handling and exits on testnet before considering real funds. Keep a backup before updates.' },
            ]).map((s) => (
              <div key={s.n} style={{ background: 'var(--color-neutral-100)', padding: '28px 26px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-accent)', marginBottom: 14 }}>{s.n}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19, marginBottom: 8 }}>{s.t}</div>
                <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}>{s.d}</div>
              </div>
            ))}
          </div>
        </section>

        {isCore && <section style={{maxWidth:1200,margin:'0 auto',padding:'56px 28px 0'}}>
          <h2 style={{fontSize:'clamp(26px,2.6vw,34px)',lineHeight:1.2,marginBottom:24}}>Before you choose Core</h2>
          {[
            ['Is this a ready-to-use hosted dashboard?', 'No. Core is downloadable source code that you install and maintain. Managed hosting is a separate subscription for customers who want the server operated for them.'],
            ['Do I need coding experience?', 'You should be comfortable installing a web application and configuring its database, or have a developer help you. AI coding tools can help with customization, but you still need to review and test changes.'],
            ['Which strategy comes with Core?', 'Darvas Box is included. You do not need to buy the Darvas add-on again. Other strategies are available separately, or together with Core in Trader.'],
            ['Can it start trading as soon as I download it?', 'No. Installation, account connection, strategy configuration and testing are required. The current release has unresolved installation and trading issues, so new purchases remain paused.'],
            ['Is the $99 price a monthly fee?', 'No. It is a one-time software license fee. You pay separately for your server, database and any paid services you choose to use.'],
          ].map(([question,answer])=><details key={question} style={{padding:'20px 0',borderBottom:'1px solid var(--color-divider)'}}><summary style={{fontSize:16,fontWeight:600,lineHeight:1.5,cursor:'pointer'}}>{question}</summary><p style={{fontSize:15,lineHeight:1.7,color:'var(--color-neutral-800)',maxWidth:800,marginTop:16}}>{answer}</p></details>)}
          <p style={{marginTop:24,fontSize:15,lineHeight:1.6}}>Prefer managed hosting? <Link href="/hosted">Compare hosted plans →</Link></p>
        </section>}

        {!isCore && <section style={{maxWidth:1200,margin:'0 auto',padding:'56px 28px 40px'}}>
          <h2 style={{fontSize:'clamp(26px,2.6vw,34px)',lineHeight:1.2,marginBottom:24}}>Before you buy</h2>
          {(isAgent ? [
            ['Can I use this without the dashboard?', 'No. This is a strategy add-on, not a standalone trading app. You need a compatible Cival dashboard to supply data, run the strategy and manage orders.'],
            ['Is this already in my edition?', product.id === 'darvas-indicator' ? 'Darvas is included in both Core and Trader. You do not need to purchase it again.' : 'Trader includes this strategy. If you own Core, this is an optional additional strategy. Check your account and installed plugins before buying.'],
            ['Does this add agents to my hosted plan?', 'No. This purchase is downloadable source code. Hosted dashboard subscriptions have their own strategy selection and agent limits.'],
            ['Do I need a paid AI service?', 'These strategies use programmed rules rather than an LLM. No AI subscription is included. Any external service you add has its own costs.'],
            ['Are updates and support included?', 'The purchase covers the supplied software version. Check the license and product terms for update rights; future major versions may be separate products. Contact support for purchase or installation help.'],
          ] : [
            ['Do I also need to buy Core or the individual agents?', 'No. Trader includes Core, Darvas and the other five strategy frameworks. Buying them again would duplicate what is already included.'],
            ['How is the $95 saving calculated?', 'Core is listed at $99 and includes Darvas. The other five add-ons are $49 each, making $344 separately. Trader is $249. The $344 comparison is not a previous sale price.'],
            ['Does Trader include a hosted dashboard?', 'No. You install and maintain Trader on your own infrastructure. Managed hosting is a separate subscription.'],
            ['Can all six strategies trade immediately?', 'No. You must complete installation, configure the strategies and verify order handling and risk controls. New purchases remain paused while release issues are corrected.'],
            ['Does Sentiment Proxy include news or macroeconomic data?', 'No. It is an experimental research strategy based on price and volume estimates. External news, social and macroeconomic feeds are not included.'],
          ]).map(([question,answer])=><details key={question} style={{padding:'20px 0',borderBottom:'1px solid var(--color-divider)'}}><summary style={{fontSize:16,fontWeight:600,lineHeight:1.5,cursor:'pointer'}}>{question}</summary><p style={{fontSize:15,lineHeight:1.7,color:'var(--color-neutral-800)',maxWidth:800,marginTop:16}}>{answer}</p></details>)}
          <p style={{fontSize:15,lineHeight:1.6,marginTop:24}}><Link href="/terms">Read software license terms</Link> · <Link href="/hosted">Explore managed hosting</Link></p>
        </section>}

        <p style={{maxWidth: 1200, margin: '28px auto', padding: '0 28px'}}><Link href={`/docs/setup?product=${product.id}`}>Open the complete setup guide →</Link></p>
        <section style={{ maxWidth: 800, margin: '80px auto 0', padding: '0 28px' }}>
          <div style={{ padding: '24px 28px', background: 'var(--color-accent-100)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: 'var(--color-accent-900)', marginBottom: 4 }}>Join the Cival Systems Discord</div>
              <div style={{ fontSize: 14, color: 'var(--color-accent-800)', lineHeight: 1.5 }}>Discuss setup, strategy customization and dashboard features.</div>
            </div>
            <a href="https://discord.gg/EZk6gTx57k" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Join Discord →</a>
          </div>
        </section>

        {related.length > 0 && (
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 28px 96px' }}>
            <h2 style={{ fontSize: 'clamp(26px,2.6vw,34px)', letterSpacing: '-0.02em', margin: '0 0 24px' }}>{isAgent || isCore ? "Explore other strategies" : "Explore more products"}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: 16 }}>
              {related.map((p) => (
                <Link key={p.id} href={`/store/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '22px 24px', borderRadius: 'calc(var(--radius-lg) * 1.15)', background: 'var(--color-surface)', textDecoration: 'none', color: 'var(--color-text)' }}>
                  <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 999, background: 'var(--color-neutral-100)', display: 'grid', placeItems: 'center', fontSize: 20 }}>{p.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, lineHeight: 1.2 }}>{p.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-neutral-700)', marginTop: 4 }}>{money(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />


    </div>
  );
}
