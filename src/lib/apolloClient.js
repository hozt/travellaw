import pkg from '@apollo/client';
import dotenv from 'dotenv';
dotenv.config();

const graphQL = process.env.GRAPHQL_URL;

//const graphQL = import.meta.env.GRAPHQL_URL;

if (!graphQL) {
  throw new Error('GRAPHQL_URL environment variable is not set');
}

const { ApolloClient, InMemoryCache } = pkg;

const client = new ApolloClient({
  uri: graphQL,
  cache: new InMemoryCache(),
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

clearCache();
