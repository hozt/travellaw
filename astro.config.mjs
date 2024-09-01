import { defineConfig } from 'vite';
import Compress from "astro-compress";
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import pagefind from "astro-pagefind";
import robotsTxt from 'astro-robots-txt';

import sentry from "@sentry/astro";
import spotlightjs from "@spotlightjs/astro";

const site = process.env.SITE_URL;

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
    robotsTxt(),
    sentry(),
    spotlightjs()
  ],
  site: site
});