"use client";

import type { Product, Variant } from "@spree/sdk";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface CompareColorsModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function CompareColorsModal({
  product,
  isOpen,
  onClose,
}: CompareColorsModalProps) {
  const [activeColors, setActiveColors] = useState<string[]>([]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Extract color option type
  const colorOptionType = useMemo(() => {
    return product.option_types?.find(
      (ot) => ot.name.toLowerCase() === "color" || ot.kind === "color_swatch",
    );
  }, [product.option_types]);

  // Map color names to their representative variant
  const colorVariants = useMemo(() => {
    if (!colorOptionType || !product.variants) return [];

    const map = new Map<
      string,
      { label: string; colorValue: string; variant: Variant; image: string }
    >();

    product.variants.forEach((variant) => {
      const colorOption = variant.option_values.find(
        (ov) => ov.option_type_id === colorOptionType.id,
      );
      if (colorOption && !map.has(colorOption.name)) {
        // Find image
        const variantMedia = product.media?.find((m) =>
          m.variant_ids?.includes(variant.id),
        );
        const defaultMedia = product.media?.[0];
        const imageUrl =
          variantMedia?.original_url || defaultMedia?.original_url || "";
        if (imageUrl) {
          map.set(colorOption.name, {
            label: (colorOption as any).presentation || colorOption.name,
            colorValue:
              (colorOption as any).color_code ||
              (colorOption as any).presentation ||
              colorOption.name,
            variant: variant,
            image: imageUrl,
          });
        }
      }
    });

    return Array.from(map.values());
  }, [product, colorOptionType]);

  if (!isOpen) return null;

  if (colorVariants.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full relative">
          <button onClick={onClose} className="absolute right-4 top-4">
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-medium mb-4 text-gray-900 m-0">
            Compare Color
          </h3>
          <p className="text-gray-500 text-sm">No colors to compare.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 m-0">
            Compare Color
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors outline-none cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto hide-scrollbar">
          {/* Swatches */}
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            {colorVariants.map((item) => {
              const isActive = activeColors.includes(item.label);
              return (
                <button
                  key={item.label}
                  type="button"
                  title={item.label}
                  onClick={() => {
                    setActiveColors((prev) =>
                      prev.includes(item.label)
                        ? prev.filter((c) => c !== item.label)
                        : [...prev, item.label],
                    );
                  }}
                  className={`w-8 h-8 rounded-full transition-colors duration-200 relative border cursor-pointer ${
                    isActive
                      ? "ring-1 ring-gray-900 ring-offset-2 border-transparent"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: item.colorValue }}
                ></button>
              );
            })}
          </div>

          {/* Grid of active colors */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {colorVariants
              .filter((item) => activeColors.includes(item.label))
              .map((item) => (
                <div key={item.label} className="flex flex-col items-center">
                  <div className="w-full aspect-square relative rounded-xl overflow-hidden bg-gray-50 mb-3 border border-gray-100 shadow-sm">
                    <Image
                      src={item.image}
                      alt={item.label}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 300px"
                    />
                  </div>
                  <p className="font-medium text-gray-900 capitalize text-sm text-center m-0">
                    {item.label}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
