import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    RIOT_API_KEY: process.env.RIOT_API_KEY,
  },
};

export default nextConfig;
