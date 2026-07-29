import { loadEnvConfig } from "@next/env";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";
import createNextIntlPlugin from "next-intl/plugin";

loadEnvConfig(process.cwd());

const withNextIntl = createNextIntlPlugin();

/**
 * Allow product/asset images served by the configured Spree backend. Spree
 * returns Active Storage URLs on its own host (which may differ from
 * SPREE_API_URL's — e.g. store URL vs API URL, http vs https, with or without a
 * port), so we allow the SPREE_API_URL hostname over both protocols and any
 * port rather than hardcoding specific hosts. Set SPREE_IMAGES_URL when images
 * are served from a different host than the API — e.g. spree.sh puts images
 * behind a CDN (console.spree.sh) — and it takes precedence over SPREE_API_URL.
 * The pathname stays scoped to Active Storage. Falls back to `localhost` when
 * neither variable is set (dev).
 */
function spreeImagePatterns(): RemotePattern[] {
  const raw = (
    process.env.SPREE_IMAGES_URL || process.env.SPREE_API_URL
  )?.trim();
  let hostname = "localhost";
  if (raw) {
    try {
      hostname = new URL(raw).hostname;
    } catch {
      // Malformed URL — keep the localhost fallback.
    }
  }
  const pathname = "/rails/active_storage/**";
  return [
    { protocol: "http", hostname, pathname },
    { protocol: "https", hostname, pathname },
  ];
}

const nextConfig: NextConfig = {
  //output: "standalone",
  allowedDevOrigins: ["shop.lvh.me", "*.trycloudflare.com", "192.168.33.13"],
  env: {
    NEXT_PUBLIC_SENTRY_DSN: process.env.SENTRY_DSN || "",
  },
  transpilePackages: ["@spree/sdk"],
  reactCompiler: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-dialog",
    ],
  },
  turbopack: {
    root: __dirname,
  },
  cacheComponents: true,
  cacheLife: {
    tenMinutes: {
      stale: 300,
      revalidate: 600,
      expire: 3600,
    },
  },
  images: {
    qualities: [25, 50, 75, 85, 100],
    dangerouslyAllowLocalIP: true,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      // Derived from SPREE_IMAGES_URL (if set) or SPREE_API_URL.
      ...spreeImagePatterns(),
      // 👇 Add your new API Subdomains here 👇
      {
        protocol: "https",
        hostname: "server.thewallx.com",
        pathname: "/rails/active_storage/**",
      },
      {
        protocol: "https",
        hostname: "server.artolika.com",
        pathname: "/rails/active_storage/**",
      },
      // ----------------------------------------
      {
        protocol: "https",
        hostname: "**.vendo.dev",
        pathname: "/rails/active_storage/**",
      },
      {
        protocol: "https",
        hostname: "**.spree.sh",
        pathname: "/rails/active_storage/**",
      },
      {
        protocol: "https",
        hostname: "**.trycloudflare.com",
        pathname: "/rails/active_storage/**",
      },
      {
        protocol: "https",
        hostname: "thewallx.com",
        pathname: "/rails/active_storage/**",
      },
      {
        protocol: "https",
        hostname: "www.thewallx.com",
        pathname: "/rails/active_storage/**",
      },
      // Hosted demo / tunnel backends whose image host differs from SPREE_API_URL.
    ],
  },

  redirects: async () => {
    return [
      {
        // Redirect legacy Spree Taxons to Next.js Categories
        source: "/t/:path*",
        destination: "/in/en/c/:path*",
        permanent: true,
      },
      {
        // Redirect legacy Products to Next.js Products
        source: "/products/:slug",
        destination: "/in/en/products/:slug",
        permanent: true,
      },
      {
        // Catch stray root sitemap requests and point them to Next.js chunks
        source: "/sitemap.xml",
        destination: "/sitemap/0.xml",
        permanent: true,
      },
    ];
  },

  rewrites: async () => {
    const baseUrl = (
      process.env.SPREE_API_URL || "http://localhost:3000"
    ).replace(/\/$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${baseUrl}/api/:path*`,
      },
      {
        source: "/api/custom_reviews/:path*",
        destination: `${baseUrl}/api/custom_reviews/:path*`,
      },
      {
        source: "/rails/active_storage/:path*",
        destination: `${baseUrl}/rails/active_storage/:path*`,
      },
    ];
  },
};

const configWithIntl = withNextIntl(nextConfig);

export default process.env.SENTRY_DSN
  ? withSentryConfig(configWithIntl, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,
      widenClientFileUpload: true,
      sourcemaps: {
        deleteSourcemapsAfterUpload: true,
      },
      telemetry: false,
    })
  : configWithIntl;
