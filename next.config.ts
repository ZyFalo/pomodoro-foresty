import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // El SDK de Cloudinary se carga desde node_modules en runtime, no se empaqueta.
  serverExternalPackages: ['cloudinary'],
};

export default nextConfig;
