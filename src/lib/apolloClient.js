import { ApolloClient, InMemoryCache } from '@apollo/client/core';

const graphQL = import.meta.env.GRAPHQL_URL;
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        customSiteSettings: {
          merge(existing, incoming) {
            return { ...existing, ...incoming };
          },
        },
      },
    },
  },
});

if (!graphQL) {
  throw new Error('GRAPHQL_URL environment variable is not set');
}

const client = new ApolloClient({
  uri: graphQL,
  cache
});

export default client;

async function clearCache() {
  try {
    await client.clearStore();
    console.log('Apollo Client cache cleared');
  } catch (error) {
    console.error('Error clearing Apollo Client cache:', error);
  }
}

// Only call clearCache if it's not a production environment
if (import.meta.env.DEV) {
  clearCache();
}