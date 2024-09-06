// src/store/articleStore.js

let store = {
    articles: [],
    pageInfo: {
      endCursor: null,
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null
    },
    currentPage: 1
  };

  const subscribers = new Set();

  export const articleStore = {
    subscribe(callback) {
      subscribers.add(callback);
      callback(store);
      return () => subscribers.delete(callback);
    },
    set(newStore) {
      store = { ...store, ...newStore };
      subscribers.forEach(callback => callback(store));
    },
    update(updater) {
      const newStore = updater(store);
      articleStore.set(newStore);
    }
  };