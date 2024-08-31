import { defineConfig } from 'vite';
import Compress from "astro-compress";
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import pagefind from "astro-pagefind";
import robotsTxt from 'astro-robots-txt';

const site = process.env.SITE_URL || 'https://travellaw.com';

export default defineConfig({
  output: 'static',
  build: {
    format: "file",
  },
  integrations: [
    Compress(),
    sitemap(),
    tailwind(),
    pagefind(),
    robotsTxt()
  ],
  site: site
});
