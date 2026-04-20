"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface RazorpayAffordabilityProps {
  amount: number;
  currency?: string;
  clientKey: string;
}

export function RazorpayAffordability({
  amount,
  currency = "INR",
  clientKey,
}: RazorpayAffordabilityProps) {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!clientKey || amount <= 0) return;
    if (initializedRef.current) return;

    const initWidget = () => {
      const container = document.getElementById("razorpay-affordability-widget");
      if (!container) return;
      
      // Prevent double-rendering in React Strict Mode
      if (container.innerHTML.trim() !== "") return;

      try {
        const suite = new (window as any).RazorpayAffordabilitySuite({
          key: clientKey,
          amount: amount,
          currency: currency,
          display: {
            widget: {
              main: {
                heading: { color: "#000000", fontSize: "14px" },
                content: { backgroundColor: "#ffffff", color: "#000000" },
                discount: { color: "#e60099" },
                link: { button: true, color: "#000000" },
              }
            },
            offers: true,
            emi: true,
            cardlessEmi: true,
            paylater: true,
          },
        });

        // Call without arguments! The library natively hunts for the ID.
        suite.render();
        initializedRef.current = true;
      } catch (err) {
        console.error("Razorpay Widget Error:", err);
      }
    };

    // Robust Polling mechanism (mimicking your Rails logic)
    const check = setInterval(() => {
      if ((window as any).RazorpayAffordabilitySuite) {
        clearInterval(check);
        initWidget();
      }
    }, 100);

    return () => clearInterval(check);
  }, [amount, currency, clientKey]);

  if (!clientKey || amount <= 0) return null;

  return (
    <div className="w-full my-4 min-h-[100px]">
      <Script 
        src="https://cdn.razorpay.com/widgets/affordability/affordability.js" 
        strategy="lazyOnload"
      />
      {/* The ID here is exactly what Razorpay expects to find */}
      <div id="razorpay-affordability-widget" />
    </div>
  );
}
