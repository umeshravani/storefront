"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";
import { ShareModal } from "./ShareModal";

interface ShareButtonProps {
  title: string;
  buttonVariant?: "icon" | "inline";
}

export function ShareButton({
  title,
  buttonVariant = "icon",
}: ShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      {buttonVariant === "inline" ? (
        <button
          type="button"
          onClick={handleClick}
          aria-label="Share this product"
          className="inline-flex items-center gap-2 text-gray-700 hover:text-black cursor-pointer text-sm font-medium transition-colors"
        >
          <Share2 className="w-[18px] h-[18px] text-gray-900" strokeWidth={2} />
          Share
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          aria-label="Share this product"
          className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow-sm hover:bg-white transition-colors cursor-pointer"
        >
          <Share2 className="w-[18px] h-[18px] text-gray-900" strokeWidth={2} />
        </button>
      )}

      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
      />
    </>
  );
}
