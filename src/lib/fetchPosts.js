import { GET_POSTS_EXCERPTS_BY_IDS, GET_POSTS_EXCERPTS_STICKY, GET_POSTS_BY_TAG_COUNT, GET_TESTIMONIALS_LIMIT, GET_GALLERY, GET_ALL_PORTFOLIOS } from './queries';
import client from './apolloClient';

export async function getPostsByIds(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];

    const { data } = await client.query({
      query: GET_POSTS_EXCERPTS_BY_IDS,
      variables: { ids: idArray },
    });

    if (data?.posts?.nodes) {
      return data.posts.nodes;
    } else {
      console.error('No posts found for IDs:', ids);
      return [];
    }
}

export async function getStickyPosts(count) {
    const { data } = await client.query({
      query: GET_POSTS_EXCERPTS_STICKY,
    });

    if (data?.posts?.nodes) {
      const posts = data.posts.nodes.map(post => ({ ...post }));

      posts.forEach(post => {
        post.date = new Date(post.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      });

      if (count) {
        return posts.slice(0, count);
      }

      return posts;
    } else {
      console.error('No sticky posts found');
      return [];
    }
}

export async function fetchTestimonials(count) {
  const { data } = await client.query({
    query: GET_TESTIMONIALS_LIMIT,
    variables: { count: parseInt(count) }, // Ensure count is an integer
  });

  if (data?.testimonials?.nodes) {
    return data.testimonials.nodes;
  } else {
    console.error('No testimonials found');
    return [];
  }
}

// get posts by tag with count
export async function getPostsByTag(tag, count) {
    const { data } = await client.query({
      query: GET_POSTS_BY_TAG_COUNT,
      variables: { tag, count },
    });

    if (data?.posts?.nodes) {
      return data.posts.nodes;
    } else {
      console.error('No posts found for tag:', tag);
      return [];
    }
}

export async function fetchGalleryImages(slug) {
  const { data } = await client.query({
    query: GET_GALLERY,
    variables: { slug },
  });

  if (data?.galleryBy?.galleryImages) {
    return data.galleryBy.galleryImages;
  } else {
    console.error('No gallery images found');
    return [];
  }
}

export async function fetchAllPortfolios(count, sticky=false) {
  const { data } = await client.query({
    query: GET_ALL_PORTFOLIOS,
    variables: { first: 100 },
  });

  if (data?.portfolios?.nodes) {
    // if sticky then filter out all nodes that do not have isSticky set to true return only count records
    return sticky ? data.portfolios.nodes.filter(portfolio => portfolio.isSticky).slice(0, count) : data.portfolios.nodes.slice(0, count);
  } else {
    console.error('No portfolios found');
    return [];
  }
}
