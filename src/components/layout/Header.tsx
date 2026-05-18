import type { Category } from "@spree/sdk";
import { UserRound } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CartButton } from "@/components/layout/CartButton";
import { SearchToggle } from "@/components/layout/SearchToggle";
import { DesktopMenu } from "@/components/layout/DesktopMenu";
import { Button } from "@/components/ui/button";
import { getStoreName } from "@/lib/store";

const LazyMobileMenu = dynamic(
  () =>
    import("@/components/layout/MobileMenu").then((mod) => ({
      default: mod.MobileMenu,
    })),
  {
    loading: () => (
      <div className="inline-flex items-center justify-center h-10 w-10" />
    ),
  },
);

const LazyCountrySwitcher = dynamic(
  () =>
    import("@/components/layout/CountrySwitcher").then((mod) => ({
      default: mod.CountrySwitcher,
    })),
  {
    loading: () => (
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  },
);

const storeName = getStoreName();

interface HeaderProps {
  rootCategories: Category[];
  basePath: string;
  locale: any;
}

export async function Header({
  rootCategories,
  basePath,
  locale,
}: HeaderProps) {
  const t = await getTranslations({ locale, namespace: "header" });

  return (
    <SearchToggle
      basePath={basePath}
      left={
        <div className="flex items-center gap-2">
          {/* Mobile hamburger (Hidden on Desktop) */}
          <div className="lg:hidden">
            <LazyMobileMenu rootCategories={rootCategories} basePath={basePath} />
          </div>

          {/* Desktop Logo (Hidden on Mobile, shifted left to match reference image) */}
          <Link href={basePath || "/"} className="hidden lg:flex items-center min-w-0">
            <Image
              src="/wallx.svg"
              alt={storeName}
              width={90}
              height={32}
              className="object-contain w-[90px] h-auto"
              fetchPriority="high"
              loading="eager"
            />
          </Link>
        </div>
      }
      center={
        <>
          {/* Mobile Logo (Centered on mobile, hidden on desktop) */}
          <Link href={basePath || "/"} className="lg:hidden flex items-center min-w-0">
            <Image
              src="/wallx.svg"
              alt={storeName}
              width={90}
              height={32}
              className="object-contain w-[90px] h-auto"
              fetchPriority="high"
              loading="eager"
            />
          </Link>

          {/* The New Desktop Inline Menu */}
          <DesktopMenu
            rootCategories={rootCategories}
            basePath={basePath}
            locale={locale}
          />
        </>
      }
      rightStart={
        <div className="hidden lg:block">
          <LazyCountrySwitcher />
        </div>
      }
      rightEnd={
        <div className="flex items-center gap-2 md:gap-4">
          {/* Account - Desktop Only (Reverted to standard icon) */}
          <div className="hidden lg:block">
            <Button variant="ghost" size="icon-lg" asChild className="rounded-full">
              <Link href={`${basePath}/account`} aria-label={t("account")}>
                <UserRound className="size-5" />
              </Link>
            </Button>
          </div>

          <CartButton />
        </div>
      }
    />
  );
}
