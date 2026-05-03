"use client";

import type { Cart } from "@spree/sdk";
import { Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { use, useEffect, useRef, useState } from "react";
import { AddressBlock } from "@/components/order/AddressBlock";
import { OrderTotals } from "@/components/order/OrderTotals";
import { PaymentInfo } from "@/components/order/PaymentInfo";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { useCheckout } from "@/contexts/CheckoutContext";
import { trackPurchase } from "@/lib/analytics/gtm";
import { getCompletedOrder } from "@/lib/data/checkout";
import { getCachedCompletedOrder } from "@/lib/utils/completed-order-cache";
import { extractBasePath } from "@/lib/utils/path";

interface OrderPlacedPageProps {
  params: Promise<{
    id: string;
    country: string;
    locale: string;
  }>;
}

export default function OrderPlacedPage({ params }: OrderPlacedPageProps) {
  const { id: cartId } = use(params);
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);
  const { setSummaryContent } = useCheckout();
  const t = useTranslations("orderPlaced");
  const tc = useTranslations("common");

  const [order, setOrder] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"orderNotFound" | "failedToLoad" | null>(
    null,
  );

  useEffect(() => {
    setSummaryContent(null);
  }, [setSummaryContent]);

  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    let cancelled = false;

    async function loadOrder() {
      try {
        const cached = getCachedCompletedOrder(cartId) as Cart | null;
        const orderData = cached ?? (await getCompletedOrder(cartId));
        if (cancelled) return;

        loadedRef.current = true;

        if (orderData) {
          setOrder(orderData);
          try {
            trackPurchase(orderData);
          } catch {
            // Analytics failure must not break the confirmation UX
          }
        } else {
          setError("orderNotFound");
        }
        setLoading(false);
      } catch {
        if (!cancelled) {
          loadedRef.current = true;
          setError("failedToLoad");
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [cartId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 py-12 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-[50px] h-[50px] bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2.5">
            <div className="h-3.5 bg-gray-200 rounded w-1/4" />
            <div className="h-6 bg-gray-200 rounded w-2/5" />
          </div>
        </div>
        <div className="h-[250px] bg-gray-200 rounded-xl w-full mb-6" />
        <div className="h-64 bg-gray-200 rounded-xl mt-8" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t(error || "orderNotFound")}
        </h1>
        <Button asChild>
          <Link href={`${basePath}/`}>{tc("continueShopping")}</Link>
        </Button>
      </div>
    );
  }

  const customerName =
    order.billing_address?.full_name || order.shipping_address?.full_name || "";

// Helper to encode the address for the map query
  const getMapQuery = () => {
    if (!order.shipping_address) return "";
    const addr = order.shipping_address;
    
    // Safely extract properties by bypassing strict TS typing
    const zip = (addr as any).zipcode || (addr as any).zipCode || "";
    const countryName = (addr as any).country?.name || (addr as any).country_name || "";
    
    // Privacy-friendly view of City, State, Zip, Country.
    return encodeURIComponent(
      `${addr.city}, ${addr.state_name || ""} ${zip}, ${countryName}`
    );
  };

  const mapQuery = getMapQuery();
  // Standard embed URL. The UI controls will be hidden via CSS cropping below.
  const basicMapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=near&output=embed`;

  // Define the Shipping Address format shown on the bubble.
  const shippingAddressLabelText = "Shipping address";
  const shippingAddressValueText =
    order.shipping_address?.city && order.shipping_address?.state_name
      ? `${order.shipping_address.city} ${order.shipping_address.state_name}`
      : "Karimnagar TS";

  return (
    <div className="py-4 max-w-2xl mx-auto space-y-6">
      {/* 1. Header with Vector Tick & Confirmation Text (Shopify Style) */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-[50px] h-[50px] rounded-full border-[2px] border-green-500 flex items-center justify-center flex-shrink-0 bg-white">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-gray-500 text-[13px] font-normal tracking-tight mb-0.5">
            Confirmation #{order.number}
          </p>
          <h1 className="text-2xl font-normal text-gray-900 tracking-tight leading-none">
            {customerName
              ? `Thank you, ${customerName.split(" ")[0]}!`
              : "Thank you!"}
          </h1>
        </div>
      </div>

      {/* 2. Order Confirmation Card with Google Maps (Shopify Style) */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6 shadow-sm">

        {/* ADDED: overflow-hidden to the main container to enable clipping */}
        <div className="w-full h-[240px] bg-gray-100 relative overflow-hidden">
          {mapQuery ? (
            <>
              {/* Map Container - Uses scaling and pointer-events-none to hide UI and prevent interaction */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <iframe
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%+600px)] h-[calc(100%+200px)] max-w-none"
                  frameBorder="0"
                  style={{ border: 0 }}
                  referrerPolicy="no-referrer-when-downgrade"
                  src={basicMapUrl}
                  title="Delivery Location Map"
                />
              </div>

              {/* The Address Bubble Overlay */}
              <div className="absolute top-[35px] left-1/2 -translate-x-1/2 z-10 w-fit max-w-[280px]">
                <div className="bg-white rounded-xl border border-gray-200 shadow-xl px-6 py-4.5 relative z-10">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-0.5 font-medium">
                      {shippingAddressLabelText}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 leading-snug">
                      {shippingAddressValueText}
                    </p>
                  </div>
                  <button className="absolute top-1.5 right-2.5 text-gray-400 hover:text-gray-600">
                    <span className="text-xl leading-none">&times;</span>
                  </button>
                </div>
                {/* Triangle Caret pointing down */}
                <div className="absolute -bottom-[9.5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] border-t-gray-200 z-0" />
                <div className="absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white z-0" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
              Map Unavailable
            </div>
          )}
        </div>

        {/* Replicated Sub-text Inside the Card */}
        <div className="px-6 py-6 border-t border-gray-200">
          <h2 className="text-xl font-medium text-gray-900 mb-2 leading-snug">
            Your order is confirmed
          </h2>
          <p className="text-sm text-gray-600">
            You&apos;ll receive a confirmation email shortly.
          </p>
        </div>
      </div>

      {/* 3. Order Items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-medium text-gray-900">
            {t("orderItems")}
          </h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {order.items?.map((item) => (
            <li key={item.id} className="px-6 py-4 flex gap-4">
              <div className="relative w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden">
                <ProductImage
                  src={item.thumbnail_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                  iconClassName="w-6 h-6"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="text-sm font-medium text-gray-900">
                  {item.name}
                </h3>
                {item.options_text && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {item.options_text}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-0.5">
                  {t("qty", { quantity: item.quantity })}
                </p>
              </div>
              <div className="text-sm font-medium text-gray-900 flex items-center">
                {item.display_total}
              </div>
            </li>
          ))}
        </ul>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          <OrderTotals order={order} />
        </div>
      </div>

      {/* 4. Shipping & Payment */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          {order.fulfillments && order.fulfillments.length > 0 && (
            <div className="px-6 py-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                {t("shippingMethod")}
              </h3>
              {order.fulfillments.map((fulfillment) => (
                <div
                  key={fulfillment.id}
                  className="flex items-start gap-3 mb-2 last:mb-0"
                >
                  <Package className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {fulfillment.delivery_method?.name ||
                        t("standardShipping")}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {fulfillment.display_cost}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {order.payments && order.payments.length > 0 && (
            <div className="px-6 py-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                {t("payment")}
              </h3>
              {order.payments
                .filter((p) => p.status !== "void" && p.status !== "invalid")
                .map((payment) => (
                  <div key={payment.id} className="mb-3 last:mb-0">
                    <PaymentInfo
                      payment={payment}
                      storeCreditLabel={
                        order.gift_card ? t("giftCard") : undefined
                      }
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Contact & Addresses */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          {order.shipping_address && (
            <div className="px-6 py-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                {t("shippingAddress")}
              </h3>
              <div className="text-sm text-gray-600 leading-relaxed">
                <AddressBlock address={order.shipping_address} />
              </div>
            </div>
          )}

          {order.billing_address && (
            <div className="px-6 py-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                {t("billingAddress")}
              </h3>
              <div className="text-sm text-gray-600 leading-relaxed">
                <AddressBlock address={order.billing_address} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. Actions */}
      <div className="text-center pt-2">
        <Button size="lg" className="w-full sm:w-auto min-w-[200px]" asChild>
          <Link href={`${basePath}/`}>{tc("continueShopping")}</Link>
        </Button>
      </div>
    </div>
  );
}
