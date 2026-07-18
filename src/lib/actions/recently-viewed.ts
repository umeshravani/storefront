"use server";

import type { Product } from "@spree/sdk";
import { getProduct } from "@/lib/data/products";

/**
 * Fetches product summaries for a list of slugs (used by the client-side
 * Recently Viewed component, which tracks slugs in localStorage). Slugs
 * that fail to fetch (e.g. a product was deleted since it was viewed)
 * are silently skipped rather than breaking the whole list.
 */
export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  const results = await Promise.all(
    slugs.map(async (slug) => {
      try {
        return await getProduct(slug);
      } catch {
        return null;
      }
    }),
  );
  return results.filter((p): p is Product => p !== null);
}
