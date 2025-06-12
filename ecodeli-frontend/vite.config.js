import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    // Ajout de la configuration CORS pour permettre la communication avec le backend
    cors: true,
    // Configuration de proxy pour les appels API vers le backend
    proxy: {
      '/api': {
        target: 'http://ecodeli-backend:8000',
        changeOrigin: true
      }
    }
  }
})
