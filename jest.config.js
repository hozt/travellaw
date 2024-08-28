module.exports = {
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.jsx?$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'jsx'],
    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  };
