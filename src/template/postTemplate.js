import { getImages } from '../lib/utils';

async function PostTemplate(props) {
  const { post, path, classes } = props;
  const postAlias = path || process.env.POST_ALIAS;

  const {
    title,
    excerpt,
    slug,
    featuredImage,
    databaseId,
    linkUrl
  } = post;

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
        <div class="featured-image">
          <a href="/${postAlias}/${slug}">
            <img
              src="${imageLocal.default.src}"
              alt="${altText}"
            />
          </a>
        </div>
      ` : ''}

      <div class="post-content ${imageLocal ? 'has-image' : ''}">
        <div class="post-title">
          <a href="/${postAlias}/${slug}">${escapeHtml(title)}</a>
        </div>
        ${cleanLinkUrl ? `<div class="post-link">${escapeHtml(cleanLinkUrl)}</div>` : ''}
        <div class="post-excerpt">${excerpt}</div>
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
