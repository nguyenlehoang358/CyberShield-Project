
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// export default defineConfig({
//     plugins: [react()],
//     server: {
//         proxy: {
//             '/api': {
//                 target: 'https://127.0.0.1:8443',
//                 changeOrigin: true,
//                 secure: false, // For self-signed certs
//             },
//             '/oauth2': {
//                 target: 'https://127.0.0.1:8443',
//                 changeOrigin: true,
//                 secure: false,
//             },
//         },
//     },
// })
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'https://localhost:8443', // Trỏ tới Backend HTTPS
        changeOrigin: true,
        secure: false, // <-- DÒNG NÀY CỰC KỲ QUAN TRỌNG
      },
      '/ws': {
        target: 'wss://localhost:8443',
        ws: true,
        secure: false, // <-- Cho cả WebSocket (nếu có)
      }
    }
  }
})
