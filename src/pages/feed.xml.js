// pages/feed.xml.js
import rss from '@astrojs/rss';
import client from '../lib/apolloClient';
import { GET_NEWS_FEED } from '../lib/queries';

const siteUrl = import.meta.env.SITE_URL;
const postAlias = import.meta.env.POST_ALIAS;

export const GET = async ({ params, request }) => {
  try {
    const { data, errors } = await client.query({
      query: GET_NEWS_FEED,
      variables: { first: 10 },
    });

    if (errors) {
      console.error('GraphQL Errors:', errors);
      return new Response(`Error fetching data: ${errors.map(e => e.message).join(', ')}`, { status: 500 });
    }

    const posts = data?.posts?.nodes || [];

    const rssFeed = await rss({
      title: 'HoZt News Feed',
      description: 'Latest HoZt News',
      site: siteUrl,
      items: posts.map(post => ({
        title: post.title,
        description: post.excerpt,
        link: `${siteUrl}/${postAlias}/${post.slug}`,
        pubDate: new Date(post.date),
      })),
    });

    const rssContent = await rssFeed.text();

    return new Response(rssContent, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new Response(`Error generating RSS feed: ${error.message}`, { status: 500 });
  }
}