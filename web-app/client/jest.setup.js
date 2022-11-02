jest.mock('clientjs');

const routerMock = {
  push: jest.fn(),
};
jest.mock('next/router', () => ({
  ...jest.requireActual('next/router'),
  useRouter: () => routerMock,
}));

const localStorageMock = (function () {
  let store = {};

  return {
    getItem(key) {
      return store[key];
    },
    setItem(key, value) {
      store[key] = value;
    },
    clear() {
      store = {};
    },
    removeItem(key) {
      delete store[key];
    },
    getAll() {
      return store;
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import '@testing-library/jest-dom/extend-expect';
