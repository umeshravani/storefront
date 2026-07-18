"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const url = window.location.href;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled the native share sheet — no action needed.
      }
      return;
    }

    // Desktop / unsupported browsers: copy the link instead.
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — silently ignore.
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Share this product"
      className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
    >
      {copied ? (
        <Check className="w-[18px] h-[18px] text-green-600" strokeWidth={2} />
      ) : (
        <Share2 className="w-[18px] h-[18px] text-gray-900" strokeWidth={2} />
      )}
    </button>
  );
}
