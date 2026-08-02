"use client";

import type { Product } from "@spree/sdk";
import { UnfoldHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { CompareColorsModal } from "@/components/products/CompareColorsModal";
import { ShareButton } from "@/components/products/ShareButton";
import { WishlistButton } from "@/components/products/WishlistButton";

interface ProductAddonsProps {
  product: Product;
  variantId: string;
  basePath: string;
  currentPath: string;
}

export function ProductAddons({
  product,
  variantId,
  basePath,
  currentPath,
}: ProductAddonsProps) {
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Only show Compare Colors if there is a color option
  const hasColors = useMemo(() => {
    return product.option_types?.some(
      (ot) => ot.name.toLowerCase() === "color" || ot.kind === "color_swatch",
    );
  }, [product.option_types]);

  return (
    <>
      <div className="flex flex-wrap gap-x-8 gap-y-4 items-center mt-6">
        {/* Compare Colors */}
        {hasColors && (
          <button
            type="button"
            onClick={() => setIsCompareModalOpen(true)}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-black cursor-pointer text-sm font-medium transition-colors"
          >
            <UnfoldHorizontal
              className="w-[18px] h-[18px] text-gray-900"
              strokeWidth={2}
            />
            Compare colors
          </button>
        )}

        {/* Add to Wishlist */}
        <WishlistButton
          variantId={variantId}
          basePath={basePath}
          currentPath={currentPath}
          buttonVariant="inline"
        />

        {/* Share */}
        <ShareButton title={product.name} buttonVariant="inline" />
      </div>

      {hasColors && (
        <CompareColorsModal
          product={product}
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
        />
      )}
    </>
  );
}
