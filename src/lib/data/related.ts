"use server";

import { getClientForSurface } from "@/lib/spree";

export async function fetchRelatedProducts(slugs: string) {
  try {
    const slugArray = slugs
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const validProducts: any[] = [];
    const client = getClientForSurface("dtc");

    for (const slug of slugArray) {
      try {
        // Fetch directly by Slug (100% reliable)
        const response = await client.products.get(slug, {
          expand: ["variants", "images", "default_variant"],
        });

        const product = (response as any)?.data || response;
        if (product && product.id) {
          validProducts.push(product);
        }
      } catch (err) {
        console.warn(
          `Skipping related product: Could not find active product with slug '${slug}'.`,
        );
      }
    }

    return JSON.parse(JSON.stringify(validProducts));
  } catch (error) {
    console.error("Failed to fetch related products:", error);
    return [];
  }
}
