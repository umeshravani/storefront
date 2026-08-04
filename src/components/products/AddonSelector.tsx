"use client";

import { Plus, Radio, Smartphone, Speaker as SpeakerIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchAddonProducts } from "@/lib/data/addons";

interface AddonSelectorProps {
  customFields: Array<{ key: string; value: any }>;
  selectedVariant: any | null;
  onAddonChange: (selectedVariantIds: string[]) => void;
}

export default function AddonSelector({
  customFields,
  selectedVariant,
  onAddonChange,
}: AddonSelectorProps) {
  const [addons, setAddons] = useState<any[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Parse all addon rules (Booleans and Whitelists)
  const addonRules = useMemo(() => {
    const getBool = (key: string) => {
      const f = customFields?.find((f) => f.key === key);
      return f && f.value != null
        ? String(f.value).toLowerCase() === "true" || String(f.value) === "1"
        : false;
    };
    const getString = (key: string) => {
      const f = customFields?.find((f) => f.key === key);
      return f && f.value ? String(f.value) : null;
    };

    return {
      remote: {
        enabled: getBool("addons.has_remote"),
        slug: "ir-remote-controller",
        whitelist: getString("addons.remote_whitelist"),
      },
      speakers: {
        enabled: getBool("addons.has_speakers"),
        slug: "built-in-stereo-speakers",
        whitelist: getString("addons.speaker_whitelist"),
      },
    };
  }, [customFields]);

  const slugsToFetch = useMemo(() => {
    const slugs: string[] = [];
    if (addonRules.remote.enabled) slugs.push(addonRules.remote.slug);
    if (addonRules.speakers.enabled) slugs.push(addonRules.speakers.slug);
    return slugs.join(",");
  }, [addonRules]);

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

  // Aggressive Compatibility Engine
  const checkCompatibility = (addon: any, variant: any | null) => {
    let whitelist: string | null = null;

    // Fallback matching: If 'slug' is hidden in the API, fallback to checking the name
    const isRemote =
      addon.slug === addonRules.remote.slug ||
      String(addon.name).toLowerCase().includes("remote");
    const isSpeaker =
      addon.slug === addonRules.speakers.slug ||
      String(addon.name).toLowerCase().includes("speaker");

    if (isRemote) whitelist = addonRules.remote.whitelist;
    if (isSpeaker) whitelist = addonRules.speakers.whitelist;

    // If no whitelist exists, it's universally compatible
    if (!whitelist || whitelist.trim() === "") return { isCompatible: true };
    if (!variant) return { isCompatible: false };

    // 1. Normalize the Whitelist: Remove ALL spaces and hyphens
    // e.g., "30-x-20" becomes "30x20"
    const allowedTerms = whitelist
      .split(",")
      .map((s) => s.replace(/[\s-]/g, "").toLowerCase())
      .filter(Boolean);

    if (allowedTerms.length === 0) return { isCompatible: true };

    // 2. Normalize the Variant Text: Remove ALL spaces and hyphens
    // e.g., "Size: 30 x 20" becomes "size:30x20"
    const optionValuesText =
      variant.option_values
        ?.map((ov: any) => `${ov.name} ${ov.presentation}`)
        .join(" ") || "";
    const rawVariantText = `${variant.options_text || ""} ${variant.name || ""} ${optionValuesText}`;
    const normalizedVariantText = rawVariantText
      .replace(/[\s-]/g, "")
      .toLowerCase();

    // 3. Check for a match
    const isCompatible = allowedTerms.some((term) =>
      normalizedVariantText.includes(term),
    );

    return { isCompatible };
  };

  // Auto-Deselect effect: If the user changes to an incompatible size, uncheck the addon
  useEffect(() => {
    if (!selectedVariant) return;

    let changed = false;
    const nextSelected = new Set(selectedAddons);

    addons.forEach((addon) => {
      const variantId = addon.default_variant_id || addon.id;
      if (nextSelected.has(variantId)) {
        const { isCompatible } = checkCompatibility(addon, selectedVariant);
        if (!isCompatible) {
          nextSelected.delete(variantId);
          changed = true;
        }
      }
    });

    if (changed) {
      setSelectedAddons(nextSelected);
      onAddonChange(Array.from(nextSelected));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant, addons]);

  const handleToggle = (variantId: string) => {
    const nextSelected = new Set(selectedAddons);
    if (nextSelected.has(variantId)) nextSelected.delete(variantId);
    else nextSelected.add(variantId);

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

  const renderIcon = (
    iconName: string,
    isSelected: boolean,
    isDisabled: boolean,
  ) => {
    const iconClasses = `w-4 h-4 shrink-0 ${isDisabled ? "text-gray-400" : isSelected ? "text-gray-300" : "text-gray-500"}`;
    switch (iconName?.toLowerCase()) {
      case "smartphone":
        return <Smartphone className={iconClasses} />;
      case "speaker":
        return <SpeakerIcon className={iconClasses} />;
      case "remote":
        return <Radio className={iconClasses} />;
      default:
        return <Plus className={iconClasses} />;
    }
  };

  if (isLoading || addons.length === 0) return null;

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
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

          const isOutOfStock = !addon.purchasable;
          const { isCompatible } = checkCompatibility(addon, selectedVariant);
          const isDisabled = isOutOfStock || !isCompatible;
          const isSelected = selectedAddons.has(variantId) && isCompatible;

          const iconName = addon.custom_fields?.find(
            (f: any) => f.key === "ui.icon_name",
          )?.value;

          return (
            <button
              key={addon.id}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && handleToggle(variantId)}
              className={`
                  px-5 py-2.5 rounded-lg text-sm transition-colors duration-200 border cursor-pointer
                  flex items-center gap-2 outline-none select-none
                  ${
                    isDisabled
                      ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-75"
                      : isSelected
                        ? "bg-black border-black text-white font-medium"
                        : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                  }
              `}
            >
              {renderIcon(iconName, isSelected, isDisabled)}
              <span>{addon.name}</span>

              {!isDisabled && (
                <span
                  className={isSelected ? "text-gray-300" : "text-gray-500"}
                >
                  (+ {addon.price?.display_amount || ""})
                </span>
              )}

              {isOutOfStock && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  (Out of stock)
                </span>
              )}
              {!isOutOfStock && !isCompatible && (
                <span className="text-xs font-normal text-gray-400">
                  (Not Compatible)
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
