import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/modalete.ts'),
            name: 'Modalete',
            fileName: 'modalete',
        },
        rollupOptions: {
            output: {
                exports: 'named',
            },
        },
    },
});