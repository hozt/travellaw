import { defineConfig } from 'vite';
import Compress from "astro-compress";
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import pagefind from "astro-pagefind";
import robotsTxt from 'astro-robots-txt';

const site = process.env.SITE_URL;

export default defineConfig({
  output: 'static',
  build: {
    format: "file",
  },
  integrations: [
    Compress({
      fileExtensions: ['.html', '.js', '.json', '.xml', '.txt', '.md', '.webmanifest', '.jsx', '.tsx', '.ts', '.ttf']
    }),
    sitemap(),
    tailwind(),
    pagefind(),
    robotsTxt(),
  ],
  site: site
});