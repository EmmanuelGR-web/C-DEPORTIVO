import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import leerDocumento from './api/leer-documento.js'

const apiLocal = {
  name: 'api-local',
  configureServer(server) {
    server.middlewares.use('/api/leer-documento', leerDocumento)
  },
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const variables = loadEnv(mode, process.cwd(), 'GEMINI_')
  Object.assign(process.env, variables)
  return {
    plugins: [react(), apiLocal],
  }
})
