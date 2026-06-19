import type { NextConfig } from "next";

// A unique id per deployment (the git commit on Vercel, else a build timestamp).
// Baked into both the client bundle and /api/version, so the client can detect
// when a newer version has been deployed and refresh itself.
const buildId = process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now());

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_BUILD_ID: buildId },
};

export default nextConfig;
