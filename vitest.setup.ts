import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock virtual modules
vi.mock("virtual:pwa-register", () => ({
	registerSW: vi.fn((options: unknown) => vi.fn()),
}));

vi.mock("virtual:markdown-bundle", () => ({
	getMarkdown: vi.fn(() => Promise.resolve("")),
}));

// Define global variables
declare global {
	const __APP_VERSION__: string;
	const __BUILD_DATE__: string;
}

if (typeof globalThis !== "undefined") {
	(globalThis as Record<string, unknown>).__APP_VERSION__ = "test-version";
	(globalThis as Record<string, unknown>).__BUILD_DATE__ = "test-date";
}

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// Mock localStorage
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
		key: (index: number) => {
			const keys = Object.keys(store);
			return keys[index] || null;
		},
		get length() {
			return Object.keys(store).length;
		},
	};
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock File.prototype.text() method for file reading in tests
if (!File.prototype.text) {
	Object.defineProperty(File.prototype, "text", {
		value: async function () {
			return new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result as string);
				reader.onerror = () => reject(reader.error);
				reader.readAsText(this);
			});
		},
	});
}
