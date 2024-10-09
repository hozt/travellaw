import { GET_POSTS_EXCERPTS_BY_IDS, GET_POSTS_EXCERPTS_STICKY } from './queries';
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

export async function getStickyPosts() {
    const { data } = await client.query({
      query: GET_POSTS_EXCERPTS_STICKY,
    });

    if (data?.posts?.nodes) {
      return data.posts.nodes;
    } else {
      console.error('No sticky posts found');
      return [];
    }
}
