import { defineConfig } from 'vite';
import Compress from "astro-compress";
// import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";

const site = process.env.SITE_URL || 'https://travellaw.com';

export default defineConfig({
  output: 'static',
  // build: {
  //   format: 'directory'
  // },
  integrations: [
    Compress(),
    sitemap(),
    tailwind()
  ],
  site: site,
  // adapter: cloudflare(),
  vite: {
    define: {
      'import.meta.env.SITE_URL': JSON.stringify(process.env.SITE_URL),
      'import.meta.env.API_URL': JSON.stringify(process.env.API_URL),
      'import.meta.env.GRAPHQL_URL': JSON.stringify(process.env.GRAPHQL_URL),
    },
  },
});
