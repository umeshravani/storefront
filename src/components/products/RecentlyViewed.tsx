"use client";

import type { Product } from "@spree/sdk";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getProductsBySlugs } from "@/lib/actions/recently-viewed";

const LazyProductCarousel = dynamic(
  () =>
    import("@/components/products/ProductCarousel").then((mod) => ({
      default: mod.ProductCarousel,
    })),
  { ssr: false },
);

const STORAGE_KEY = "noz_recently_viewed";
const MAX_ITEMS = 12;

function readStoredSlugs(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeStoredSlugs(slugs: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // localStorage unavailable (private browsing, etc.) — fail silently,
    // the section just won't show anything, which is a safe fallback.
  }
}

interface RecentlyViewedProps {
  currentProductSlug: string;
  basePath: string;
}

export function RecentlyViewed({
  currentProductSlug,
  basePath,
}: RecentlyViewedProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const existing = readStoredSlugs();
    const withoutCurrent = existing.filter((s) => s !== currentProductSlug);
    const updated = [currentProductSlug, ...withoutCurrent].slice(0, MAX_ITEMS);
    writeStoredSlugs(updated);

    const toShow = updated.filter((s) => s !== currentProductSlug);
    if (toShow.length === 0) {
      setLoaded(true);
      return;
    }

    getProductsBySlugs(toShow)
      .then(setProducts)
      .finally(() => setLoaded(true));
  }, [currentProductSlug]);

  if (!loaded || products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Recently viewed</h2>
      </div>
      <LazyProductCarousel products={products} basePath={basePath} />
    </section>
  );
}
