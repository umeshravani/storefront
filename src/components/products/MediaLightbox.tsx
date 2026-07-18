"use client";

import type { Media } from "@spree/sdk";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

const SWIPE_THRESHOLD_PX = 50;
const SWIPE_MAX_VERTICAL_PX = 75;

interface MediaLightboxProps {
  images: Media[];
  activeIndex: number;
  productName: string;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

/**
 * Fullscreen image lightbox. Lazy-loaded from MediaGallery so its
 * keyboard handlers, navigation UI, and next/image full-size render
 * don't ship in the initial product page bundle.
 *
 * Exposed as a real modal dialog (role="dialog", aria-modal="true") with
 * focus moved to the close button on open and restored on close so
 * screen-reader and keyboard users can't get stuck in the page behind
 * the overlay.
 */
export function MediaLightbox({
  images,
  activeIndex,
  productName,
  onClose,
  onNavigate,
}: MediaLightboxProps): React.ReactElement | null {
  const t = useTranslations("products");
  const current = images[activeIndex];
  const src =
    current?.xlarge_url || current?.large_url || current?.original_url || null;

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const transformRef = useRef<any>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  // Tracks whether a pointerdown happened on the backdrop itself (vs.
  // bubbled up from a child). Without this, the synthetic click fired
  // by the opening tap on the parent <button> in MediaGallery lands on
  // the freshly-mounted backdrop and immediately closes the lightbox
  // on mobile.
  const goPrev = useCallback(() => {
    onNavigate(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
  }, [activeIndex, images.length, onNavigate]);

  const goNext = useCallback(() => {
    onNavigate(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
  }, [activeIndex, images.length, onNavigate]);

  // Handle native swipe gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only register single-finger touches for swiping (ignore pinches)
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!start || images.length <= 1) return;

      // Check current zoom level. If zoomed in, allow panning instead of swiping.
      const scale = transformRef.current?.state?.scale ?? 1;
      if (scale > 1) return;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;

      if (
        Math.abs(dx) > SWIPE_THRESHOLD_PX &&
        Math.abs(dy) < SWIPE_MAX_VERTICAL_PX
      ) {
        if (dx < 0) {
          goNext(); // Swiped left -> Next
        } else {
          goPrev(); // Swiped right -> Prev
        }
      }
    },
    [goNext, goPrev, images.length],
  );

  // Wait for client-side hydration to safely use createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goPrev, goNext]);

  // Accessibility focus trap
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => {
      previouslyFocused?.focus?.();
    };
  }, []);

  if (!src || !mounted) return null;

  const lightboxContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("openImageZoom")}
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center touch-none"
    >
      <button
        ref={closeButtonRef}
        type="button"
        className="absolute top-4 right-4 z-50 text-white p-3 hover:bg-white/10 rounded-lg transition-colors"
        onClick={onClose}
        aria-label={t("lightboxClose")}
      >
        <X className="w-8 h-8" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white p-3 hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
            onClick={goPrev}
            aria-label={t("lightboxPrev")}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white p-3 hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
            onClick={goNext}
            aria-label={t("lightboxNext")}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Zoom, Pan, & Swipe Wrapper */}
      <div
        className="absolute inset-0 w-full h-full flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={1}
          maxScale={4}
          centerOnInit={true}
          wheel={{ step: 0.1 }}
          doubleClick={{ disabled: false }}
        >
          <TransformComponent
            wrapperStyle={{ width: "100vw", height: "100vh" }}
            contentStyle={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="relative w-full h-full max-w-5xl max-h-[90vh] p-0 sm:p-12">
              <Image
                src={src}
                alt={current?.alt || productName}
                fill
                className="object-contain pointer-events-none"
                sizes="100vw"
                quality={100}
                priority
              />
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-lg text-sm z-50 pointer-events-none">
          {activeIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );

  return createPortal(lightboxContent, document.body);
}
