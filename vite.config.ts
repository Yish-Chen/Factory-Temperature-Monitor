import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? path.basename(process.cwd());
  const base = env.VITE_BASE_PATH || (process.env.GITHUB_ACTIONS === 'true' ? `/${repositoryName}/` : '/');

  return {
    base,
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true
        },
        manifest: {
          name: 'Factory Oven Monitor',
          short_name: 'OvenMon',
          description: 'Factory Oven Temperature Monitoring & OEE Dashboard',
          start_url: base,
          scope: base,
          theme_color: '#1a1a1a',
          background_color: '#000000',
          display: 'standalone',
          icons: [
            {
              src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiB2aWV3Qm94PSIwIDAgMTkyIDE5MiI+PHJlY3Qgd2lkdGg9IjE5MiIgaGVpZ2h0PSIxOTIiIGZpbGw9IiMzMzMiLz48Y2lyY2xlIGN4PSI5NiIgY3k9Ijk2IiByPSI0OCIgZmlsbD0iI2ZmNSIvPjwvc3ZnPg==',
              sizes: '192x192',
              type: 'image/svg+xml'
            },
            {
              src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PHJlY3Qgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIGZpbGw9IiMzMzMiLz48Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjEyOCIgZmlsbD0iI2ZmNSIvPjwvc3ZnPg==',
              sizes: '512x512',
              type: 'image/svg+xml'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Allow disabling HMR in automation environments to reduce noisy refreshes.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
