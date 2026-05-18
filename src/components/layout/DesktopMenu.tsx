import type { Category } from "@spree/sdk";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

interface DesktopMenuProps {
  rootCategories: Category[];
  basePath: string;
  locale: any; 
}

export async function DesktopMenu({ rootCategories, basePath, locale }: DesktopMenuProps) {
  const t = await getTranslations({ locale, namespace: "header" });

  const linkClass = "text-sm font-medium text-gray-700 hover:text-black transition-colors h-16 flex items-center";

  return (
    <nav className="hidden lg:flex items-center justify-center gap-8 h-full">
      <Link href={basePath || "/"} className={linkClass}>
        {t("home")}
      </Link>
      
      <Link href={`${basePath}/products`} className={linkClass}>
        {t("allProducts")}
      </Link>

      {/* Dynamic Categories from Spree */}
      {rootCategories.map((category) =>
        category.children && category.children.length > 0 ? (
          <div key={category.id} className="relative group h-full">
            <button className={`flex items-center gap-1 ${linkClass}`}>
              <span>{category.name}</span>
              <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 hidden group-hover:block min-w-[200px] bg-white shadow-xl border border-gray-100 rounded-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`${basePath}/c/${child.permalink}`}
                  className="block px-4 py-2.5 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <Link
            key={category.id}
            href={`${basePath}/c/${category.permalink}`}
            className={linkClass}
          >
            {category.name}
          </Link>
        )
      )}

      <Link href={`${basePath}/#contact`} className={linkClass}>
        {t("contact")}
      </Link>
    </nav>
  );
}
