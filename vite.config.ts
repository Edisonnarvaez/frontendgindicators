//import { defineConfig } from 'vite';
//import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
//export default defineConfig({
//  plugins: [react()],
//  server: {
//    port: 5173, //puerto definido
//    host: 'localhost',
//  },
//});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
