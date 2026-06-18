import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // 警告が出るサイズの上限を 500KB から 1000KB (1MB) に引き上げる
    chunkSizeWarningLimit: 1000,
  }
});