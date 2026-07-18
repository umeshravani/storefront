"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  addToWishlist,
  getWishlistStatus,
  removeFromWishlist,
} from "@/lib/data/wishlist";

interface WishlistButtonProps {
  variantId: string | number;
  basePath: string;
  currentPath: string;
}

export function WishlistButton({
  variantId,
  basePath,
  currentPath,
}: WishlistButtonProps) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [wishedItemId, setWishedItemId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    let cancelled = false;
    getWishlistStatus(String(variantId)).then((status) => {
      if (cancelled || !status) return;
      setIsSaved(status.isSaved);
      setWishlistId(status.wishlistId);
      setWishedItemId(status.wishedItemId);
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading, variantId]);

  const handleClick = async () => {
    if (authLoading || busy) return;

    // Guests are prompted to log in before saving anything.
    if (!isAuthenticated) {
      const returnTo = encodeURIComponent(currentPath);
      router.push(`${basePath}/account?redirect=${returnTo}`);
      return;
    }

    setBusy(true);
    try {
      // Don't trust component state alone — the background fetch on mount
      // may not have resolved yet (e.g. right after a login redirect).
      // Always confirm the current status fresh before acting.
      const status = await getWishlistStatus(String(variantId));
      if (!status) return;

      if (status.isSaved && status.wishedItemId) {
        const ok = await removeFromWishlist(
          status.wishlistId,
          status.wishedItemId,
        );
        if (ok) {
          setIsSaved(false);
          setWishedItemId(null);
          setWishlistId(status.wishlistId);
        }
      } else {
        const ok = await addToWishlist(status.wishlistId, String(variantId));
        if (ok) {
          const updated = await getWishlistStatus(String(variantId));
          if (updated) {
            setIsSaved(updated.isSaved);
            setWishedItemId(updated.wishedItemId);
            setWishlistId(updated.wishlistId);
          }
        } else {
          console.error("Failed to add item to wishlist", {
            variantId,
            wishlistId: status.wishlistId,
          });
        }
      }
    } catch (err) {
      console.error("Wishlist toggle failed", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isSaved}
      className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow-sm hover:bg-white transition-colors disabled:opacity-60"
    >
      <Heart
        className="w-[18px] h-[18px]"
        strokeWidth={2}
        fill={isSaved ? "#F07867" : "none"}
        color={isSaved ? "#F07867" : "#1a1a1a"}
      />
    </button>
  );
}
