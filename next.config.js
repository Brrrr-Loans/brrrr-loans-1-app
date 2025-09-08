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
