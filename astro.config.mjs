import { defineConfig } from 'astro/config';
import Compress from "astro-compress";
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL || 'https://travellaw.com';

export default defineConfig({
  output: 'hybrid',
  build: {
    format: 'directory'
  },
  integrations: [
    Compress(),
    sitemap()
  ],
  site: site,
  adapter: cloudflare(),
  vite: {
    define: {
      'import.meta.env.SITE_URL': JSON.stringify(process.env.SITE_URL),
      'import.meta.env.API_URL': JSON.stringify(process.env.API_URL),
      'import.meta.env.GRAPHQL_URL': JSON.stringify(process.env.GRAPHQL_URL),
    },
  },
});
