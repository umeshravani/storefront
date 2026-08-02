"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { fetchRelatedProducts } from "@/lib/data/related";

interface ComplementaryProductsProps {
  customFields: Array<{ key: string; value: any }>;
  basePath: string;
}

export default function ComplementaryProducts({
  customFields,
  basePath,
}: ComplementaryProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingIds, setAddingIds] = useState<Record<string, boolean>>({});
  const { addItem } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Extract the slugs from the Metafield
  const slugsToFetch = useMemo(() => {
    const field = customFields?.find((f) => f.key === "store.related_products");
    return field?.value || "";
  }, [customFields]);

  useEffect(() => {
    let isMounted = true;
    async function getProducts() {
      if (!slugsToFetch) {
        if (isMounted) setIsLoading(false);
        return;
      }
      try {
        const data = await fetchRelatedProducts(slugsToFetch);
        if (isMounted) setProducts(data);
      } catch (error) {
        console.error("Failed to fetch related products", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    getProducts();
    return () => {
      isMounted = false;
    };
  }, [slugsToFetch]);

  // Handle Quick Add to Cart
  const handleQuickAdd = async (variantId: string) => {
    setAddingIds((prev) => ({ ...prev, [variantId]: true }));
    try {
      await addItem(variantId, 1);
    } catch (error) {
      console.error("Failed to add to cart", error);
    } finally {
      setAddingIds((prev) => ({ ...prev, [variantId]: false }));
    }
  };

  // Scroll logic for Arrows
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading || products.length === 0) return null;

  // Group products into chunks of 2
  const chunkedProducts = [];
  for (let i = 0; i < products.length; i += 2) {
    chunkedProducts.push(products.slice(i, i + 2));
  }

  // Only show arrows if there is more than 1 chunk (i.e. > 2 products)
  const showArrows = chunkedProducts.length > 1;

  return (
    <div className="mt-8 mb-6">
      {/* Header Area (Outside the border) */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Also Available in</h2>

        {showArrows && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm cursor-pointer outline-none"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm cursor-pointer outline-none"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Bordered Box around the Slider */}
      <div className="border border-gray-200 rounded-xl p-4">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {chunkedProducts.map((pair, slideIdx) => (
            <div
              key={slideIdx}
              className="flex-none w-full snap-start flex flex-col"
            >
              {pair.map((product, productIdx) => {
                const variantId = product.default_variant_id || product.id;
                const isAdding = addingIds[variantId];
                const isOutOfStock = !product.purchasable;

                // Resolve image safely
                const imageUrl =
                  product.images?.[0]?.original_url ||
                  product.thumbnail_url ||
                  "/placeholder-image.jpg"; // Fallback image

                // Determine padding and border based on position in pair
                let layoutClass = "";
                if (pair.length > 1) {
                  if (productIdx === 0) {
                    layoutClass = "pb-4 border-b border-dashed border-gray-200";
                  } else if (productIdx === 1) {
                    layoutClass = "pt-4";
                  }
                }

                return (
                  <div
                    key={product.id}
                    className={`flex gap-4 items-center ${layoutClass}`}
                  >
                    {/* Product Image */}
                    <Link
                      href={`${basePath}/products/${product.slug}`}
                      className="block shrink-0 w-18 relative rounded-lg overflow-hidden bg-gray-50 hover:opacity-90 transition-opacity"
                      style={{ aspectRatio: "1" }}
                    >
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex flex-col justify-center flex-1">
                      <Link
                        href={`${basePath}/products/${product.slug}`}
                        className="text-sm font-medium text-gray-900 hover:underline line-clamp-2"
                      >
                        {product.name}
                      </Link>

                      {/* Pricing */}
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-900">
                          {product.price?.display_amount}
                        </span>
                        {product.original_price?.display_amount && (
                          <span className="text-xs text-gray-500 line-through">
                            {product.original_price.display_amount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Add Button */}
                    <div className="shrink-0 ml-2">
                      <button
                        type="button"
                        disabled={isOutOfStock || isAdding}
                        onClick={() => handleQuickAdd(variantId)}
                        className={`
                          px-4 py-2 rounded-full text-xs transition-colors duration-200 border cursor-pointer
                          flex items-center justify-center gap-2 outline-none select-none
                          ${
                            isOutOfStock
                              ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:text-black"
                          }
                        `}
                      >
                        {isAdding ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                        ) : isOutOfStock ? (
                          "Out of stock"
                        ) : (
                          "Add"
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
