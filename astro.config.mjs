import { defineConfig } from 'vite';
import tailwind from "@astrojs/tailwind";
import pagefind from "astro-pagefind";
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
    tailwind(),
    pagefind()
  ],
  site: site
});
