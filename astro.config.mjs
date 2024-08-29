import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'hybrid',
  build: {
    format: 'directory'
  },
  adapter: cloudflare(),
  vite: {
    define: {
      'import.meta.env.SITE_URL': JSON.stringify(process.env.SITE_URL),
      'import.meta.env.API_URL': JSON.stringify(process.env.API_URL),
      'import.meta.env.GRAPHQL_URL': JSON.stringify(process.env.GRAPHQL_URL),
    },
  },
});