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
      fileExtensions: ['.html', '.js', '.svg', '.json', '.xml', '.txt', '.md', '.webmanifest', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.webm', '.woff', '.woff2', '.ttf', '.otf', '.eot', '.zip', '.gz', '.tar', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.mp3', '.wav', '.flac', '.ogg', '.mp3', '.mp4', '.webm', '.avi', '.mov', '.wmv', '.mpg', '.mpeg', '.flv', '.mkv', '.m4v', '.m4a', '.aac', '.flac', '.ogg', '.oga', '.opus', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp', '.md', '.yaml', '.yml', '.json', '.csv', '.ics', '.xml', '.txt', '.text', '.conf', '.ini', '.env', '.sh', '.bash', '.bat', '.cmd', '.ts', '.tsx', '.js', '.jsx', '.html', '.htm', '.php', '.css', '.scss', '.sass', '.less', '.styl', '.svg', '.bmp', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.ico', '.tif', '.tiff', '.mp4', '.webm', '.ogg', '.mp3', '.wav', '.flac', '.aac', '.pdf', '.zip', '.gz', '.tar', '.7z', '.rar', '.tgz', '.psd', '.ai', '.eot', '.otf', '.ttf', '.woff', '.woff2', '.json', '.yaml', '.yml', '.csv', '.ics', '.md', '.text', '.txt', '.conf', '.ini', '.env', '.sh', '.bash', '.bat', '.cmd', '.jsx', '.tsx', '.ts', '.js', '.html',]
    }),
    sitemap(),
    tailwind(),
    pagefind(),
    robotsTxt(),
  ],
  site: site
});