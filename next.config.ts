import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um buildId único por commit — garante que o cliente invalida o cache
  // após cada deploy e elimina o erro "Failed to find Server Action".
  generateBuildId: async () => {
    return process.env.VERCEL_GIT_COMMIT_SHA ?? `local-${Date.now()}`;
  },
};

export default nextConfig;
