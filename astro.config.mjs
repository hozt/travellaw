import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'hybrid', // or 'hybrid' if needed
  adapter: node({
    mode: 'standalone' // You can also use 'middleware' for a different setup
  }),
});
