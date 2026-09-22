export interface ProductScreenshot {
  src: string;
  title: string;
  caption: string;
  source: 'demo' | 'hosted-testnet';
  sourceUrl: string;
}

const demo = (file: string, title: string, caption: string, path: string): ProductScreenshot => ({
  src: `/images/product-captures/${file}.jpg`, title, caption, source: 'demo',
  sourceUrl: `https://ai-trading-dashboard-demo.vercel.app/dashboard${path}`,
});
const hosted = (file: string, title: string, caption: string, path: string): ProductScreenshot => ({
  src: `/images/product-captures/${file}.jpg`, title, caption, source: 'hosted-testnet',
  sourceUrl: `https://cival-5215d0a6023745c4a9a3.dash.civalsystems.com/dashboard${path}`,
});

export const screenshotLabels = { demo: 'Demo · sample data', 'hosted-testnet': 'Hosted dashboard · testnet' };
export const screenshotDisclosure = 'Real screenshots of our interactive demo and hosted dashboard, captured September 19, 2026. These are broader editions than the current downloadable archives. Sample profits are illustrative, not backtests or expected returns. The product contents below define what you receive.';

const overview = demo('demo-overview', 'Portfolio overview', 'See how portfolio balances, agents, and positions are organized. All figures in this demo are sample data.', '');
const agents = demo('demo-agents', 'Choose and monitor agents', 'The demo shows six strategy profiles together, including allocations and recent decisions.', '/agents');
const farms = demo('demo-farms', 'Group agents into farms', 'Explore the broader demo’s farm workspace and coordination views. Farm functionality depends on the edition.', '/farms');
const analytics = demo('demo-analytics', 'Compare strategies', 'Inspect sample strategy comparisons and distributions in the broader demo. These figures are illustrative and are not measured strategy performance.', '/analytics');
const journal = demo('demo-journal', 'Review trade decisions', 'The broader demo shows sample entries, exits, and journal analysis. Journal AI analysis is not supplied by an individual strategy plugin.', '/journal');
const plugins = demo('demo-plugins', 'Plugin workspace', 'Preview the demo’s plugin interface. Follow the supplied installation guide for the downloadable package.', '/plugins');
const liveAgent = hosted('customer-agent-detail-testnet', 'Hosted agent detail', 'An actual hosted testnet Renko agent with its position and protection details. Renko is a hosted example, not included in the downloadable Core or Trader editions.', '/agents');
const liveFarm = hosted('customer-farms-testnet', 'Hosted testnet farm', 'A real customer workspace showing the testnet farm’s capital and results. Hosted service is separate from source-code purchases.', '/farms');
const liveGoal = hosted('customer-goals-testnet', 'Hosted validation goal', 'A testnet validation goal linked to the operational farm. This is operational evidence for the hosted edition, not proof that the downloadable editions are ready to trade.', '/goals');

const strategy = (number: number, slug: string, title: string, detail: string) => demo(`demo-${slug}`, title, detail, `/agents/agent-${number}`);
const darvas = strategy(3, 'darvas', 'Darvas agent workspace', 'Sample Darvas profile, position, and trade history. The current plugin supplies the Darvas signal logic; the dashboard supplies the workspace.');
const elliott = strategy(2, 'elliott', 'Elliott Wave agent workspace', 'Sample Elliott Wave profile. The downloadable strategy uses programmed price-swing rules, not guaranteed wave identification.');
const vwap = strategy(1, 'vwap', 'VWAP agent workspace', 'Sample VWAP profile and trade history. Current package contents specify its volume-weighted signal rules.');
const heikin = strategy(4, 'heikin-ashi', 'Heikin Ashi agent workspace', 'Sample trend-following profile. Demo narrative and performance are illustrative; consult the package rules for actual signals.');
const mean = strategy(5, 'mean-reversion', 'Mean reversion agent workspace', 'Sample mean reversion profile. The plugin uses Bollinger-based rules; market conditions can invalidate a reversion setup.');
const macro = strategy(6, 'sentiment', 'Sentiment demo workspace', 'The broader demo calls this Macro Sentiment Analyzer. The downloadable research plugin uses price/volume proxies and does not include a live news or macroeconomic feed.');

const detail = (image: ProductScreenshot): ProductScreenshot => ({ ...image, src: image.src.replace('.jpg', '-detail.jpg'), title: image.title + ' — full detail', caption: image.caption + ' Full-page capture includes the sample trade history, decisions, and configuration. Open the original image to read every row.' });

export const productMedia: Record<string, ProductScreenshot[]> = {
  'trading-dashboard-template': [overview, darvas, agents, journal, plugins, liveAgent],
  'multi-strat-bundle': [agents, darvas, elliott, vwap, heikin, mean, macro, farms, analytics, journal, plugins, liveAgent, liveFarm, liveGoal],
  'darvas-indicator': [darvas, detail(darvas), agents, journal, plugins],
  'elliott-wave-agent': [elliott, detail(elliott), agents, journal, plugins],
  'vwap-momentum-agent': [vwap, detail(vwap), agents, journal, plugins],
  'heikin-ashi-agent': [heikin, detail(heikin), agents, journal, plugins],
  'mean-reversion-agent': [mean, detail(mean), agents, journal, plugins],
  'macro-sentiment-agent': [macro, detail(macro), agents, journal, plugins],
};
