"use client";

import { Plus, Radio, Smartphone, Speaker as SpeakerIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchAddonProducts } from "@/lib/data/addons";

interface AddonSelectorProps {
  customFields: Array<{ key: string; value: any }>;
  onAddonChange: (selectedVariantIds: string[]) => void;
}

export default function AddonSelector({
  customFields,
  onAddonChange,
}: AddonSelectorProps) {
  const [addons, setAddons] = useState<any[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const slugsToFetch = useMemo(() => {
    const slugs: string[] = [];

    const isFieldEnabled = (key: string) => {
      const field = customFields?.find((f) => f.key === key);
      if (!field || field.value == null) return false;
      const val = String(field.value).toLowerCase();
      return val === "true" || val === "1";
    };

    if (isFieldEnabled("addons.has_remote")) {
      slugs.push("ir-remote-controller");
    }

    if (isFieldEnabled("addons.has_speakers")) {
      slugs.push("built-in-stereo-speakers");
    }

    return slugs.join(",");
  }, [customFields]);

  useEffect(() => {
    let isMounted = true;

    async function fetchAddons() {
      if (!slugsToFetch) {
        if (isMounted) setIsLoading(false);
        return;
      }

      if (isMounted) setIsLoading(true);

      try {
        const data = await fetchAddonProducts(slugsToFetch);
        if (isMounted) setAddons(data);
      } catch (error) {
        console.error("Failed to fetch optional upgrades", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchAddons();

    return () => {
      isMounted = false;
    };
  }, [slugsToFetch]);

  const handleToggle = (variantId: string) => {
    const nextSelected = new Set(selectedAddons);
    if (nextSelected.has(variantId)) {
      nextSelected.delete(variantId);
    } else {
      nextSelected.add(variantId);
    }
    setSelectedAddons(nextSelected);
    onAddonChange(Array.from(nextSelected));
  };

  const selectedNames = useMemo(() => {
    return addons
      .filter((addon) =>
        selectedAddons.has(addon.default_variant_id || addon.id),
      )
      .map((addon) => addon.name)
      .join(", ");
  }, [addons, selectedAddons]);

  // Helper to render the custom icon driven by the Spree Metafield
  const renderIcon = (
    iconName: string,
    isSelected: boolean,
    isOutOfStock: boolean,
  ) => {
    const iconClasses = `w-4 h-4 shrink-0 ${isOutOfStock ? "text-gray-400" : isSelected ? "text-gray-300" : "text-gray-500"}`;

    switch (iconName?.toLowerCase()) {
      case "smartphone":
        return <Smartphone className={iconClasses} />;
      case "speaker":
        return <SpeakerIcon className={iconClasses} />;
      case "remote":
        return <Radio className={iconClasses} />;
      default:
        return <Plus className={iconClasses} />; // Fallback icon
    }
  };

  if (isLoading || addons.length === 0) return null;

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      {/* MATCHED VARIANT UI/UX HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-semibold text-gray-900">
          Optional Upgrades
        </span>
        {selectedNames && (
          <span className="text-sm text-gray-500">— {selectedNames}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {addons.map((addon) => {
          const variantId = addon.default_variant_id || addon.id;
          const isSelected = selectedAddons.has(variantId);

          // Native Spree property that respects inventory and backorder settings
          const isOutOfStock = !addon.purchasable;

          // Read the icon name from the Addon product's custom fields
          const iconName = addon.custom_fields?.find(
            (f: any) => f.key === "ui.icon_name",
          )?.value;

          return (
            <button
              key={addon.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => !isOutOfStock && handleToggle(variantId)}
              className={`
                  px-5 py-2.5 rounded-lg text-sm transition-colors duration-200 border cursor-pointer
                  flex items-center gap-2 outline-none select-none
                  ${
                    isOutOfStock
                      ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-75"
                      : isSelected
                        ? "bg-gray-900 border-gray-900 text-white font-medium"
                        : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                  }
              `}
            >
              {renderIcon(iconName, isSelected, isOutOfStock)}

              <span>{addon.name}</span>

              {!isOutOfStock && (
                <span
                  className={isSelected ? "text-gray-300" : "text-gray-500"}
                >
                  (+ {addon.price?.display_amount || ""})
                </span>
              )}

              {/* Exact matched Out of Stock UI */}
              {isOutOfStock && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  (Out of stock)
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
