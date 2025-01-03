import { parse } from 'node-html-parser';
import PostTemplate from '../template/postTemplate';
import { renderPage } from '../template/pageTemplate';
import { renderLatestPodcastEpisode } from '../template/podcastTemplate.js';
import { getPostsByIds, getStickyPosts, getPostsByTag, fetchTestimonials, fetchGalleryImages, fetchAllPortfolios, fetchPageByPath } from '../lib/fetchPosts';
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
      let newHref = href;
      if (href.endsWith('.pdf')) {
        newHref = replacePdfUrl(href, localPdfDir);
      } else if (href.startsWith(siteUrl)) {
        newHref = href.replace(siteUrl, '');
      } else if (href.startsWith(apiUrl)) {
        newHref = href.replace(apiUrl, '');
      }

      // Ensure trailing slash for non-PDF links
      if (!newHref.endsWith('.pdf') && !newHref.endsWith('/')) {
        newHref += '/';
      }

      // Remove double slashes (except for http:// or https://)
      newHref = newHref.replace(/([^:]\/)\/+/g, "$1");

      a.setAttribute('href', newHref);
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
    // [page path="some-path"]
    {
      pattern: /\[page\s+uri="([^"]+)"\]/g,
      replace: async (match, uri) => {
        const page = await fetchPageByPath(uri);
        if (page) {
          return renderPage({ page });
        }
        return '';
      }
    },
    {
      pattern: /<p>\[podcast\s+([^\]]+)\]<\/p>/g,
      replace: async (match, attributes) => {
        try {
          const decodedAttributes = decodeHTMLEntities(attributes);

          const feedMatch = decodedAttributes.match(/feed="([^"]+)"/);
          const feedUrl = feedMatch ? feedMatch[1] : '';

          const imageMatch = decodedAttributes.match(/image="([^"]+)"/);
          const image = imageMatch ? imageMatch[1] : '';

          const readMoreMatch = decodedAttributes.match(/read-more="([^"]+)"/);
          const readMore = readMoreMatch ? decodeHTMLEntities(readMoreMatch[1]) : '';

          const titleMatch = decodedAttributes.match(/title="([^"]+)"/);
          const title = titleMatch ? titleMatch[1] : '';

          if (!feedUrl) {
            console.error('Podcast shortcode is missing required "feed" attribute');
            return '<!-- Podcast shortcode is missing required "feed" attribute -->';
          }

          const podcastHtml = await renderLatestPodcastEpisode(feedUrl, image, readMore, title);
          return podcastHtml;
        } catch (error) {
          console.error('Error processing podcast shortcode:', error);
          return `<!-- Error processing podcast shortcode: ${error.message} -->`;
        }
      }
    },
    // [gallery-images slug="featured-clients" width="200"]
    {
      pattern: /<p>\[gallery-images([^\]]*)\]<\/p>/g,
      replace: async (match, attributes) => {
        const decodedAttributes = decodeHTMLEntities(attributes);
        const slugMatch = decodedAttributes.match(/slug="([^"]+)"/);
        const slug = slugMatch ? slugMatch[1] : '';

        const widthMatch = decodedAttributes.match(/width="([^"]+)"/);
        const width = widthMatch ? parseInt(widthMatch[1], 10) : 400; // Ensure width is an integer

        // Fetch gallery images from the API
        const images = await fetchGalleryImages(slug);

        // Generate the HTML for the gallery images
        if (images.length === 0) {
          return `<p>No gallery images found</p>`;
        }

        const galleryHtml = await Promise.all(images.map(async image => {
          let imageLocal;
          if (image.sourceUrl) {
            imageLocal = await getImages('gallery', image.sourceUrl);
          }
          return `
            <figure>
              <Image
                src="${imageLocal?.default?.src || image.sourceUrl}"
                alt="${image?.altText}"
                width="${width}"
                inferSize
                loading="lazy"
              />
            </figure>
          `;
        }));

        return `<div class="gallery-short-code">${galleryHtml.join('')}</div>`;
      }
    },
    // [display-portfolio count="4" sticky="true" width="400"]
    {
      pattern: /<p>\[portfolios([^\]]*)\]<\/p>/g,
      replace: async (match, attributes) => {
        // Decode HTML entities in the attributes
        const decodedAttributes = decodeHTMLEntities(attributes);
        const countMatch = decodedAttributes.match(/count="([^"]+)"/);
        const count = countMatch ? parseInt(countMatch[1], 10) : 4; // Ensure count is an integer
        const stickyMatch = decodedAttributes.match(/sticky="([^"]+)"/);
        const sticky = stickyMatch ? stickyMatch[1] === 'true' : false;
        const widthMatch = decodedAttributes.match(/width="([^"]+)"/);
        const width = widthMatch ? parseInt(widthMatch[1], 10) : 400; // Ensure width is an integer
        const portfolios = await fetchAllPortfolios(count, sticky);
        if (portfolios.length === 0) {
          return `<p>No portfolios found</p>`;
        }

        const portfolioHtml = await Promise.all(portfolios.map(async portfolio => {
          let imageLocal;
          if (portfolio.additionalImage.sourceUrl) {
            imageLocal = await getImages('additional', portfolio.additionalImage.sourceUrl);
          }
          return `
            <div class="portfolio">
              <a href="/portfolio/${portfolio.slug}/" aria-label="Project ${portfolio.title}">
                <Image
                  src="${imageLocal?.default?.src || portfolio.additionalImage.sourceUrl}"
                  alt="${portfolio.additionalImage.altText}"
                  width="${width}"
                  loading="lazy"
                  decoding="async"
                  class="portfolio-image"
                />
              </a>
              <div class="tags">
              ${portfolio.tags.nodes.map(tag => `<div class="tag">${tag.name}</div>`).join('')}
              </div>
            </div>
          `;
        }));

        return `<div class="portfolios-short-code">${portfolioHtml.join('')}</div>`;
      }
    },
    // [testimonials count="4"]
    {
      pattern: /<p>\[testimonials([^\]]*)\]<\/p>/g,
      replace: async (match, attributes) => {
        // Decode HTML entities in the attributes
        const decodedAttributes = decodeHTMLEntities(attributes);

        // Parse attributes
        const countMatch = decodedAttributes.match(/count="([^"]+)"/);
        const count = countMatch ? countMatch[1] : 4;

        // Fetch testimonials from the API
        const testimonials = await fetchTestimonials(count);

        // Generate the HTML for the testimonials
        const rating = 5;
        const testimonialHtml = testimonials.map(testimonial => `
          <div class="testimonial">
            <div class="content">${testimonial.content}</div>
            <div class="details">
              <div class="author">
                <div class="title">${testimonial.title}</div>
                <div class="source">${testimonial.source}</div>
              </div>
              <div class="rating">
                <div class="rating-stars">${'<i class="icon icon-[mdi--star]"></i>'.repeat(rating)}</div>
                <div class="rating-actual">${rating} / 5</div>
              </div>
            </div>
          </div>
        `).join('');

        return `<div class="testimonials-short-code">${testimonialHtml}</div>`;
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
        const sticky = stickyMatch ? stickyMatch[1].toLowerCase() === 'true' : false;

        const classMatch = decodedAttributes.match(/class="([^"]+)"/);
        const classes = classMatch ? classMatch[1] : '';

        const tagMatch = decodedAttributes.match(/tag="([^"]+)"/);
        const tag = tagMatch ? tagMatch[1] : '';

        const tagListMatch = decodedAttributes.match(/tag-list="([^"]+)"/);
        const tagList = tagListMatch ? tagListMatch[1].toLowerCase() === 'true' : false

        const countMatch = decodedAttributes.match(/count="([^"]+)"/);
        const count = countMatch ? countMatch[1] : 1;

        const readMoreMatch = decodedAttributes.match(/read-more="([^"]+)"/);
        const readMore = readMoreMatch ? decodeHTMLEntities(readMoreMatch[1]) : '';

        const dateMatch = decodedAttributes.match(/date="([^"]+)"/);
        const dateInclude = dateMatch ? dateMatch[1].toLowerCase() === 'true' : false;

        const ids = idMatch ? idMatch[1].split(',').map(id => id.trim()) : [];

        let posts = [];

        if (tag) {
          posts = await getPostsByTag(tag, count);
        } else if (sticky) {
          posts = await getStickyPosts(count);
        } else if (ids.length > 0) {
          posts = await getPostsByIds(ids);
        }
        if (posts && posts.length > 0) {
          const postPreviews = await Promise.all(posts.map(post =>
            PostTemplate({ post, classes: 'post-template', path: postAlias, readMore, dateInclude, tagList })
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
