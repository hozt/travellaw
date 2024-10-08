import { parse } from 'node-html-parser';

const siteUrl = import.meta.env.SITE_URL;
const apiUrl = import.meta.env.API_URL;


export function replaceIconShortcode(content) {
  // Regular expression to match the <i class="fas fa-shopping-cart"> pattern
  const iconRegex = /<i\s+class="[^"]*\bfa-([^"]+)"[^>]*><\/i>/g;

  // Replace the matched <i> tag with the modified version
  return content.replace(iconRegex, (match, iconName) => {
    // Validate the extracted iconName
    if (!iconName || typeof iconName !== 'string' || !/^[a-zA-Z0-9-]+$/.test(iconName)) {
      console.warn(`Invalid icon name: "${iconName}"`);
      return match; // Return the original match if the iconName is invalid
    }

    // Generate the replacement HTML using string concatenation
    const iconClass = 'icon-[fa--' + iconName + ']';
    return '<i class="' + iconClass + '"></i>';
  });
}

export async function replaceImageUrls(content, localImageDir = 'images/content', localPdfDir = 'pdfs') {
  const root = parse(content);

  // Helper function to replace image URLs and add .webp extension
  const replaceImageUrl = (url, domain, localImageDir) => {
    const imgUrl = new URL(url, siteUrl);
    if (imgUrl.hostname === domain) {
      const filename = imgUrl.pathname.split('/').pop();
      const filenameWithoutExt = filename.split('.').slice(0, -1).join('.');
      return `/${localImageDir}/${filenameWithoutExt}.webp`;
    }
    return url;
  };

  // Helper function to replace PDF URLs
  const replacePdfUrl = (url, localPdfDir) => {
    const pdfUrl = new URL(url, siteUrl);
    const filename = pdfUrl.pathname.split('/').pop();
    return `/${localPdfDir}/${filename}`;
  };

  const siteDomain = new URL(siteUrl).hostname;
  const apiDomain = new URL(apiUrl).hostname;

  // Replace remote links at siteUrl and apiUrl to local links
  root.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    if (href) {
      if (href.endsWith('.pdf')) {
        const newHref = replacePdfUrl(href, localPdfDir);
        a.setAttribute('href', newHref);
      } else if (href.startsWith(siteUrl)) {
        a.setAttribute('href', href.replace(siteUrl, ''));
      } else if (href.startsWith(apiUrl)) {
        a.setAttribute('href', href.replace(apiUrl, ''));
      }
    }
  });

  // Replace PDF URLs in object tags
  root.querySelectorAll('object').forEach(obj => {
    const data = obj.getAttribute('data');
    if (data && data.endsWith('.pdf')) {
      const newData = replacePdfUrl(data, localPdfDir);
      obj.setAttribute('data', newData);
    }
  });

  root.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('http')) {
      const newSrc = replaceImageUrl(src, siteDomain, localImageDir);
      img.setAttribute('src', newSrc !== src ? newSrc : replaceImageUrl(src, apiDomain, localImageDir));
    }

    const srcset = img.getAttribute('srcset');
    if (srcset) {
      const newSrcset = srcset.split(',').map(srcsetItem => {
        const [url, descriptor] = srcsetItem.trim().split(' ');
        const newUrl = replaceImageUrl(url, siteDomain, localImageDir);
        const finalUrl = newUrl !== url ? newUrl : replaceImageUrl(url, apiDomain, localImageDir);
        return descriptor ? `${finalUrl} ${descriptor}` : finalUrl;
      }).join(', ');
      img.setAttribute('srcset', newSrcset);
    }
  });

  return root.toString();
}

export function localImage(imageUrl, path) {
  if (imageUrl) {
    const filename = imageUrl.split('/').pop();
    const filenameWithoutExt = filename.split('.').slice(0, -1).join('.');
    return `/images/${path}/${filenameWithoutExt}.webp`;
  }
  return '';
}

export function localFileName(imageUrl) {
  if (imageUrl) {
    return imageUrl.split('/').pop();
  }
  return '';
}

export async function getImageLogoUrl(imagePath) {
  // remove the file name from imagePath
  const images = import.meta.glob(`../../assets/images/logos/*.{jpg,jpeg,png,webp,avif}`);
  if (images[imagePath]) {
    const imageModule = await images[imagePath]();
    return imageModule.default;
  }
  return null;
}

export async function getImages(directory, imagePath) {
  if (!imagePath) {
    return null;
  }
  let images = {};

  switch (directory) {
    case 'logos':
      images = import.meta.glob('../../assets/images/logos/*.{jpg,jpeg,png,webp,avif}');
      break;
    case 'additional':
      images = import.meta.glob('../../assets/images/additional/*.{jpg,jpeg,png,webp,avif}');
      break;
    case 'featured':
      images = import.meta.glob('../../assets/images/featured/*.{jpg,jpeg,png,webp,avif}');
      break;
    case 'banners':
      images = import.meta.glob('../../assets/images/banners/*.{jpg,jpeg,png,webp,avif}');
      break;
    case 'gallery':
      images = import.meta.glob('../../assets/images/gallery/*.{jpg,jpeg,png,webp,avif}');
      break;
    case 'gallery-thumbnails':
      images = import.meta.glob('../../assets/images/gallery-thumbnails/*.{jpg,jpeg,png,webp,avif}');
      break;
    default:
      console.log('Invalid directory:', directory);
      return null;
  }

  const relativePath = `../../assets/images/${directory}/${imagePath.split('/').pop()}`;
  if (images[relativePath]) {
    const imageModule = await images[relativePath]();
    return imageModule;
  }

  console.log('Additional image not found for path:', relativePath);
  return null;
}

