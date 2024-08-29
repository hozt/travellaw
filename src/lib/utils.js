import { parse } from 'node-html-parser';

/**
 * Replace remote image URLs in HTML content with local paths.
 * @param {string} content - The HTML content to parse and replace URLs.
 * @param {string} localImageDir - The directory to save the local images.
 * @returns {Promise<string>} - The updated HTML content with local image paths.
 */
const siteUrl = import.meta.env.SITE_URL;
const apiUrl = import.meta.env.API_URL;

export async function replaceImageUrls(content, localImageDir = 'images/content') {
  const root = parse(content);

  // replace remote links at siteUrl and apiUrl to local links
  root.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.startsWith(siteUrl)) {
      a.setAttribute('href', href.replace(siteUrl, ''));
    } else if (href && href.startsWith(apiUrl)) {
      a.setAttribute('href', href.replace(apiUrl, ''));
    }
  });

  const currentDomain = new URL(siteUrl).hostname;

  root.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('http')) {
      const imgUrl = new URL(src);
      if (imgUrl.hostname === currentDomain) {
        const filename = src.split('/').pop();
        const localPath = `/${localImageDir}/${filename}`;
        img.setAttribute('src', localPath);
      }
    }
  });

  return root.toString();
}

export function localImage(imageUrl, path) {
  if (imageUrl) {
    return `/images/${path}/${imageUrl.split('/').pop()}`;
  }
  return '';
}