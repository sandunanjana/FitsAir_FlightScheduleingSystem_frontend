import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change if your backend runs elsewhere
const API_PROXY_TARGET = 'http://localhost:8080';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: API_PROXY_TARGET,
                changeOrigin: true
            }
        }
    }
})
