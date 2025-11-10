/** @type {import('next').NextConfig} */
const nextConfig = {
    // Allows production builds to complete even if ESLint reports errors
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
