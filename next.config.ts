import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      // Supabase Storage — public product images.
      // Replace with your actual project ref, or set NEXT_PUBLIC_SUPABASE_URL
      // and this pattern will match it automatically at build time below.
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
