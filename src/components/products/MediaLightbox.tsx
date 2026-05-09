"use client";

import type { Media } from "@spree/sdk";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import { useEffect, useRef } from "react";
import "photoswipe/style.css";

interface MediaLightboxProps {
  images: Media[];
  activeIndex: number;
  productName: string;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

export function MediaLightbox({
  images,
  activeIndex,
  productName,
  onClose,
  onNavigate,
}: MediaLightboxProps): React.ReactElement | null {
  const initialIndexRef = useRef(activeIndex);

  const onCloseRef = useRef(onClose);
  const onNavigateRef = useRef(onNavigate);

  useEffect(() => {
    onCloseRef.current = onClose;
    onNavigateRef.current = onNavigate;
  }, [onClose, onNavigate]);

  useEffect(() => {
    let lightbox: PhotoSwipeLightbox | null = new PhotoSwipeLightbox({
      dataSource: images.map((img) => ({
        src: img.xlarge_url || img.large_url || img.original_url || "",
        width: 0,
        height: 0,
        alt: img.alt || productName,
      })),
      pswpModule: () => import("photoswipe"),
      bgOpacity: 0.95,
      closeOnVerticalDrag: false,
      wheelToZoom: true,
      paddingFn: () => ({ top: 30, bottom: 30, left: 0, right: 0 }),
    });

    lightbox.on("contentLoad", (e) => {
      const { content } = e;
      if (content.type === "image" && content.data.width === 0) {
        const img = new window.Image();
        img.onload = () => {
          content.data.width = img.width;
          content.data.height = img.height;
          if (lightbox?.pswp) {
            lightbox.pswp.refreshSlideContent(content.index);
          }
        };
        // ⬇️ THE FIX: Added || "" to satisfy TypeScript's strict string requirement
        img.src = content.data.src || "";
      }
    });

    lightbox.on("change", () => {
      if (lightbox?.pswp) {
        onNavigateRef.current(lightbox.pswp.currIndex);
      }
    });

    lightbox.on("destroy", () => {
      onCloseRef.current();
    });

    lightbox.init();
    lightbox.loadAndOpen(initialIndexRef.current);

    return () => {
      if (lightbox) {
        lightbox.destroy();
        lightbox = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
