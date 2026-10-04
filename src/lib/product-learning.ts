import guides from './product-guides.json';

export const productGuides = guides;
export function getProductGuide(id: string) { return productGuides.find(guide => guide.id === id); }
export function productGuideHref(id: string) { return getProductGuide(id) ? `/docs/products/${id}` : '/docs/setup'; }
export const tutorialTitles: Record<string, string> = {
  '01-dashboard-orientation': 'Find your way around the dashboard',
  '03-first-agent': 'Create and inspect an agent',
  '04-farms-risk-goals': 'Understand farms, risk and goals',
  '05-monitor-recover': 'Monitor, pause and recover',
};
