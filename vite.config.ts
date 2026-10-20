import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// VITE_TARGET=artifact → relative asset paths + hash router (the claude.ai preview and the GitHub Pages build)
// VITE_TARGET=shopify  → one sassmi.js + one sassmi.css with fixed names, hash router, store open;
//                        scripts/shopify-theme.ts then wraps them in a Liquid theme (see LAUNCH-KIT.md → Shopify)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_TARGET
  const isArtifact = target === 'artifact'
  const isShopify = target === 'shopify'
  return {
    plugins: [react(), tailwindcss()],
    base: isArtifact || isShopify ? './' : '/',
    envDir: false, // the client needs no .env values; also stops Vite restarting (and dropping its port) when .env is edited
    // STORE_OPEN override (shared/config.ts): the Shopify build is always "open" — Shopify's password page hides it until launch
    define: { __STORE_OPEN__: JSON.stringify(isShopify || env.VITE_STORE_OPEN === '1') },
    build: {
      outDir: isShopify ? 'dist-shopify' : isArtifact ? 'dist-artifact' : 'dist',
      sourcemap: false,
      target: 'es2020',
      // Shopify's assets/ folder is flat and files are referenced by fixed name from theme.liquid, so no hashed chunks
      ...(isShopify && {
        copyPublicDir: false, // the packager flattens public/ into assets/ itself
        chunkSizeWarningLimit: 900, // one deliberate bundle
        rolldownOptions: {
          output: {
            codeSplitting: false, // one sassmi.js; Shopify assets are referenced by name, not by hashed chunk
            entryFileNames: 'sassmi.js',
            chunkFileNames: 'sassmi-[name].js',
            assetFileNames: (a: { names?: string[]; name?: string }) =>
              (a.names?.[0] ?? a.name ?? '').endsWith('.css') ? 'sassmi.css' : 'sassmi-[name][extname]',
          },
        },
      }),
    },
    server: {
      port: 5173,
      watch: { ignored: ['**/dist/**', '**/dist-artifact/**', '**/dist-shopify/**', '**/data/**', '**/.claude/**'] },
      proxy: {
        '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
      },
    },
  }
})
