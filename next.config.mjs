/** @type {import('next').NextConfig} */
const nextConfig = {
  // onnxruntime-node and sharp are still needed for the simplified version
  serverExternalPackages: ["onnxruntime-node", "sharp"]
};

export default nextConfig;
