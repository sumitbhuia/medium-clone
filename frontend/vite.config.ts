import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      visualizer({
        filename: 'dist/stats.html', // The output file for the report
        open: true, // Automatically open the report in the browser after build
        gzipSize: true, // Show the gzipped size of your chunks
        brotliSize: true, // Show the brotli-compressed size
      }),
    ],
    define: {
      'process.env.NEXT_PUBLIC_X_API_KEY' : JSON.stringify(env.NEXT_PUBLIC_X_API_KEY)
    },
  }
})
