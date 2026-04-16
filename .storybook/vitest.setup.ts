import { vi } from "vitest";

import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";

import * as projectAnnotations from "./preview";

// Mock the API calling utility at the module level to resolve race conditions
vi.mock("@/utils/apiCall", () => ({
	apiCall: vi.fn().mockImplementation(async (url: string) => {
		// Mock platforms/ship types
		if (url.includes("/platforms")) {
			return {
				standard: { type: "Starship" },
				corvette: { type: "Starship" },
				exosuit: { type: "Exosuit" },
			};
		}

		// Mock tech tree for standard ship (used in MainAppContent and ModuleSelectionDialog)
		if (url.includes("/tech_tree/")) {
			return {
				Hyperdrive: [
					{
						key: "hyper",
						label: "Hyperdrive",
						color: "purple",
						modules: [
							{ id: "h1", label: "Hyperdrive Module", type: "upgrade", checked: true },
						],
					},
				],
				technology: [],
				modules: [],
			};
		}

		return {};
	}),
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
					standard: { type: "Starship" },
					corvette: { type: "Starship" },
					exosuit: { type: "Exosuit" },
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		}

		// Mock tech tree for standard ship
		if (url.includes("/tech_tree/")) {
			return new Response(
				JSON.stringify({
					Hyperdrive: [
						{
							key: "hyper",
							label: "Hyperdrive",
							color: "purple",
							modules: [
								{ id: "h1", label: "Hyperdrive Module", type: "upgrade", checked: true },
							],
						},
					],
					technology: [],
					modules: [],
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		return originalFetch(input, init);
	};
}

setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
