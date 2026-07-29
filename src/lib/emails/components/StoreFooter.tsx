import { Link, Section, Text } from "@react-email/components";
import type React from "react";

interface StoreFooterProps {
  storeName: string;
  storeUrl?: string;
}

export function StoreFooter({ storeName, storeUrl }: StoreFooterProps) {
  return (
    <Section style={footerSection}>
      <Text style={footerText}>
        {storeName}
        {storeUrl && (
          <>
            {" - "}
            <Link href={storeUrl} style={footerLink}>
              {storeUrl.replace(/^https?:\/\//, "")}
            </Link>
          </>
        )}
      </Text>
      {storeUrl && (
        <Text style={footerLinks}>
          <Link
            href={`${storeUrl}/policies/shipping-policy`}
            style={footerLink}
          >
            Shipping Policy
          </Link>
          {" | "}
          <Link href={`${storeUrl}/policies/privacy-policy`} style={footerLink}>
            Privacy Policy
          </Link>
          {" | "}
          <Link href={`${storeUrl}/policies/returns-policy`} style={footerLink}>
            Returns Policy
          </Link>
          {" | "}
          <Link
            href={`${storeUrl}/policies/terms-of-service`}
            style={footerLink}
          >
            Terms of Service
          </Link>
        </Text>
      )}
    </Section>
  );
}

const footerSection: React.CSSProperties = {
  marginTop: "32px",
  textAlign: "center" as const,
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  marginBottom: "8px",
};

const footerLinks: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
};

const footerLink: React.CSSProperties = {
  color: "#9ca3af",
  textDecoration: "underline",
};
