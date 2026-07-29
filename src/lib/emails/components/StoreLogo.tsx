import { Img, Section } from "@react-email/components";
import type React from "react";

interface StoreLogoProps {
  storeUrl?: string;
}

export function StoreLogo({ storeUrl }: StoreLogoProps) {
  if (!storeUrl) return null;

  return (
    <Section style={logoSection}>
      <Img
        src={`${storeUrl}/wallx.png`}
        width="150"
        height="50"
        alt="Store Logo"
        style={logoImage}
      />
    </Section>
  );
}

const logoSection: React.CSSProperties = {
  marginTop: "16px",
  marginBottom: "16px",
};

const logoImage: React.CSSProperties = {
  display: "block",
  margin: "0 auto",
  objectFit: "contain",
};
