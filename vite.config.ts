import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// VITE_TARGET=artifact → relative asset paths + hash router (for the claude.ai preview build)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isArtifact = env.VITE_TARGET === 'artifact'
  return {
    plugins: [react(), tailwindcss()],
    base: isArtifact ? './' : '/',
    envDir: false, // the client needs no .env values; also stops Vite restarting (and dropping its port) when .env is edited
    build: {
      outDir: isArtifact ? 'dist-artifact' : 'dist',
      sourcemap: false,
      target: 'es2020',
    },
    server: {
      port: 5173,
      watch: { ignored: ['**/dist/**', '**/dist-artifact/**', '**/data/**', '**/.claude/**'] },
      proxy: {
        '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
      },
    },
  }
})
