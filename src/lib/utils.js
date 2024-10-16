import { parse } from 'node-html-parser';
import PostTemplate from '../template/postTemplate';
import { renderLatestPodcastEpisode } from '../template/podcastTemplate.js';
import { getPostsByIds, getStickyPosts } from '../lib/fetchPosts';
const siteUrl = import.meta.env.SITE_URL;
const apiUrl = import.meta.env.API_URL;
const postAlias = import.meta.env.POST_ALIAS;

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
    const iconClass = 'icon-[fa-solid--' + iconName + ']';
    return '<i class="icon ' + iconClass + '"></i>';
  });
}

export async function replaceImageUrls(content, localImageDir = 'images/content', localPdfDir = 'pdfs') {
  if (!content) {
    return content;
  }
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
  const images = import.meta.glob(`../../assets/images/logos/*.{gif,jpg,jpeg,png,webp,avif}`);
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
      images = import.meta.glob('../../assets/images/logos/*.{gif,jpg,jpeg,png,webp,avif}');
      break;
    case 'additional':
      images = import.meta.glob('../../assets/images/additional/*.{gif,jpg,jpeg,png,webp,avif}');
      break;
    case 'featured':
      images = import.meta.glob('../../assets/images/featured/*.{gif,jpg,jpeg,png,webp,avif}');
      break;
    case 'banners':
      images = import.meta.glob('../../assets/images/banners/*.{gif,jpg,jpeg,png,webp,avif}');
      break;
    case 'gallery':
      images = import.meta.glob('../../assets/images/gallery/*.{gif,jpg,jpeg,png,webp,avif}');
      break;
    case 'gallery-thumbnails':
      images = import.meta.glob('../../assets/images/gallery-thumbnails/*.{gif,jpg,jpeg,png,webp,avif}');
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
// Helper function to decode HTML entities
function decodeHTMLEntities(text) {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '=',
    '&#8221;': '"',
    '&#8243;': '"'
  };
  return text.replace(/&[#\w]+;/g, entity => entities[entity] || entity);
}

// Export async function to replace WordPress shortcodes with custom functionality
// Helper function to replace all instances of a shortcode
async function replaceAllShortCodes(content, pattern, replaceFn) {
  let newContent = content;
  let match;

  while ((match = pattern.exec(newContent)) !== null) {
    const fullMatch = match[0];
    const replacement = await replaceFn(...match);

    newContent = newContent.slice(0, match.index) + replacement + newContent.slice(match.index + fullMatch.length);
    pattern.lastIndex = match.index + replacement.length;
  }

  return newContent;
}

// Export async function to replace WordPress shortcodes with custom functionality
export async function replaceShortCodes(content) {
  content = decodeHTMLEntities(content);
  const shortCodes = [
    {
      // <p>[podcast latest="true" feed="https://example.com/feed" image="https://someurl.com/img/test.jpg"]</p>
      // Update the pattern to match the <p> tag and the shortcode with all attributes
      pattern: /<p>\[podcast\s+latest="([^"]+)"\s+feed="([^"]+)"\s+image="([^"]+)"\]<\/p>/g,
      replace: async (match, latest, feedUrl, image) => {
        try {
          const podcastHtml = await renderLatestPodcastEpisode(feedUrl, image);
          return podcastHtml;
        } catch (error) {
          console.error('Error rendering podcast:', error);
          return `<p>Error loading podcast: ${error.message}</p>`;
        }
      }
    },
    {
      pattern: /<p>\[display-posts([^\]]*)\]<\/p>/g,
      replace: async (match, attributes) => {
        // Decode HTML entities in the attributes
        const decodedAttributes = decodeHTMLEntities(attributes);

        // Parse attributes
        const idMatch = decodedAttributes.match(/id="([^"]+)"/);
        const titleMatch = decodedAttributes.match(/title="([^"]+)"/);
        const stickyMatch = decodedAttributes.match(/sticky="([^"]+)"/);
        const classMatch = decodedAttributes.match(/class="([^"]+)"/);
        // match tag
        const tagMatch = decodedAttributes.match(/tag="([^"]+)"/);
        const countMatch = decodedAttributes.match(/count="([^"]+)"/);

        const ids = idMatch ? idMatch[1].split(',').map(id => id.trim()) : [];
        const title = titleMatch ? titleMatch[1] : '';
        const sticky = stickyMatch ? stickyMatch[1] === 'true' : false;
        const classes = classMatch ? classMatch[1] : '';
        const tag = tagMatch ? tagMatch[1] : '';
        const count = countMatch ? countMatch[1] : 1;

        let posts = [];

        if (tag) {
          posts = await getPostsByTag(tag, count);
        } else if (sticky) {
          posts = await getStickyPosts();
        } else if (ids.length > 0) {
          posts = await getPostsByIds(ids);
        }

        if (posts && posts.length > 0) {
          const postPreviews = await Promise.all(posts.map(post =>
            PostTemplate({ post, classes: 'post-template', path: postAlias })
          ));
          const classList = [];
          if (classes) {
            classList.push(classes);
          }
          const classAttribute = classList.join(' ');
          return `
            <div class="${classAttribute}">
                ${postPreviews.join('')}
            </div>
          `;
        }

        // Return the original match if posts are not found
        return match;
      }
    }
  ];

  // Replace all matched shortcodes with the modified version
  for (const shortCode of shortCodes) {
    content = await replaceAllShortCodes(content, shortCode.pattern, shortCode.replace);
  }
  return content;
}
