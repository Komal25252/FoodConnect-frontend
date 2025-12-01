import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
 base: './',                   // relative assets paths
  build: {
    outDir: '.',                // write build files into the client root
    emptyOutDir: false,         // be careful; prevents wiping client sources if you want to keep them
    assetsDir: 'assets',        // default, can keep
  },
  plugins: [react()],
  server: {
    port: 5173, // default Vite port
  },
})
