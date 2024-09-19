// pages/rss/[slug].xml.js
import rss from '@astrojs/rss';
import client from '../../lib/apolloClient';
import { GET_CATEGORIES, GET_POSTS_BY_CATEGORY } from '../../lib/queries';

const siteUrl = import.meta.env.SITE_URL;
const postAlias = import.meta.env.POST_ALIAS;

export async function getStaticPaths() {
  try {
    const { data } = await client.query({
      query: GET_CATEGORIES,
      variables: { first: 200 },
    });

    if (!data || !data.categories || !data.categories.nodes) {
      console.error('Unexpected data structure:', data);
      return [];
    }

    return data.categories.nodes.map((category) => ({
      params: { slug: category.slug },
      props: { category },
    }));
  } catch (error) {
    console.error('Error in getStaticPaths:', error);
    if (error.graphQLErrors) {
      console.error('GraphQL Errors:', error.graphQLErrors);
    }
    if (error.networkError) {
      console.error('Network Error:', error.networkError);
    }
    return [];
  }
}

export const GET = async ({ params, request }) => {
  try {
    const slug = params?.slug;

    if (!slug) {
      console.error('No slug provided in params');
      return new Response('Invalid category', { status: 400 });
    }

    const { data } = await client.query({
      query: GET_POSTS_BY_CATEGORY,
      variables: { slug },
    });

    const posts = data?.category?.posts?.nodes || [];

    const rssFeed = await rss({
      title: `HoZt News Feed - ${slug}`,
      description: `Latest HoZt News for ${slug}`,
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
    console.error('Error in GET function:', error);
    return new Response('Error generating RSS feed', { status: 500 });
  }
};
