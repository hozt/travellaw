import { defineConfig } from 'vite';
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
    // this prevents the warning about the legacy js api
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["legacy-js-api"],
        },
      },
    },
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
    robotsTxt(),
  ],
  site: site
});
