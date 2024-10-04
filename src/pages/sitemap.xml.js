import client from '../lib/apolloClient';
import { isEnabled } from '../lib/enabledFeatures';
import { getTotalCount } from '../lib/fetchAllResults';
import { GET_SITEMAP_SLUGS, GET_ARTICLES_COUNT } from '../lib/queries';

const siteUrl = import.meta.env.SITE_URL;
const recordsToFetch = 1000;

const formatDate = (date) => {
  return new Date(date).toISOString();
};

const generateSitemapEntries = (type, nodes, prefix, priority) => {
    if (!nodes || nodes.length === 0) {
      return '';
    }
    if (type === 'pages') {
        nodes = nodes.filter(node => !node.isFrontPage);
    } else if (type === 'categories') {
        nodes = nodes.filter(node => node?.slug !== 'uncategorized');
    } else if (type === 'faqTopics') {
        nodes = nodes.filter(topic => topic.parentId === null);
    }
    return nodes.map((node) => {
      const path = prefix ? `${prefix}/${node.slug}` : node.slug;
      return `
      <url>
        <loc>${siteUrl}/${path}</loc>
        <lastmod>${formatDate(node?.modified || new Date().toISOString())}</lastmod>
        <priority>${priority}</priority>
      </url>
    `;
    }).join('');
};

const generateSitemap = async () => {
  const postAlias = import.meta.env.POST_ALIAS || 'blog';
  const data = await client.query({
    query: GET_SITEMAP_SLUGS,
    variables: { first: recordsToFetch }
  });

  const urls = data.data;
  const entries = [
    { type: 'pages', prefix: '', priority: '0.9' },
    { type: 'posts', prefix: postAlias, priority: '0.8' },
    { type: 'forms', prefix: 'forms', priority: '0.6' },
    { type: 'galleries', prefix: 'galleries', priority: '0.6' },
    { type: 'portfolios', prefix: 'portfolio', priority: '0.8' },
    { type: 'faqTopics', prefix: 'faqs', priority: '0.8' },
    { type: 'categories', prefix: 'category', priority: '0.7' },
    { type: 'tags', prefix: 'tags', priority: 0.6 },
  ].map(({ type, prefix, priority }) => generateSitemapEntries(type, urls[type]?.nodes, prefix, priority))
   .filter(entry => entry !== '');

  // Add landing pages if enabled
  const landingPages = [
    { feature: 'posts', path: postAlias, priority: '0.8' },
    { feature: 'posts', path: `tags`, priority: '0.8' },
    { feature: 'posts', path: `category`, priority: '0.8' },
    { feature: 'portfolios', path: 'portfolio', priority: '0.8' },
    { feature: 'videos', path: 'videos', priority: '0.8' },
    { feature: 'testimonials', path: 'testimonials', priority: '0.8' },
    { feature: 'events', path: 'events', priority: '0.7' },
    { feature: 'events', path: 'event-list', priority: '0.7' },
  ];

  const filteredLandingPages = [];
  for (const page of landingPages) {
    if (await isEnabled(page.feature)) {
      filteredLandingPages.push(page);
    }
  }

  const landingPagesEnabled = filteredLandingPages.map(({ path, priority }) => `
    <url>
      <loc>${siteUrl}/${path}</loc>
      <priority>${priority}</priority>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>
  `);

  // Add category paged URLs if needed
  const totalArticles = await getTotalCount(GET_ARTICLES_COUNT);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(totalArticles / ITEMS_PER_PAGE);
  if (totalPages > 1) {
    for (let i = 2; i <= totalPages; i++) {
      landingPages.push(`
        <url>
          <loc>${siteUrl}/${postAlias}/${i}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <priority>0.7</priority>
        </url>
      `);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${siteUrl}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <priority>1.0</priority>
      </url>
      ${entries.join('\n')}
      ${landingPagesEnabled.join('\n')}
    </urlset>`;
};

export const GET = async () => {
  try {
    const sitemap = await generateSitemap();
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
};