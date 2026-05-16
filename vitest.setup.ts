import "@testing-library/jest-dom";
import { vi } from "vitest";

// Suppress known console warnings from Radix UI accessibility checks during tests
const originalWarn = console.warn;

console.warn = (...args: unknown[]) => {
	const message = String(args[0]);

	if (
		message.includes("DialogContent") ||
		message.includes("VisuallyHidden") ||
		message.includes("Description") ||
		message.includes("aria-describedby")
	) {
		return;
	}

	originalWarn(...args);
};

// Mock virtual modules
vi.mock("virtual:pwa-register", () => ({
	registerSW: vi.fn((_options: unknown) => vi.fn()),
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
if (typeof window !== "undefined") {
	Object.defineProperty(window, "matchMedia", {
		value: vi.fn().mockImplementation((query) => ({
			addEventListener: vi.fn(),
			addListener: vi.fn(),
			dispatchEvent: vi.fn(),
			matches: false,
			media: query,
			onchange: null,
			removeEventListener: vi.fn(),
			removeListener: vi.fn(),
		})),
		writable: true,
	});
}

// Mock localStorage
const localStorageMock = (() => {
	let store: { [key: string]: string } = {};

	return {
		clear: () => {
			store = {};
		},
		getItem: (key: string) => store[key] || null,
		key: (index: number) => {
			const keys = Object.keys(store);

			return keys[index] || null;
		},
		get length() {
			return Object.keys(store).length;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		setItem: (key: string, value: string) => {
			store[key] = value.toString();
		},
	};
})();

if (typeof window !== "undefined") {
	Object.defineProperty(window, "localStorage", { value: localStorageMock });
}

// Mock File.prototype.text() method for file reading in tests
if (typeof File !== "undefined" && !File.prototype.text) {
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
