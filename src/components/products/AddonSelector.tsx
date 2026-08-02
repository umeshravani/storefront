"use client";

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

    // Helper function to safely and type-check Spree boolean metafields
    const isFieldEnabled = (key: string) => {
      const field = customFields?.find((f) => f.key === key);
      if (!field || field.value == null) return false;

      // Safely cast to string to prevent TypeScript build errors
      const val = String(field.value).toLowerCase();
      return val === "true" || val === "1";
    };

    // If enabled, automatically fetch the exact product slug
    if (isFieldEnabled("addons.has_remote")) {
      slugs.push("ir-remote-controller");
    }

    if (isFieldEnabled("addons.has_speakers")) {
      // NOTE: Ensure this matches the EXACT slug of your speakers product!
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
      nextSelected.delete(variantId); // Deselect if already selected
    } else {
      nextSelected.add(variantId); // Select
    }
    setSelectedAddons(nextSelected);

    // Pass the selected variant IDs back to the parent form
    onAddonChange(Array.from(nextSelected));
  };

  // Calculate dynamically selected names for the UI header
  const selectedNames = useMemo(() => {
    return addons
      .filter((addon) =>
        selectedAddons.has(addon.default_variant_id || addon.id),
      )
      .map((addon) => addon.name)
      .join(", ");
  }, [addons, selectedAddons]);

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
          // Use default_variant_id for the cart addition
          const variantId = addon.default_variant_id || addon.id;
          const isSelected = selectedAddons.has(variantId);

          return (
            <button
              key={addon.id}
              type="button"
              onClick={() => handleToggle(variantId)}
              className={`
                                px-5 py-2.5 rounded-lg text-sm transition-colors duration-200 border cursor-pointer
                                flex items-center gap-2
                                ${
                                  isSelected
                                    ? "bg-gray-900 border-gray-900 text-white font-medium"
                                    : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                                }
                            `}
            >
              <span>{addon.name}</span>
              <span className={isSelected ? "text-gray-300" : "text-gray-500"}>
                (+ {addon.price?.display_amount || ""})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
