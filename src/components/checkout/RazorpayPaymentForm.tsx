"use client";

import { useCallback, useEffect, useState } from "react";
import Script from "next/script";
import { CircleAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface RazorpayPaymentFormHandle {
  confirmPayment: (returnUrl: string) => Promise<{ error?: string }>;
}

interface RazorpayPaymentFormProps {
  amount: number;
  currency: string;
  clientKey: string;
  orderId: string; // Razorpay Order ID from the Spree Payment Session
  customerName?: string;
  customerEmail?: string;
  customerContact?: string;
  themeColor?: string;
  onReady: (handle: RazorpayPaymentFormHandle) => void;
  onSuccess: (paymentId: string, signature: string) => Promise<void>;
}

export function RazorpayPaymentForm({
  amount,
  currency,
  clientKey,
  orderId,
  customerName = "",
  customerEmail = "",
  customerContact = "",
  themeColor = "#2e5bff",
  onReady,
  onSuccess,
}: RazorpayPaymentFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const confirmPayment = useCallback(
    (returnUrl: string): Promise<{ error?: string }> => {
      return new Promise((resolve) => {
        if (!isScriptLoaded || !(window as any).Razorpay) {
          resolve({ error: "Razorpay SDK failed to load. Please refresh." });
          return;
        }

        setError(null);

        const options = {
          key: clientKey,
          amount: amount,
          currency: currency,
          name: "Checkout",
          order_id: orderId,
          handler: async function (response: any) {
            try {
              // Send the signatures to the Next.js Server Action
              await onSuccess(
                response.razorpay_payment_id,
                response.razorpay_signature
              );
              resolve({});
            } catch (err: any) {
              resolve({ error: err.message || "Payment verification failed" });
            }
          },
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerContact,
          },
          theme: {
            color: themeColor,
          },
          modal: {
            ondismiss: function () {
              resolve({ error: "Payment was cancelled by the user." });
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          resolve({ error: response.error.description });
        });
        
        rzp.open();
      });
    },
    [isScriptLoaded, clientKey, amount, currency, orderId, customerName, customerEmail, customerContact, themeColor, onSuccess]
  );

  useEffect(() => {
    if (isScriptLoaded) {
      onReady({ confirmPayment });
    }
  }, [isScriptLoaded, confirmPayment, onReady]);

  return (
    <div>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setIsScriptLoaded(true)}
      />
      
      {error && (
        <Alert variant="destructive" className="mt-3">
          <CircleAlert className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <p className="text-sm text-gray-600 mt-2 text-center">
        A secure window will open for you to complete your payment.
      </p>
    </div>
  );
}
