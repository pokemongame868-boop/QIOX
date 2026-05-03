/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "object.pscloud.io",
      },
      {
        protocol: "https",
        hostname: "gadgetstore.kz",
      },
    ],
  },
};

module.exports = nextConfig;
