import type { Metadata } from "next";
import { CategorySlider } from "@/components/home/CategorySlider";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { HeroSection } from "@/components/home/HeroSection";
// 1. Import your two new custom components
import { IconBox } from "@/components/home/IconBox";
import { QuoteSection } from "@/components/home/QuoteSection";
import { RichTextSection } from "@/components/home/RichTextSection";
import { WholesaleSection } from "@/components/home/WholesaleSection";

import { getMarkets, resolveCurrency } from "@/lib/data/markets";
import { generateHomeMetadata } from "@/lib/metadata/home";

interface HomePageProps {
  params: Promise<{
    country: string;
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { country, locale } = await params;
  return generateHomeMetadata({ country, locale });
}

export default async function HomePage({ params }: HomePageProps) {
  const { country, locale } = await params;
  const basePath = `/${country}/${locale}`;
  const currency = await resolveCurrency(country);

  return (
    <main>
      {/* The Hero Slider */}
      <HeroSection basePath={basePath} locale={locale} />

      {/* 2. Your new Icon Grid */}
      <IconBox />

      {/* 3. Your new Horizontal Category Slider */}
      <CategorySlider />

      {/* The new Rich Text Section */}
      <RichTextSection basePath={basePath} />

      {/* Spree's native Featured Products Section */}
      <FeaturedProductsSection
        basePath={basePath}
        locale={locale}
        country={country}
        currency={currency}
      />
      <WholesaleSection basePath={basePath} locale={locale} />

      {/* Insert the Quote Section here */}
      <QuoteSection basePath={basePath} />
    </main>
  );
}
