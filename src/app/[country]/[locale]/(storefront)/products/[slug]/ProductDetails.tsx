"use client";

import type { Media, Product, Variant } from "@spree/sdk";
import { CircleCheckBig, CircleX, Loader2, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { MediaGallery } from "@/components/products/MediaGallery";
import { ProductCustomFields } from "@/components/products/ProductCustomFields";
import { VariantPicker } from "@/components/products/VariantPicker";
import { Button } from "@/components/ui/button";
import { QuantityPicker } from "@/components/ui/quantity-picker";
import { useCart } from "@/contexts/CartContext";
import { useStore } from "@/contexts/StoreContext";
import { trackAddToCart, trackViewItem } from "@/lib/analytics/gtm";
import { RazorpayAffordability } from "@/components/products/RazorpayAffordability";

interface ProductDetailsProps {
  product: Product;
  basePath: string;
}

// Reusable Star Icon
const StarIcon = ({ filled = true, className = "" }) => (
  <svg
    className={`h-4 w-4 shrink-0 ${filled ? "text-yellow-400" : "text-gray-200"} ${className}`}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
  </svg>
);

export function ProductDetails({ product, basePath }: ProductDetailsProps) {
  const { addItem } = useCart();
  const { currency } = useStore();
  const t = useTranslations("products");

  // Reviews Summary State
  const [reviewSummary, setReviewSummary] = useState<{ average: number; totalCount: number } | null>(null);

  // Dynamic Error States (Handles Stale Cache Scenarios)
  const [cartError, setCartError] = useState<string | null>(null);
  const [isLiveOutOfStock, setIsLiveOutOfStock] = useState(false);

  // Filter variants list
  const variants = useMemo(() => {
    return (product.variants || []).filter(Boolean);
  }, [product.variants]);

  const hasVariants = variants.length > 0;
  const optionTypes = product.option_types || [];

  // Initialize with default variant or first available variant
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(() => {
    if (product.default_variant) {
      return product.default_variant;
    }
    if (hasVariants) {
      return variants.find((v) => v.purchasable) || variants[0];
    }
    return product.default_variant || null;
  });

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Track product view
  useEffect(() => {
    trackViewItem(product, currency);
  }, [product, currency]);

  // Reset errors instantly if the user selects a different color/size
  useEffect(() => {
    setCartError(null);
    setIsLiveOutOfStock(false);
  }, [selectedVariant?.id]);

  // Fetch real reviews data
  useEffect(() => {
    const fetchReviewSummary = async () => {
      try {
        const res = await fetch(`/api/custom_reviews/${product.slug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            const fetchedReviews = json.data;
            let sum = 0;
            fetchedReviews.forEach((r: any) => {
              sum += r.rating;
            });
            setReviewSummary({
              average: Number((sum / fetchedReviews.length).toFixed(1)),
              totalCount: json.meta?.total_count || fetchedReviews.length,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch review summary:", error);
      }
    };
    fetchReviewSummary();
  }, [product.slug]);

  const galleryImages = useMemo((): Media[] => {
    return product.media || [];
  }, [product.media]);

  const variantImageIndex = useMemo((): number | null => {
    if (!selectedVariant) return null;
    const index = galleryImages.findIndex((m) =>
      m.variant_ids.includes(selectedVariant.id),
    );
    return index >= 0 ? index : null;
  }, [selectedVariant, galleryImages]);

  const price = selectedVariant?.price ?? product.price;
  const originalPrice =
    selectedVariant?.original_price ?? product.original_price;
  const displayPrice = price?.display_amount;

  const currentAmountCents = price?.amount_in_cents;
  const originalAmountCents = originalPrice?.amount_in_cents;
  const compareAtAmountCents = price?.compare_at_amount_in_cents;
  const onSale =
    (currentAmountCents != null &&
      originalAmountCents != null &&
      currentAmountCents < originalAmountCents) ||
    (compareAtAmountCents != null &&
      currentAmountCents != null &&
      currentAmountCents < compareAtAmountCents);

  const strikethroughPrice = onSale
    ? ((originalPrice?.display_amount &&
      originalPrice.display_amount !== displayPrice
      ? originalPrice.display_amount
      : price?.display_compare_at_amount) ?? null)
    : null;

  // INITIAL Cache Purchasability
  const initialPurchasable = hasVariants
    ? (selectedVariant?.purchasable ?? false)
    : (product.purchasable ?? false);

  const initialInStock = hasVariants
    ? (selectedVariant?.in_stock ?? false)
    : (product.in_stock ?? false);

  // ULTIMATE Live Status (Overrides cache if API blocks addition)
  const displayPurchasable = initialPurchasable && !isLiveOutOfStock;
  const displayInStock = initialInStock && !isLiveOutOfStock;

  const handleAddToCart = async () => {
    const variantId =
      selectedVariant?.id ||
      product.default_variant?.id ||
      product.default_variant_id;

    if (!variantId) {
      setCartError("No variant selected");
      return;
    }

    setLoading(true);
    setCartError(null);
    setIsLiveOutOfStock(false);

    try {
      await addItem(variantId, quantity);
      trackAddToCart(product, selectedVariant, quantity, currency);
    } catch (error: any) {
      // Safely extract the API error message
      let errMsg = typeof error === 'string' ? error : (error?.message || "Could not add item to cart.");

      // Clean up any frontend prefix strings
      errMsg = errMsg.replace(/^Failed to add item to cart:\s*/i, '').replace(/^"|"$/g, '');

      setCartError(errMsg);

      // If the database rejects it due to inventory limits, auto-flip the UI to out of stock
      const lowerMsg = errMsg.toLowerCase();
      if (lowerMsg.includes("not available") || lowerMsg.includes("out of stock") || lowerMsg.includes("quantity")) {
        setIsLiveOutOfStock(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Added lg:items-start to ensure the grid items don't stretch vertically */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-start">

        {/* Media Gallery - STICKY ON DESKTOP */}
        <div className="lg:sticky lg:top-24 lg:self-start lg:z-10">
          <MediaGallery
            images={galleryImages}
            productName={product.name}
            activeIndex={variantImageIndex}
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

          {/* Real Reviews Summary */}
          {reviewSummary && reviewSummary.totalCount > 0 && (
            <div className="mt-3 flex items-center gap-2 sm:mt-2 mb-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} filled={i < Math.round(reviewSummary.average)} />
                ))}
              </div>
              <p className="text-sm font-medium leading-none text-gray-500">
                ({reviewSummary.average})
              </p>
              <button
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                className="text-sm font-medium leading-none text-gray-900 hover:underline"
              >
                {reviewSummary.totalCount} {reviewSummary.totalCount === 1 ? 'Review' : 'Reviews'}
              </button>
            </div>
          )}

          {/* Price */}
          <div className="mt-4 mb-4 flex items-center gap-2">
            {displayPrice && (
              <span className="text-xl font-bold text-gray-900">
                {displayPrice}
              </span>
            )}
            {onSale && strikethroughPrice && (
              <>
                <span className="text-sm text-gray-500 line-through">
                  {strikethroughPrice}
                </span>
                <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {t("sale")}
                </span>
              </>
            )}
          </div>

          {/* Shipping Note */}
          <div className="mt-1.5 text-sm text-gray-500">
            <a
              href="/policies/shipping-policy"
              className="underline hover:text-gray-900 transition-colors"
            >
              Shipping
            </a>{" "}
            calculated at checkout.
          </div>

          {/* Stock Status (Dynamic & Custom UI) */}
          <div className="mt-4">
            {displayInStock ? (
              <div className="flex items-center gap-2.5 text-[#14854E]">
                <div className="relative flex h-[13px] w-[13px] shrink-0 items-center justify-center z-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#14854E] opacity-75 -z-10"></span>
                  <span className="relative inline-flex h-full w-full rounded-full bg-white shadow-[inset_0_0_0_4px_#14854E]"></span>
                </div>
                <span className="text-sm font-medium flex-1">
                  In Stock and ready to ship
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-red-600">
                <div className="relative flex h-[13px] w-[13px] shrink-0 items-center justify-center">
                  <span className="relative inline-flex h-full w-full rounded-full bg-white shadow-[inset_0_0_0_4px_currentColor]"></span>
                </div>
                <span className="text-sm font-medium flex-1">
                  {t("outOfStock")}
                </span>
              </div>
            )}
          </div>

          {/* Variant Picker */}
          {hasVariants && optionTypes.length > 0 && (
            <div className="mt-8">
              <VariantPicker
                variants={variants}
                optionTypes={optionTypes}
                selectedVariant={selectedVariant}
                onVariantChange={setSelectedVariant}
              />
            </div>
          )}

          {/* Live Dynamic Cart Error Banner */}
          {cartError && (
            <div className="mt-6 flex items-start gap-3 text-sm text-red-800 bg-red-50 p-4 rounded-lg border border-red-200">
              <CircleX className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-medium">{cartError}</p>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="mt-6">
            <div className="flex gap-4">
              <QuantityPicker
                quantity={quantity}
                onDecrement={() => setQuantity(Math.max(1, quantity - 1))}
                onIncrement={() => setQuantity(quantity + 1)}
                size="lg"
              />

              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={loading || !displayPurchasable}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    {t("adding")}
                  </>
                ) : displayPurchasable ? (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    {t("addToCart")}
                  </>
                ) : (
                  t("outOfStock")
                )}
              </Button>
            </div>
          </div>

          {/* RAZORPAY AFFORDABILITY WIDGET */}
          {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && (
            <div className="mt-6">
              <RazorpayAffordability
                amount={currentAmountCents || (parseFloat(price?.amount || "0") * 100)}
                currency={currency || "INR"}
                clientKey={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}
              />
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mt-10 border-t pt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {t("description")}
              </h2>
              {/* Description is admin-authored HTML from the Spree CMS backend (trusted source) */}
              <div
                className="text-gray-600 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* Custom Fields */}
          <ProductCustomFields customFields={product.custom_fields} />

          {/* Product Details */}
          <div className="mt-8 border-t pt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {t("details")}
            </h2>
            <dl className="space-y-3">
              {selectedVariant?.sku && (
                <div className="flex">
                  <dt className="w-32 text-gray-500 text-sm">{t("sku")}</dt>
                  <dd className="text-gray-900 text-sm">
                    {selectedVariant.sku}
                  </dd>
                </div>
              )}
              {selectedVariant?.options_text && (
                <div className="flex">
                  <dt className="w-32 text-gray-500 text-sm">{t("options")}</dt>
                  <dd className="text-gray-900 text-sm">
                    {selectedVariant.options_text}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
