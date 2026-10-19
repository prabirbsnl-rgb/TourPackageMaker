
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { registerBackupHelperRelay } from './backup-helper-relay.js'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'orbitz-backup-helper-relay',
      configureServer(server) {
        registerBackupHelperRelay(server.middlewares)
      },
    },
  ],
  server: {
    host: '0.0.0.0',
  },
})
