import path from 'path';

import react from '@vitejs/plugin-react';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        globals: false,
        css: false,
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules/**', '.next/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/**/*.d.ts',
                'src/**/*.{test,spec}.{ts,tsx}',
                'src/app/**',
            ],
        },
    },
});
