"use client";

import {
  Mail,
  MessageCircle,
  MessageSquareText,
  MessagesSquare,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function HelpCenter() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    if (isModalOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isModalOpen]);

  return (
    <div className="mt-8 pt-8">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <MessagesSquare className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
        </div>
        <div>
          <h4 className="text-base font-medium text-gray-900 m-0 mb-1">
            Help Center?
          </h4>
          <p className="text-sm text-gray-500 m-0 mb-3">
            Book an appointment with our design experts for customisation
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-black transition-colors cursor-pointer"
          >
            Ask a question
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div
            className="absolute inset-0"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 m-0">
                <MessageSquareText className="w-5 h-5" />
                Ask a question
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors outline-none cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 bg-gray-50/50">
              <p className="text-gray-600 mb-6 mt-0 text-sm">
                Choose how you'd like to reach out to our team of experts. We
                typically respond within a few hours.
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href="https://wa.me/918976897691"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-4 bg-white border border-green-200 rounded-xl hover:border-green-400 hover:shadow-sm transition-all group no-underline"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm m-0">
                        WhatsApp Chat
                      </h4>
                      <p className="text-xs text-gray-500 m-0">
                        Chat with an expert directly
                      </p>
                    </div>
                  </div>
                  <span className="text-green-600 font-medium text-sm">
                    Open
                  </span>
                </a>

                <Link
                  href="/contact"
                  className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-sm transition-all group no-underline"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm m-0">
                        Contact Form
                      </h4>
                      <p className="text-xs text-gray-500 m-0">
                        Send us a detailed message
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-900 font-medium text-sm">
                    Write
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
