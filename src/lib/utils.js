import axios from 'axios';
import * as cheerio from 'cheerio';
// import fs from 'fs';
// import path from 'path';
// import { URL } from 'url';

/**
 * Download image and save it locally.
 * @param {string} url - The URL of the image to download.
 * @param {string} filepath - The local path to save the image.
 */
export async function downloadImage(url, filepath) {
  const response = await axios({
    url,
    responseType: 'stream',
  });
  await new Promise((resolve, reject) => {
    response.data.pipe(fs.createWriteStream(filepath))
      .on('finish', resolve)
      .on('error', reject);
  });
}

/**
 * Replace remote image URLs in HTML content with local paths.
 * @param {string} content - The HTML content to parse and replace URLs.
 * @param {string} localImageDir - The directory to save the local images.
 * @returns {Promise<string>} - The updated HTML content with local image paths.
 */
const siteUrl = import.meta.env.SITE_URL;
const apiUrl = import.meta.env.API_URL;

export async function replaceImageUrls(content, localImageDir = 'images/content') {
  const $ = cheerio.load(content);

  // if (!fs.existsSync(localImageDir)) {
  //   fs.mkdirSync(localImageDir, { recursive: true });
  // }

  // replace remove links at siteUrl and to local links
  $('a').each((index, a) => {
    const href = $(a).attr('href');
    if (href && href.startsWith(siteUrl)) {
      const newHref = href.replace(siteUrl, '');
      $(a).attr('href', newHref);
    }
  });

  $('a').each((index, a) => {
    const href = $(a).attr('href');
    if (href && href.startsWith(apiUrl)) {
      const newHref = href.replace(apiUrl, '');
      $(a).attr('href', newHref);
    }
  });

  const imagePromises = [];
  const currentDomain = new URL(siteUrl).hostname;  // Replace with your actual domain

  $('img').each((index, img) => {
    const src = $(img).attr('src');
    if (src && src.startsWith('http')) {
      const imgUrl = new URL(src);
      if (imgUrl.hostname === currentDomain) {
        const filename = path.basename(src);
        const localPath = path.join('/images/content/', filename);
        const filepath = path.join(localImageDir, filename);

        if (!fs.existsSync(filepath)) {
          imagePromises.push(downloadImage(src, filepath));
        }

        $(img).attr('src', localPath);
      }
    }
  });

  await Promise.all(imagePromises);

  return $.html();
}

export function localImage(imageUrl, path) {
  let imageLocal = '';

  if (imageUrl) {
    imageLocal = `/images/${path}/` + imageUrl.split('/').pop();
  }
  return imageLocal;
}
