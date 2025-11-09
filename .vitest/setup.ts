import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest';

// Mock the hideSplashScreen function
vi.mock("vite-plugin-splash-screen/runtime", () => ({
	hideSplashScreen: vi.fn(),
}));

// Mock .scss imports
vi.mock('*.scss', () => ({}));

// Mock local storage
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
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
