"use server";

import type { ProductListParams } from "@spree/sdk";
import { cacheLife, cacheTag } from "next/cache";
import {
  cacheTagSuffix,
  DEFAULT_SURFACE,
  getAccessToken,
  getClientForSurface,
  getLocaleOptions,
  type Surface,
} from "@/lib/spree";

/**
 * Cached product list fetch. Cache key is derived from all function
 * arguments by Next.js "use cache":
 *
 * - locale/country: determines language and market-specific pricing
 * - surface: DTC vs wholesale — different catalog + channel pricing. Baked
 *   into both the cache tag and the arguments so the two never share entries.
 * - userToken: per-user cache segmentation (separate arg, NOT passed to
 *   SDK). Authenticated users may see different prices (B2B, loyalty).
 *   Each user's JWT is unique so the cache is segmented per user.
 *   Guest users pass undefined. On the wholesale surface the token is
 *   always present — the channel 401s guests.
 */
export async function cachedListProducts(
  params: ProductListParams | undefined,
  options: { locale?: string; country?: string },
  surface: Surface,
  userToken?: string,
) {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag(`products${cacheTagSuffix(surface)}`);
  return getClientForSurface(surface).products.list(params, {
    ...options,
    // Wholesale catalog requires the customer JWT — the channel is gated.
    ...(surface === "wholesale" && userToken
      ? { token: userToken }
      : undefined),
  });
}

export async function getProducts(
  params?: ProductListParams,
  surface: Surface = DEFAULT_SURFACE,
) {
  const options = await getLocaleOptions();
  const userToken = await getAccessToken();

  // 1. Force the API to expand custom_fields so we can read the hide_from_storefront flag
  const fetchParams = { ...params };
  if (!fetchParams.expand) {
    fetchParams.expand = ["custom_fields"];
  } else if (
    Array.isArray(fetchParams.expand) &&
    !fetchParams.expand.includes("custom_fields")
  ) {
    fetchParams.expand = [...fetchParams.expand, "custom_fields"];
  }

  // 2. Fetch the catalog
  const response: any = await cachedListProducts(
    fetchParams,
    options,
    surface,
    userToken,
  );

  // 3. Filter out any product where `store.hide_from_storefront` is true
  if (response && response.data) {
    response.data = response.data.filter((product: any) => {
      const hideField = product.custom_fields?.find(
        (f: any) => f.key === "store.hide_from_storefront",
      );
      if (!hideField || hideField.value == null) return true; // Show by default

      const val = String(hideField.value).toLowerCase();
      return !(val === "true" || val === "1"); // Remove from array if hidden
    });
  } else if (response && response.isSuccess && response.isSuccess()) {
    // Fallback if Spree SDK returned an ISpreeResponse without a top-level .data
    const successData = response.success();
    if (successData && successData.data) {
      successData.data = successData.data.filter((product: any) => {
        const hideField = product.custom_fields?.find(
          (f: any) => f.key === "store.hide_from_storefront",
        );
        if (!hideField || hideField.value == null) return true; // Show by default

        const val = String(hideField.value).toLowerCase();
        return !(val === "true" || val === "1"); // Remove from array if hidden
      });
    }
  }

  return response;
}

/**
 * Persistent cached product detail fetch. Cache key is derived from:
 *
 * - slugOrId, expand: identify the product and response shape
 * - locale/country: determines language and market-specific pricing
 * - surface: DTC vs wholesale — see cachedListProducts
 * - userToken: per-user cache segmentation (separate arg, NOT passed to
 *   SDK). Authenticated users may see different prices (B2B, loyalty).
 *   Guest users pass undefined, so all guests share one entry.
 */
export async function cachedGetProduct(
  slugOrId: string,
  expand: string[],
  options: { locale?: string; country?: string },
  surface: Surface,
  userToken?: string,
) {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag(
    `products${cacheTagSuffix(surface)}`,
    `product:${slugOrId}${cacheTagSuffix(surface)}`,
  );
  return getClientForSurface(surface).products.get(
    slugOrId,
    { expand },
    {
      ...options,
      ...(surface === "wholesale" && userToken
        ? { token: userToken }
        : undefined),
    },
  );
}

export async function getProduct(
  slugOrId: string,
  params?: { expand?: string[] },
  surface: Surface = DEFAULT_SURFACE,
) {
  const options = await getLocaleOptions();
  const userToken = await getAccessToken();
  return cachedGetProduct(
    slugOrId,
    params?.expand ?? [],
    options,
    surface,
    userToken,
  );
}

async function cachedGetProductFilters(
  params: Record<string, unknown> | undefined,
  options: { locale?: string; country?: string },
  surface: Surface,
  userToken?: string,
) {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag(`product-filters${cacheTagSuffix(surface)}`);
  return getClientForSurface(surface).products.filters(params, {
    ...options,
    ...(surface === "wholesale" && userToken
      ? { token: userToken }
      : undefined),
  });
}

export async function getProductFilters(
  params?: Record<string, unknown>,
  surface: Surface = DEFAULT_SURFACE,
) {
  const options = await getLocaleOptions();
  const userToken = await getAccessToken();
  return cachedGetProductFilters(params, options, surface, userToken);
}
