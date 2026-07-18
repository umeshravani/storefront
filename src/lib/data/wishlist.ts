"use server";

import { getAccessToken } from "@/lib/spree";

const API_URL = process.env.SPREE_API_URL;
const PUBLISHABLE_KEY = process.env.SPREE_PUBLISHABLE_KEY;

// Store API v3 requires BOTH headers together:
// - X-Spree-API-Key identifies the store (publishable key)
// - Authorization: Bearer identifies the logged-in customer (JWT)
// Verified directly against the live Spree v3 API — see conversation history
// for the actual curl round-trips that confirmed this shape.
function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Spree-API-Key": PUBLISHABLE_KEY ?? "",
  };
}

interface V3Wishlist {
  id: string;
  name: string;
  token: string;
  is_default: boolean;
  is_private: boolean;
  items?: V3WishlistItem[];
}

interface V3WishlistItem {
  id: string;
  variant_id: string;
  wishlist_id: string;
  quantity: number;
  variant: {
    id: string;
    product_id: string;
    sku: string;
    thumbnail_url: string | null;
    price: { display_amount: string };
  };
}

interface V3Product {
  id: string;
  name: string;
  slug: string;
  thumbnail_url: string | null;
  price: { display_amount: string };
}

/** Finds (or creates) the user's default wishlist, fully expanded with items. */
async function getDefaultWishlist(token: string): Promise<V3Wishlist | null> {
  const listRes = await fetch(`${API_URL}/api/v3/store/wishlists`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!listRes.ok) {
    const body = await listRes.text().catch(() => "");
    console.error(
      `[wishlist] list wishlists failed: ${listRes.status} ${listRes.statusText}`,
      { body },
    );
    return null;
  }

  const listJson = await listRes.json();
  const wishlists: V3Wishlist[] = listJson.data ?? [];
  let defaultWishlist = wishlists.find((w) => w.is_default);

  // No default wishlist yet — create one.
  if (!defaultWishlist) {
    const createRes = await fetch(`${API_URL}/api/v3/store/wishlists`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ name: "My Wishlist", is_default: true }),
    });

    if (!createRes.ok) {
      const body = await createRes.text().catch(() => "");
      console.error(
        `[wishlist] create default wishlist failed: ${createRes.status} ${createRes.statusText}`,
        { body },
      );
      return null;
    }

    defaultWishlist = await createRes.json();
    return { ...defaultWishlist!, items: [] };
  }

  // Fetch the full wishlist with items expanded.
  const showRes = await fetch(
    `${API_URL}/api/v3/store/wishlists/${defaultWishlist.id}?expand=items`,
    { headers: authHeaders(token), cache: "no-store" },
  );

  if (!showRes.ok) {
    const body = await showRes.text().catch(() => "");
    console.error(
      `[wishlist] show wishlist failed: ${showRes.status} ${showRes.statusText}`,
      { body },
    );
    return { ...defaultWishlist, items: [] };
  }

  return await showRes.json();
}

export interface WishlistStatus {
  wishlistId: string;
  isSaved: boolean;
  wishedItemId: string | null;
}

export async function getWishlistStatus(
  variantId: string,
): Promise<WishlistStatus | null> {
  const token = await getAccessToken();
  if (!token) {
    console.error("[wishlist] getWishlistStatus: no access token found");
    return null;
  }

  const wishlist = await getDefaultWishlist(token);
  if (!wishlist) return null;

  const match = (wishlist.items ?? []).find(
    (item) => item.variant_id === variantId,
  );

  return {
    wishlistId: wishlist.id,
    isSaved: Boolean(match),
    wishedItemId: match?.id ?? null,
  };
}

export async function addToWishlist(
  wishlistId: string,
  variantId: string,
): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) {
    console.error("[wishlist] addToWishlist: no access token found");
    return false;
  }

  const res = await fetch(
    `${API_URL}/api/v3/store/wishlists/${wishlistId}/items`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ variant_id: variantId }),
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(
      `[wishlist] addToWishlist failed: ${res.status} ${res.statusText}`,
      { wishlistId, variantId, body },
    );
  }
  return res.ok;
}

export async function removeFromWishlist(
  wishlistId: string,
  wishedItemId: string,
): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) {
    console.error("[wishlist] removeFromWishlist: no access token found");
    return false;
  }

  const res = await fetch(
    `${API_URL}/api/v3/store/wishlists/${wishlistId}/items/${wishedItemId}`,
    { method: "DELETE", headers: authHeaders(token) },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(
      `[wishlist] removeFromWishlist failed: ${res.status} ${res.statusText}`,
      { wishlistId, wishedItemId, body },
    );
  }
  return res.ok;
}

export interface WishlistItem {
  wishedItemId: string;
  variantId: string;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  displayPrice: string | null;
}

export async function listWishlistItems(): Promise<WishlistItem[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const wishlist = await getDefaultWishlist(token);
  if (!wishlist || !wishlist.items || wishlist.items.length === 0) return [];

  // The wishlist/item response only gives us product_id — fetch each
  // product once (deduped) to get its name/slug/image.
  const uniqueProductIds = [
    ...new Set(wishlist.items.map((item) => item.variant.product_id)),
  ];

  const products = new Map<string, V3Product>();
  await Promise.all(
    uniqueProductIds.map(async (productId) => {
      const res = await fetch(`${API_URL}/api/v3/store/products/${productId}`, {
        headers: authHeaders(token),
        cache: "no-store",
      });
      if (res.ok) {
        const product: V3Product = await res.json();
        products.set(productId, product);
      } else {
        console.error(
          `[wishlist] product lookup failed for ${productId}: ${res.status}`,
        );
      }
    }),
  );

  return wishlist.items
    .map((item): WishlistItem | null => {
      const product = products.get(item.variant.product_id);
      if (!product) return null;
      return {
        wishedItemId: item.id,
        variantId: item.variant_id,
        productName: product.name,
        productSlug: product.slug,
        imageUrl: item.variant.thumbnail_url ?? product.thumbnail_url,
        displayPrice: item.variant.price?.display_amount ?? null,
      };
    })
    .filter((item): item is WishlistItem => item !== null);
}
