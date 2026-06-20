import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  generateBuildId: async () => {
    return process.env.VERCEL_GIT_COMMIT_SHA ?? `local-${Date.now()}`;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/favicon.ico", destination: "/icon.png", permanent: false },
    ];
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "@tiptap/extension-link",
      "@tiptap/extension-placeholder",
      "@tiptap/extension-underline",
      "@tiptap/extension-text-align",
      "@tiptap/extension-text-style",
      "@tiptap/extension-color",
    ],
  },
};

export default nextConfig;
