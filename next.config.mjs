/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // Cho phép Server Actions khi chạy sau tunnel công khai (test) + local
  experimental: {
    serverActions: {
      allowedOrigins: ["*.trycloudflare.com", "localhost:3000", "127.0.0.1:3000"],
    },
  },
};

export default nextConfig;
