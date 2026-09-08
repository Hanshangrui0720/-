import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  let base = '/'
  return {
    plugins: [react(), {
      name: 'media-preload-base',
      configResolved(config) { base = config.base },
      transformIndexHtml(html) {
        const mediaBase = (env.VITE_MEDIA_BASE_URL || base).replace(/\/?$/, '/')
        return html.replaceAll('__MEDIA_BASE__', mediaBase)
      },
    }],
    assetsInclude: ['**/*.glb'],
  }
})
