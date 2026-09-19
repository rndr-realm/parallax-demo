import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.cosmos.so",
      },
    ],
  },
  turbopack: {
    root: projectRoot,
    rules: {
      "*.glsl": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
      "*.vert": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
      "*.frag": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
      "*.vs": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
      "*.fs": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },
  allowedDevOrigins: ["192.168.100.2"],
};

export default nextConfig;
