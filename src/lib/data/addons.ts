"use server";

import { getClientForSurface } from "@/lib/spree";

export async function fetchAddonProducts(slugs: string) {
  try {
    const slugArray = slugs
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const validAddons: any[] = [];
    const client = getClientForSurface("dtc");

    for (const slug of slugArray) {
      try {
        // Fetch directly by Slug (100% reliable, bypasses the search engine completely)
        const product = await client.products.get(slug, {
          // We need variants expanded so the UI knows which variant_id to add to the cart
          expand: ["variants"],
        });

        if (product && product.id) {
          validAddons.push(product);
        }
      } catch (err) {
        // Fails silently if the product is disabled or slug is wrong,
        // preventing the whole page from crashing for the user.
        console.warn(
          `Skipping addon: Could not find active product with slug '${slug}'.`,
        );
      }
    }

    return JSON.parse(JSON.stringify(validAddons));
  } catch (error) {
    console.error("Failed to fetch add-on products:", error);
    return [];
  }
}
