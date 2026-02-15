import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  prefetch: true,
  outDir: 'dist',
  redirects: {
    '/p': '/',
  },
});
