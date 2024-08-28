// src/lib/api.js
import { articleStore } from '../store/articleStore';
import client from './apolloClient';
import { GET_POSTS_EXCERPTS } from './queries';

const ITEMS_PER_PAGE = 10;

export async function fetchArticles(page = 1, cursor = null) {
  let store;
  articleStore.subscribe(value => store = value)();

  // If we already have this page's data, return it
  if (store.articles.length >= page * ITEMS_PER_PAGE) {
    return store.articles.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  }

  // Fetch new data
  const { data } = await client.query({
    query: GET_POSTS_EXCERPTS,
    variables: { first: ITEMS_PER_PAGE, after: cursor }
  });

  // Update store
  articleStore.update(store => ({
    articles: [...store.articles, ...data.posts.nodes],
    pageInfo: data.posts.pageInfo,
    currentPage: page
  }));

  return data.posts.nodes;
}