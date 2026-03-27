import path from 'node:path';
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

const devPort = Number(process.env.VITE_DEV_PORT ?? 5173);
const devServerUrl = process.env.VITE_DEV_SERVER_URL;
const hmrHost = process.env.VITE_HMR_HOST ?? 'localhost';
const hmrPort = Number(process.env.VITE_HMR_PORT ?? devPort);
const usePolling = process.env.VITE_USE_POLLING === 'true';

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
        host: '0.0.0.0',
        port: devPort,
        strictPort: true,
        origin: devServerUrl,
        cors: {
            origin: [
                'http://localhost:8000',
                'http://127.0.0.1:8000',
            ],
        },
        hmr: {
            host: hmrHost,
            port: hmrPort,
        },
        watch: {
            usePolling,
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
