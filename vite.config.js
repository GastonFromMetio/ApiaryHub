import path from 'node:path';
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        tailwindcss(),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        return undefined;
                    }

                    if (
                        id.includes('/react/')
                        || id.includes('/react-dom/')
                        || id.includes('/scheduler/')
                        || id.includes('/radix-ui/')
                        || id.includes('/@floating-ui/')
                        || id.includes('/lucide-react/')
                    ) {
                        return 'framework-vendor';
                    }

                    if (
                        id.includes('/leaflet/')
                        || id.includes('/react-leaflet/')
                        || id.includes('/@react-leaflet/')
                    ) {
                        return 'maps-vendor';
                    }

                    return 'vendor';
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
