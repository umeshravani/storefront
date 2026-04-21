/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "thewallx.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
