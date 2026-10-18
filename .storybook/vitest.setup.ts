import { vi } from "vitest";

import type * as NetworkModule from "@/utils/api/network";

import {
	installStorybookFetchMock,
	mockColossusTechTree,
	mockPerformanceMetrics,
	mockPlatforms,
	mockTechTree,
	mockUserStats,
} from "./mockFetch";

// Mock the API calling utility at the module level to resolve race conditions
vi.mock("@/utils/api/network", async (importOriginal) => {
	const actual = await importOriginal<typeof NetworkModule>();

	return {
		...actual,
		apiCall: vi.fn().mockImplementation(async (url: string) => {
			if (url.includes("platforms")) {
				return mockPlatforms;
			}

			if (url.includes("tech_tree/colossus")) {
				return mockColossusTechTree;
			}

			if (url.includes("tech_tree/")) {
				return mockTechTree;
			}

			if (url.includes("analytics/performance_data")) {
				return mockPerformanceMetrics;
			}

			if (url.includes("analytics/popular_data")) {
				return mockUserStats;
			}

			return {};
		}),
	};
});

// Mock the splash screen runtime to prevent "Splash screen not found" errors in tests
vi.mock("vite-plugin-splash-screen/runtime", () => ({
	hideSplashScreen: vi.fn(),
}));

declare global {
	const __APP_VERSION__: string;
	const __BUILD_DATE__: string;
}

if (typeof globalThis !== "undefined") {
	(globalThis as Record<string, unknown>).__APP_VERSION__ = "storybook-test";
	(globalThis as Record<string, unknown>).__BUILD_DATE__ = "2024-01-01";
}

if (typeof window !== "undefined") {
	const localStorageMock = (() => {
		let store: { [key: string]: string } = {};

		return {
			clear: () => {
				store = {};
			},
			getItem: (key: string) => store[key] || null,
			removeItem: (key: string) => {
				delete store[key];
			},
			setItem: (key: string, value: string) => {
				store[key] = value.toString();
			},
		};
	})();
	Object.defineProperty(window, "localStorage", { value: localStorageMock });
	(window as unknown as Record<string, unknown>).__APP_VERSION__ = "storybook-test";
	(window as unknown as { IS_STORYBOOK_TEST?: boolean }).IS_STORYBOOK_TEST = true;

	installStorybookFetchMock();
}
