import { vi } from "vitest";

// Mock the API calling utility at the module level to resolve race conditions
vi.mock("@/utils/apiCall", () => ({
	apiCall: vi.fn().mockImplementation(async (url: string) => {
		// Mock platforms/ship types
		if (url.includes("/platforms")) {
			return {
				corvette: { type: "Starship" },
				exosuit: { type: "Exosuit" },
				standard: { type: "Starship" },
			};
		}

		// Mock tech tree for standard ship (used in MainAppContent and ModuleSelectionDialog)
		if (url.includes("/tech_tree/")) {
			return {
				Hyperdrive: [
					{
						color: "purple",
						key: "hyper",
						label: "Hyperdrive",
						modules: [
							{ checked: true, id: "h1", label: "Hyperdrive Module", type: "upgrade" },
						],
					},
				],
				modules: [],
				technology: [],
			};
		}

		return {};
	}),
}));

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

	// Global intercepting mock for fetch as a secondary fallback
	const originalFetch = window.fetch;

	window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
		const url =
			typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

		// Mock ship types
		if (url.includes("/platforms")) {
			return new Response(
				JSON.stringify({
					corvette: { type: "Starship" },
					exosuit: { type: "Exosuit" },
					standard: { type: "Starship" },
				}),
				{ headers: { "Content-Type": "application/json" }, status: 200 }
			);
		}

		// Mock tech tree for standard ship
		if (url.includes("/tech_tree/")) {
			return new Response(
				JSON.stringify({
					Hyperdrive: [
						{
							color: "purple",
							key: "hyper",
							label: "Hyperdrive",
							modules: [
								{ checked: true, id: "h1", label: "Hyperdrive Module", type: "upgrade" },
							],
						},
					],
					modules: [],
					technology: [],
				}),
				{
					headers: { "Content-Type": "application/json" },
					status: 200,
				}
			);
		}

		return originalFetch(input, init);
	};
}
