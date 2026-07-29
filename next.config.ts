import { loadEnvConfig } from "@next/env";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

loadEnvConfig(process.cwd());

const withNextIntl = createNextIntlPlugin();

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
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/rails/active_storage/**",
      },
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
