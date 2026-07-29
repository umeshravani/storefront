import type { Category } from "@spree/sdk";
import {
  BadgeCheck,
  Facebook,
  Headset,
  HeartHandshake,
  Instagram,
  Mail,
  MessageCircle,
  Phone,
  Sprout,
  Twitter,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";
import { CurrentYear } from "@/components/ui/CurrentYear";
import { POLICY_LINKS } from "@/lib/constants/policies";
import { isWholesaleEnabled } from "@/lib/spree";
import { getStoreDescription, getStoreName } from "@/lib/store";

const storeName = getStoreName();
const storeDescription = getStoreDescription();

interface FooterProps {
  basePath: string;
  locale: Locale;
  categoryLinks: ReactNode;
}

interface FooterCategoryLinksProps {
  rootCategories: Category[];
  basePath: string;
}

export function FooterCategoryLinks({
  rootCategories,
  basePath,
}: FooterCategoryLinksProps) {
  return rootCategories.map((category) => (
    <li key={category.id}>
      <Link
        href={`${basePath}/c/${category.permalink}`}
        className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        {category.name}
      </Link>
    </li>
  ));
}

export async function Footer({ basePath, locale, categoryLinks }: FooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tp = await getTranslations({ locale, namespace: "policies" });
  const wholesaleEnabled = isWholesaleEnabled();

  return (
    <footer className="bg-black text-gray-300">
      {/* Browsers won't render gradients if display: none is applied.*/}
      <svg
        style={{ position: "absolute", width: 0, height: 0 }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="gold-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop stopColor="#FFF59D" offset="0%" />
            <stop stopColor="#FBC02D" offset="100%" />
          </linearGradient>
        </defs>
      </svg>

      {/* Trust Badges / Value Props Section */}
      <div className="border-b border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <HeartHandshake
                size={32}
                stroke="url(#gold-gradient)"
                className="shrink-0 mt-1"
              />
              <div>
                <h4 className="text-white font-medium text-lg">
                  Empowering Creators
                </h4>
                <p className="text-neutral-400 text-sm mt-1">
                  Every acquisition directly supports independent artists.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <BadgeCheck
                size={32}
                stroke="url(#gold-gradient)"
                className="shrink-0 mt-1"
              />
              <div>
                <h4 className="text-white font-medium text-lg">
                  Certified Original
                </h4>
                <p className="text-neutral-400 text-sm mt-1">
                  Copyrighted masterworks with guaranteed provenance.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Sprout
                size={32}
                stroke="url(#gold-gradient)"
                className="shrink-0 mt-1"
              />
              <div>
                <h4 className="text-white font-medium text-lg">
                  Sustainable Luxury
                </h4>
                <p className="text-neutral-400 text-sm mt-1">
                  Eco-conscious craftsmanship using premium materials.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Headset
                size={32}
                stroke="url(#gold-gradient)"
                className="shrink-0 mt-1"
              />
              <div>
                <h4 className="text-white font-medium text-lg">24/7 Support</h4>
                <p className="text-neutral-400 text-sm mt-1">
                  Expert guidance from custom design to delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Footer Content --- */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* Brand & Contact */}
          <div className="col-span-1 md:col-span-2">
            {/* Animated Masked Logo */}
            <Link
              href={basePath || "/"}
              aria-label={storeName}
              className="block min-w-0"
            >
              <AnimatedLogo className="w-[90px] h-[32px]" variant="silver" />
            </Link>

            <p className="mt-4 text-sm text-neutral-400 max-w-sm">
              {t("description") || storeDescription}
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <a
                href="mailto:care@thewallx.com"
                className="flex items-center gap-3 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                <Mail className="size-4" />
                care@thewallx.com
              </a>
              <a
                href="tel:+918976897691"
                className="flex items-center gap-3 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                <Phone className="size-4" />
                +91 8976 8976 91
              </a>
            </div>

            {/* Social Media Icons */}
            <div className="mt-6 flex items-center gap-4">
              <a
                href="https://facebook.com/thewallxstore"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Facebook className="size-5" />
              </a>
              <a
                href="https://instagram.com/thewallxstore"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="https://twitter.com/thewallxstore"
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Twitter className="size-5" />
              </a>
              <a
                href="https://youtube.com/@thewallxstore"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Youtube className="size-5" />
              </a>
              <a
                href="https://wa.me/+918976897691"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <MessageCircle className="size-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-medium text-neutral-300">
              {t("shop")}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={`${basePath}/products`}
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  {t("allProducts")}
                </Link>
              </li>
              {categoryLinks}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-medium text-neutral-300">
              {t("account")}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={`${basePath}/account`}
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  {t("myAccount")}
                </Link>
              </li>
              <li>
                <Link
                  href={`${basePath}/account/orders`}
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  {t("orderHistory")}
                </Link>
              </li>
              <li>
                <Link
                  href={`${basePath}/cart`}
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  {t("cart")}
                </Link>
              </li>
              {wholesaleEnabled && (
                <li>
                  <Link
                    href={`${basePath}/business`}
                    className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    {t("wholesale")}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-medium text-neutral-300">
              {t("policies")}
            </h3>
            <ul className="mt-4 space-y-3">
              {POLICY_LINKS.map((policy) => (
                <li key={policy.slug}>
                  <Link
                    href={`${basePath}/policies/${policy.slug}`}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {tp(policy.nameKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col-reverse md:flex-row items-center justify-between gap-6">
          <div className="text-xs text-neutral-400 text-center md:text-left">
            <p>
              &copy; <CurrentYear /> {storeName}. {t("abrandof")}{" "}
              <Link
                href="https://artolika.com"
                target="_blank"
                className="text-neutral-400 hover:text-white underline transition-colors"
              >
                Artolika.Inc
              </Link>
            </p>
          </div>

          <div>
            <Image
              src="/paymenticons.svg"
              alt={`${storeName} accepted payment methods`}
              width={240}
              height={28}
              className="object-contain h-7 w-auto"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
