import type { Category } from "@spree/sdk";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { POLICY_LINKS } from "@/lib/constants/policies";
import { getStoreDescription, getStoreName } from "@/lib/store";
import logo from "../../../public/wallx.svg";
import paymenticons from "../../../public/paymenticons.svg";

const storeName = getStoreName();
const storeDescription = getStoreDescription();

interface FooterProps {
  rootCategories: Category[];
  basePath: string;
  locale: Locale;
}

export async function Footer({
  rootCategories,
  basePath,
  locale,
}: FooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tp = await getTranslations({ locale, namespace: "policies" });

  return (
    <footer className="bg-black text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href={basePath || "/"} className="flex items-center min-w-0">
              <Image
                src="/wallx.svg"
                alt={storeName}
                width={90}
                height={32}
                className="object-contain w-[90px] h-auto invert"
                fetchPriority="high"
                loading="eager"
              />
            </Link>
            <p className="mt-4 text-sm text-neutral-400">
              {t("description") || storeDescription}
            </p>
            {/* Updated Payment Icons */}
            <Image
              src="/paymenticons.svg"
              alt={`${storeName} accepted payment methods`}
              width={90}
              height={32}
              className="object-contain w-full max-w-[280px] h-auto mt-8"
              fetchPriority="high"
              loading="eager"
            />
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
                  className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  {t("allProducts")}
                </Link>
              </li>
              {rootCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`${basePath}/c/${category.permalink}`}
                    className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
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
                  className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  {t("myAccount")}
                </Link>
              </li>
              <li>
                <Link
                  href={`${basePath}/account/orders`}
                  className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  {t("orderHistory")}
                </Link>
              </li>
              <li>
                <Link
                  href={`${basePath}/cart`}
                  className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  {t("cart")}
                </Link>
              </li>
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
                    className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    {tp(policy.nameKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-800 text-xs text-neutral-400 text-center">
          <p>
            &copy; {new Date().getFullYear()} {storeName}. {t("abrandof")}{" "}
            <Link
              href="https://artolika.com"
              target="_blank"
              className="text-neutral-400 hover:text-neutral-200 underline transition-colors"
            >
              Artolika.Inc
            </Link>{" "}
          </p>
        </div>
      </div>
    </footer>
  );
}
