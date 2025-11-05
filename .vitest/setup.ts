import '@testing-library/jest-dom/vitest'

// Mock local storage, but only for the happy-dom environment
if (process.env.VITEST_ENVIRONMENT === 'happy-dom') {
  const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      clear: () => {
        store = {};
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    };
  })();

  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  }
}
