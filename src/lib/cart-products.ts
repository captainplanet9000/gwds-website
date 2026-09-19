import { EDITION_INCLUDES, getProduct, type Product } from './products';

/** One license per product; an edition replaces items it already includes. */
export function normalizeCartProducts(ids: string[]): Product[] {
  const selected = [...new Set(ids)].map(getProduct).filter((p): p is Product => !!p && !p.legacy);
  return selected.filter(product => !selected.some(other =>
    other.id !== product.id && EDITION_INCLUDES[other.id]?.includes(product.id),
  ));
}

export function redundantCartProducts(ids: string[]): string[] {
  return ids.filter(id => ids.some(other => other !== id && EDITION_INCLUDES[other]?.includes(id)));
}
