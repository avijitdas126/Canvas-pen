import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from 'path'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base:'./',
  
  build:{
    outDir:"dist-react",
    rollupOptions:{
      input:{
        canvas: resolve(__dirname,'canvas.html'),
        sidebar: resolve(__dirname,'index.html'),
        
      }
    }
  },
  server:{
    port:5123,
    strictPort:true
  }
})
