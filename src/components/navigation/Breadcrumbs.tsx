import type { Category } from "@spree/sdk";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

interface BreadcrumbsProps {
  category: Category;
  basePath: string;
  productName?: string;
  locale: string;
}

export async function Breadcrumbs({
  category,
  basePath,
  productName,
  locale,
}: BreadcrumbsProps) {
  // Safe cast to any if you don't have the Locale type imported locally
  const t = await getTranslations({
    locale: locale as any,
    namespace: "navigation",
  });

  // Build breadcrumb items strictly from the category hierarchy (No "Home")
  const items: { name: string; href: string; isCurrent: boolean }[] = [];

  // 1. Add ancestors (from root to parent)
  if (category.ancestors && category.ancestors.length > 0) {
    category.ancestors.forEach((ancestor) => {
      items.push({
        name: ancestor.name,
        href: `${basePath}/c/${ancestor.permalink}`,
        isCurrent: false,
      });
    });
  }

  // 2. Add current category
  // If we are on a Product Page, the category acts as a "back" link, so it's NOT the current page.
  // If we are on a Category Page, it IS the current page.
  items.push({
    name: category.name,
    href: `${basePath}/c/${category.permalink}`,
    isCurrent: !productName,
  });

  return (
    <nav aria-label={t("breadcrumb")} className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
            {item.isCurrent ? (
              <span className="text-gray-900 font-medium" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-gray-900 transition-colors"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
