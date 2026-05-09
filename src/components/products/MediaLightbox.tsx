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
  // 1. Store the initial index so it doesn't change during renders
  const initialIndexRef = useRef(activeIndex);

  // 2. Store the functions in refs so we can call the latest version of them
  // without triggering the useEffect cleanup routine!
  const onCloseRef = useRef(onClose);
  const onNavigateRef = useRef(onNavigate);

  // Keep refs updated behind the scenes if the parent re-renders
  useEffect(() => {
    onCloseRef.current = onClose;
    onNavigateRef.current = onNavigate;
  }, [onClose, onNavigate]);

  // 3. The Main Initialization
  useEffect(() => {
    let lightbox: PhotoSwipeLightbox | null = new PhotoSwipeLightbox({
      dataSource: images.map((img) => ({
        src: img.xlarge_url || img.large_url || img.original_url || "",
        width: 0,
        height: 0,
        alt: img.alt || productName,
      })),
      pswpModule: () => import("photoswipe"),
      initialIndex: initialIndexRef.current,
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
        img.src = content.data.src;
      }
    });

    lightbox.on("change", () => {
      if (lightbox?.pswp) {
        // Call the ref instead of the raw prop
        onNavigateRef.current(lightbox.pswp.currIndex);
      }
    });

    lightbox.on("destroy", () => {
      // Call the ref instead of the raw prop
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
    // 4. THE MAGIC FIX: The empty array [] tells React "DO NOT re-run this ever."
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
