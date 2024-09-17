import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

if (import.meta.env.DEV) {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

let endpoint = import.meta.env.API_URL;
if (!endpoint) {
  throw new Error('GRAPHQL_URL environment variable is not set');
}
endpoint = `${endpoint}/graphql`;

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


const client = new ApolloClient({
  uri: endpoint,
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