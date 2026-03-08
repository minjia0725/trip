import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 如果部署到 GitHub Pages 子路徑，取消註解並設定 base
  // base: '/tokyo-trip/',
})
