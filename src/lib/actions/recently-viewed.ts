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
        const product = await getProduct(slug, { expand: ["custom_fields"] });
        if (!product) return null;

        const hideField = product.custom_fields?.find(
          (f: any) => f.key === "store.hide_from_storefront",
        );
        if (hideField && hideField.value != null) {
          const val = String(hideField.value).toLowerCase();
          if (val === "true" || val === "1") return null;
        }

        return product;
      } catch {
        return null;
      }
    }),
  );
  return results.filter((p): p is Product => p !== null);
}
