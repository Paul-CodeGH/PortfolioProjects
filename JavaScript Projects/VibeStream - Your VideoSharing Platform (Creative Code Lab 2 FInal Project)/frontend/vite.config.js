// frontend/vite.config.js
/*
 * This Vite configuration powers our React development server and
 * automatically proxies certain requests to our backend running on port 3000.
 *
 * We register the official React plugin so Vite can transform JSX and modern JS.
 *
 * In the server.proxy section:
 *   1. Any request starting with /api is forwarded to http://localhost:3000
 *      to avoid CORS issues when calling our backend endpoints.
 *   2. Requests to /uploads are also sent to the backend so we can load user
 *      avatars and other uploaded images directly from the server.
 *   3. For /videos, we want two behaviors:
 *      • If the URL ends with a file extension (like .mp4 or .webm),
 *        we proxy the request to fetch the actual video file from the backend.
 *      • If the URL has no extension (e.g. /videos/23), we bypass the proxy
 *        so Vite serves our index.html and lets React Router handle the client-side route.
 */

import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API calls
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy uploaded images
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy only actual video file requests (.mp4, .webm, etc.)
      '/videos': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          // If the URL has no “dot + extension” (i.e. a client route like /videos/23),
          // bypass the proxy so Vite serves index.html and React Router takes over.
          if (!req.url.match(/\.[^/]+$/)) {
            return req.url;
          }
          // Otherwise (it’s a file request), proxy it to the backend.
        }
      }
    }
  }
});
