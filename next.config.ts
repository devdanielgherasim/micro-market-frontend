/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
        // Linting is enforced as its own CI stage (`npm run lint`, via eslint.config.mjs)
        // ahead of the build stage, not re-run inside `next build`.
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
                pathname: '/api/**',
            },
        ],
    },
}

module.exports = nextConfig