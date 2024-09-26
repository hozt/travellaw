import { defineConfig } from 'vite';
import tailwind from "@astrojs/tailwind";
import pagefind from "astro-pagefind";
import compressor from "astro-compressor";
import partytown from '@astrojs/partytown';

const site = process.env.SITE_URL;

export default defineConfig({
  vite: {
    resolve: {
      preserveSymlinks: true
    }
  },
  integrations: [
    compressor({
      fileExtensions: [".html"]
    }),
    tailwind(),
    pagefind(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    })
  ],
  site: site
});
