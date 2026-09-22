import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import '../marketing-pages.css';

export const metadata = {
  title: 'About Cival Systems | Your starting point for trading automation',
  description: 'Cival combines a trading dashboard, extensible strategy agents and managed hosting to help you build and monitor your own automated trading workflow.',
};

const principles = [
  ['A clearer starting point', 'Participating in financial markets should not require building an entire software platform first. Cival brings account visibility, strategy configuration and monitoring into a workspace you can learn and adapt.'],
  ['Automation with visibility', 'An agent should be something you can understand and supervise. Follow its decisions, review positions and outcomes, configure risk limits and decide when automation runs.'],
  ['Room to build your own', 'Start with an existing strategy framework, customize the source or extend the dashboard with your own tools. The platform is a foundation for your workflow, not the end of your development journey.'],
];

export default function AboutPage() {
  return <div className="cival"><Navbar /><main className="marketing-page">
    <header style={{maxWidth:850,marginBottom:36}}>
      <span className="tag tag-accent">About Cival Systems</span>
      <h1>A starting point for your trading journey.</h1>
      <p style={{fontSize:20}}>Cival was created to make it easier to begin working with financial markets and trading automation. We bring the dashboard, strategy frameworks and operating tools together so you can focus on learning, configuring and improving your approach.</p>
    </header>
    <Image className="brand-art" src="/images/guides/cival-systems-v2.webp" width={1672} height={941} priority sizes="(max-width:1200px) 100vw,1152px" alt="Cival Systems conceptual artwork of a connected trading platform and six strategy modules" />
    <section className="about-section"><h2>Built around the way you operate.</h2><div className="about-grid">{principles.map(([title,copy],index)=><article key={title}><span className="tag tag-neutral">0{index+1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="about-section"><span className="tag tag-accent">One foundation, two paths</span><h2 style={{marginTop:20}}>Choose how you want to build.</h2><div className="about-grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,300px),1fr))'}}>
      <article><h3>Your dashboard, hosted for you</h3><p>Managed hosting provides a private dashboard without operating the server yourself. Choose your plan, connect your own account, configure strategies and monitor activity. You remain responsible for your trading choices and account permissions.</p><Link className="btn btn-primary" href="/hosted">Explore managed hosting</Link></article>
      <article><h3>Your source, your installation</h3><p>Source editions give you editable TypeScript for your own deployment. Use an AI coding assistant or your preferred editor to change strategies, customize the interface and add integrations. Follow the setup guide for your exact release.</p><Link className="btn btn-secondary" href="/store">Compare source editions</Link></article>
    </div></section>
    <section className="about-section" style={{maxWidth:820}}><h2>Start with understanding. Build with evidence.</h2><p>Automation can evaluate markets continuously, but it does not remove uncertainty or guarantee returns. Begin with the demo, understand your strategy and verify its behavior on testnet before considering live execution. Check data, fills, exits and risk controls as part of your routine.</p><p>Our aim is to reduce the work needed to assemble your trading software and give you a clearer view of how it operates. Your knowledge, testing and decisions remain essential.</p><div className="about-actions"><Link className="btn btn-primary" href="/docs/setup">Read the setup guide</Link><a className="btn btn-secondary" href="https://ai-trading-dashboard-demo.vercel.app/dashboard" target="_blank" rel="noopener noreferrer">Explore the demo</a><Link className="btn btn-secondary" href="/contact">Contact us</Link></div></section>
  </main><Footer /></div>;
}
