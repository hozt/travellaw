import { parse } from 'node-html-parser';

/**
 * Replace remote image URLs in HTML content with local paths.
 * @param {string} content - The HTML content to parse and replace URLs.
 * @param {string} localImageDir - The directory to save the local images.
 * @returns {Promise<string>} - The updated HTML content with local image paths.
 */
const siteUrl = import.meta.env.SITE_URL;
const apiUrl = import.meta.env.API_URL;

console.log(siteUrl, apiUrl);

export async function replaceImageUrls(content, localImageDir = 'images/content') {
  const root = parse(content);

  // Helper function to replace URLs
  const replaceUrl = (url, domain, localImageDir) => {
    const imgUrl = new URL(url);
    if (imgUrl.hostname === domain) {
      const filename = imgUrl.pathname.split('/').pop();
      return `/${localImageDir}/${filename}`;
    }
    return url;
  };

  // Replace remote links at siteUrl and apiUrl to local links
  root.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    if (href) {
      if (href.startsWith(siteUrl)) {
        a.setAttribute('href', href.replace(siteUrl, ''));
      } else if (href.startsWith(apiUrl)) {
        a.setAttribute('href', href.replace(apiUrl, ''));
      }
    }
  });

  const siteDomain = new URL(siteUrl).hostname;
  const apiDomain = new URL(apiUrl).hostname;

  root.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('http')) {
      const newSrc = replaceUrl(src, siteDomain, localImageDir);
      img.setAttribute('src', newSrc !== src ? newSrc : replaceUrl(src, apiDomain, localImageDir));
    }

    const srcset = img.getAttribute('srcset');
    if (srcset) {
      const newSrcset = srcset.split(',').map(srcsetItem => {
        const [url, descriptor] = srcsetItem.trim().split(' ');
        const newUrl = replaceUrl(url, siteDomain, localImageDir);
        const finalUrl = newUrl !== url ? newUrl : replaceUrl(url, apiDomain, localImageDir);
        return descriptor ? `${finalUrl} ${descriptor}` : finalUrl;
      }).join(', ');
      img.setAttribute('srcset', newSrcset);
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