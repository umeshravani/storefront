"use client";

import type { Product } from "@spree/sdk";
import dynamic from "next/dynamic";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";

const LazyProductCarousel = dynamic(
  () =>
    import("@/components/products/ProductCarousel").then((mod) => ({
      default: mod.ProductCarousel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    ),
  },
);

interface FeaturedProductsCarouselProps {
  products: Product[];
  basePath: string;
  currency?: string;
}

export function FeaturedProductsCarousel({
  products,
  basePath,
  currency,
}: FeaturedProductsCarouselProps) {
  return (
    <LazyProductCarousel
      products={products}
      basePath={basePath}
      currency={currency}
    />
  );
}
