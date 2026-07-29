import { BadgeDollarSign, History, Zap } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { isWholesaleEnabled } from "@/lib/spree";

interface WholesaleSectionProps {
  basePath: string;
  locale: string;
}

/**
 * Trade portal pitch on the homepage. Static by design — no data fetching, so
 * the statically prerendered homepage stays static. The slate band matches the
 * wholesale portal's chrome, tying the two surfaces together.
 */
export async function WholesaleSection({
  basePath,
  locale,
}: WholesaleSectionProps) {
  // Opt-in addon: no wholesale pitch on DTC-only storefronts.
  if (!isWholesaleEnabled()) return null;

  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  const benefits = [
    {
      title: t("wholesaleBenefitPricingTitle"),
      description: t("wholesaleBenefitPricingDescription"),
      Icon: BadgeDollarSign,
    },
    {
      title: t("wholesaleBenefitQuickOrderTitle"),
      description: t("wholesaleBenefitQuickOrderDescription"),
      Icon: Zap,
    },
    {
      title: t("wholesaleBenefitOrdersTitle"),
      description: t("wholesaleBenefitOrdersDescription"),
      Icon: History,
    },
  ];

  return (
    <section className="bg-black text-neutral-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Pitch + CTAs */}
          <div>
            <span className="inline-flex items-center rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-300">
              {t("wholesaleBadge")}
            </span>
            <h2 className="mt-4 text-2xl font-bold text-white">
              {t("wholesaleTitle")}
            </h2>
            <p className="mt-4 text-neutral-300">{t("wholesaleDescription")}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                size="lg"
                asChild
                className="bg-white text-neutral-900 hover:bg-neutral-200"
              >
                <Link href={`${basePath}/business`}>
                  {t("wholesaleCtaPrimary")}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-neutral-600 bg-transparent text-neutral-100 hover:bg-neutral-800 hover:text-white"
              >
                <Link href={`${basePath}/business/apply`}>
                  {t("wholesaleCtaSecondary")}
                </Link>
              </Button>
            </div>
          </div>

          {/* What approved buyers get — two-up on tablets so it doesn't look sparse */}
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {benefits.map(({ title, description, Icon }) => (
              <li
                key={title}
                className="flex items-start gap-4 rounded-lg border border-neutral-800 bg-neutral-800/40 px-5 py-4"
              >
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-neutral-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm text-neutral-300">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
