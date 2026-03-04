/** @type {import('next').NextConfig} */
const nextConfig = {
  // 'standalone' output is enabled in Docker builds via NEXT_STANDALONE=true
  // On Windows dev, symlinks are restricted so we leave it off locally.
  ...(process.env.NEXT_STANDALONE === 'true' && { output: 'standalone' }),
};

export default nextConfig;
