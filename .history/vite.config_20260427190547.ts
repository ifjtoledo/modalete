import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
    if (command === 'serve') {
        return {
            root: 'demo',
        };
    }

    return {
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
    };
});