import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    watch: {
      include: ['src/**/*', "public/**/*"],
      exclude: ['node_modules', 'dist', 'build', '.git']
    },
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.ts'),
        contentScript: resolve(__dirname, 'src/contentScript.ts'),
      },
      output: {
        entryFileNames: 'src/[name]/[name].js',
        chunkFileNames: 'assets/js/[name].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name][extname]';
          
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          
          if (/\.(css|scss|sass)$/.test(assetInfo.name)) {
            return 'assets/css/[name][extname]';
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/.test(assetInfo.name)) {
            return 'assets/img/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
      },
    }
  }
})
