// src/template/postTemplate.js
import { getImages } from '../lib/utils';

async function PostTemplate(props) {
  const { post, path, classes, readMore, dateInclude, tagList } = props;
  const postAlias = path || process.env.POST_ALIAS;

  const {
    title,
    excerpt,
    slug,
    featuredImage,
    linkUrl,
    date,
    tags
  } = post;

  // if tags are populated return the first tag
  const firstTag = tags.nodes.length > 0 ? tags.nodes[0].name : null;

  const imageUrl = featuredImage?.node?.sourceUrl;
  let imageLocal = null;
  if (imageUrl) {
    imageLocal = await getImages('featured', imageUrl);
  }
  const altText = featuredImage?.node?.altText || title;
  const cleanLinkUrl = linkUrl ? linkUrl.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') : null;

  return `
    <div class="${classes}">
      ${imageLocal ? `
        <div class="featured-image-wrapper">
          <div class="featured-image">
            <a href="/${postAlias}/${slug}/">
              <img
                src="${imageLocal.default.src}"
                alt="${altText}"
              />
            </a>
          </div>
        </div>
      ` : ''}

      <div class="post-content ${imageLocal ? 'has-image' : ''}">
        ${firstTag ? `<div class="post-tag">${firstTag}</div>` : ''}
        <div class="post-title">
          <a href="/${postAlias}/${slug}/">${escapeHtml(title)}</a>
        </div>
        ${cleanLinkUrl ? `<div class="post-link">${escapeHtml(cleanLinkUrl)}</div>` : ''}
        <div class="post-excerpt">${excerpt}</div>
        ${dateInclude ? `<div class="post-date">${date}</div>` : ''}
        ${readMore ? `<a href="/${postAlias}/${slug}/" class="read-more">${readMore}</a>` : ''}
      </div>
    </div>
  `;
}

// Helper function to escape HTML special characters
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default PostTemplate;
