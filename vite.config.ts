import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Относительные пути к ассетам: сборка работает и в корне домена,
  // и в подпапке (inshinlab.com/yasno/), и на поддомене — без пересборки
  base: './',
  plugins: [react(), tailwindcss()],
})
