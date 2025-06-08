import type {NextConfig} from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['localhost'], // Add any external image domains here
    },
    typescript: {
        // Enable type checking during build for better code quality
        // This ensures type safety in production builds
        ignoreBuildErrors: false,
    },
    // Enable standalone output mode for Docker deployment
    output: 'standalone',
};

export default nextConfig;
