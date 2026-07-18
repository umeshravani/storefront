"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { WishlistItem } from "@/lib/data/wishlist";
import { getWishlistStatus, removeFromWishlist } from "@/lib/data/wishlist";

interface WishlistListProps {
  items: WishlistItem[];
  basePath: string;
}

export function WishlistList({ items, basePath }: WishlistListProps) {
  const [list, setList] = useState(items);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (item: WishlistItem) => {
    setRemovingId(item.wishedItemId);
    // We need the wishlist's own token, not the item's — look it up fresh
    // rather than threading it through every list item.
    const status = await getWishlistStatus(item.variantId);
    if (status?.wishlistId) {
      const ok = await removeFromWishlist(status.wishlistId, item.wishedItemId);
      if (ok) {
        setList((prev) =>
          prev.filter((i) => i.wishedItemId !== item.wishedItemId),
        );
      }
    }
    setRemovingId(null);
  };

  if (list.length === 0) {
    return (
      <p className="text-gray-500 text-center py-12">
        Your wishlist is now empty.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {list.map((item) => (
        <div
          key={item.wishedItemId}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden group relative"
        >
          <Link href={`${basePath}/products/${item.productSlug}`}>
            <div className="relative aspect-square bg-gray-100">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.productName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                  No image
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm text-gray-900 line-clamp-2 mb-1">
                {item.productName}
              </p>
              {item.displayPrice && (
                <p className="text-sm font-medium text-gray-900">
                  {item.displayPrice}
                </p>
              )}
            </div>
          </Link>
          <button
            type="button"
            onClick={() => handleRemove(item)}
            disabled={removingId === item.wishedItemId}
            aria-label={`Remove ${item.productName} from wishlist`}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      ))}
    </div>
  );
}
