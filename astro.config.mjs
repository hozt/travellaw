import { defineConfig } from 'vite';
// import Compress from "astro-compress";
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import pagefind from "astro-pagefind";
import robotsTxt from 'astro-robots-txt';
import compressor from "astro-compressor";

const site = process.env.SITE_URL;

export default defineConfig({
  output: 'static',
  build: {
    format: "file"
  },
  vite: {
    resolve: {
      preserveSymlinks: true
    }
  },
  integrations: [
    compressor({
      fileExtensions: [".html"]
    }),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
    tailwind(),
    pagefind(),
    robotsTxt(),
  ],
  site: site
});
