/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase body size limit for file uploads (default is 1MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "55mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "shadcnblocks.com" },
      { protocol: "https", hostname: "api.app.brrrrloans.com" },
      { protocol: "https", hostname: "assets.vercel.com" },
      { protocol: "https", hostname: "supabase.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
    ],
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
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
