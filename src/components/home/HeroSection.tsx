import { getTranslations } from "next-intl/server";
import { getStoreName } from "@/lib/store";
import { HeroSlider } from "./HeroSlider"; // Import your new Client Component

interface HeroSectionProps {
  basePath: string;
  locale: string;
}

export async function HeroSection({ basePath, locale }: HeroSectionProps) {
  const t = await getTranslations({
    locale: locale as any,
    namespace: "home",
  });
  
  // We grab the translated text to pass into our client component
  const shopNowText = t("shopNow");

  return (
    <section className="border-b border-gray-200">
      {/* This renders the interactive slider we built.
        It keeps the Server Component architecture clean while giving you a dynamic UI.
      */}
      <HeroSlider basePath={basePath} shopNowText={shopNowText} />
      
      {/* Optional: If you still want that grid of logos from your Flowbite snippet, 
        you can safely paste it right here below the slider! Just remember to change 
        'class=' to 'className=' and make sure all <path> and <svg> tags are properly closed. 
      */}
    </section>
  );
}
