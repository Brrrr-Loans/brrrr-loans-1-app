/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "shadcnblocks.com" },
      { protocol: "https", hostname: "api.app.brrrrloans.com" },
      { protocol: "https", hostname: "assets.vercel.com" },
      { protocol: "https", hostname: "supabase.com" },
      { protocol: "https", hostname: "cdn.builder.io" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
    ],
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://192.168.1.237:3001",
    "https://f0187fe17a45.ngrok-free.app",
    "https://4082e8a3624e.ngrok-free.app",
    "https://builder.io",
    "https://*.builder.io",
    "https://fusion-development.builder.io",
  ],
  // Additional headers for Builder.io integration
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://builder.io",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/dashboard/deals",
        destination: "/deals",
        permanent: true,
      },
      {
        source: "/dashboard/deals/:path*",
        destination: "/deals/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/distributions",
        destination: "/balance-sheet/distributions",
        permanent: true,
      },
      {
        source: "/dashboard/distributions/:path*",
        destination: "/balance-sheet/distributions/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/documents",
        destination: "/balance-sheet/documents",
        permanent: true,
      },
      {
        source: "/dashboard/documents/:path*",
        destination: "/balance-sheet/documents/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/test-uploads",
        destination: "/balance-sheet/documents/test-uploads",
        permanent: true,
      },
      {
        source: "/dashboard/test-uploads/:path*",
        destination: "/balance-sheet/documents/test-uploads/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/transactions",
        destination: "/balance-sheet/transactions",
        permanent: true,
      },
      {
        source: "/dashboard/transactions/:path*",
        destination: "/balance-sheet/transactions/:path*",
        permanent: true,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
