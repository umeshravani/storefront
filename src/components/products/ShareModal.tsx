"use client";

import {
  Check,
  Copy,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Twitter,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function ShareModal({ isOpen, onClose, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.href);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm relative z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 m-0">Copy link</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors outline-none cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Copy Link Row */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
              <span className="text-sm text-gray-600 truncate">{url}</span>
            </div>
            <button
              onClick={handleCopy}
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-gray-900 text-white hover:bg-black transition-colors cursor-pointer"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <h6 className="text-sm font-medium text-gray-900 mb-4 m-0">Share:</h6>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() =>
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                  "facebook-share-dialog",
                  "width=436,height=436",
                )
              }
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:text-black hover:border-gray-300 transition-colors cursor-pointer"
              aria-label="Share on Facebook"
            >
              <Facebook className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                window.open(
                  `http://twitter.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
                  "twitter-share-dialog",
                  "width=436,height=436",
                )
              }
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:text-black hover:border-gray-300 transition-colors cursor-pointer"
              aria-label="Share on Twitter"
            >
              <Twitter className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
                  "linkedin-share-dialog",
                  "width=436,height=436",
                )
              }
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:text-black hover:border-gray-300 transition-colors cursor-pointer"
              aria-label="Share on LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + url)}`,
                  "whatsapp-share-dialog",
                  "width=436,height=436",
                )
              }
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:text-black hover:border-gray-300 transition-colors cursor-pointer"
              aria-label="Share on WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <a
              href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:text-black hover:border-gray-300 transition-colors cursor-pointer"
              aria-label="Share via Email"
            >
              <Mail className="w-5 h-5" />
            </a>
            <button
              onClick={() =>
                window.open(
                  `http://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
                  "pinterest-share-dialog",
                  "width=436,height=436",
                )
              }
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:text-black hover:border-gray-300 transition-colors cursor-pointer relative"
              aria-label="Share on Pinterest"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.41 2.967 7.41 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.366 18.602 0 12.017 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
