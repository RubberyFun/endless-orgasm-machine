import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import basicSsl from '@vitejs/plugin-basic-ssl' // Enable HTTPS for development
import { viteSingleFile } from "vite-plugin-singlefile"
import { Buffer } from 'buffer'
//import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  define: {
    'global': 'globalThis',
    'process.env': {}
  },
  resolve: {
    alias: {
      'events': 'events',
      'buffer': 'buffer'
    }
  },
  optimizeDeps: {
    include: ['buttplug', 'buffer'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    emptyOutDir: false, // This line prevents clearing the output directory
    outDir: './public', // Output to public directory
  },
  plugins: [
    svelte(), 
    basicSsl(),  // Enable HTTPS for development
    viteSingleFile(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   injectRegister: 'inline',
    //   includeAssets: ['favicon.svg', 'EOM_logo_192.png', 'EOM_logo_512.png'], // Add your assets
    //   devOptions: {
    //     enabled: true
    //   },
    //   manifest: {
    //     name: 'Endless Orgasm Machine',
    //     short_name: 'EOM UI',
    //     description: 'Control interface for the Endless Orgasm Machine',
    //     theme_color: '#ffffff',
    //     icons: [
    //       {
    //         src: 'EOM_logo_192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //       },
    //       {
    //         src: 'EOM_logo_512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //       },
    //     ],
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // Cache all relevant files
    //   },
    // }),
  ]
})

