import client from '../lib/apolloClient';
import { GET_POSTS_BY_CATEGORY } from '../lib/queries';

async function fetchAllResults(query, variables, extractNodes) {
    let allNodes = [];
    let hasNextPage = true;
    let after = null;

    while (hasNextPage) {
      const { data } = await client.query({
        query,
        variables: { ...variables, after },
      });

      const nodes = extractNodes(data);
      allNodes = [...allNodes, ...nodes];

      hasNextPage = data.allNodes.pageInfo.hasNextPage;
      after = data.allNodes.pageInfo.endCursor;
    }
    return allNodes;
}

export async function getAllResults(query, params) {
    const allParams = { ...params, first: 100 };
    const allNodes = await fetchAllResults(
      query,
      allParams,
      (data) => data.allNodes.nodes
    );
    return allNodes;
}

export async function getPostsByCategory(categoryId) {
  const params = { categoryIn: [categoryId], first: 100 };
  const allNodes = await fetchAllResults(
    GET_POSTS_BY_CATEGORY,
    params,
    (data) => data.allNodes.nodes
  );

  const adaptedNodes = allNodes.map(node => ({
    title: node.title,
    slug: node.slug,
    excerpt: node.excerpt,
    databaseId: node.databaseId,
    date: node.date,
    featuredImage: node?.featuredImage
  }));

  return adaptedNodes;
}


export async function getTotalCount(query) {
    const allNodes = await fetchAllResults(
      query,
      { first: 100 },
      (data) => data.allNodes.nodes
    );
    return allNodes.length;
}
