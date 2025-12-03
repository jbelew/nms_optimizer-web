import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";

import * as projectAnnotations from "./preview";

// Define global variables for tests
declare global {
	const __APP_VERSION__: string;
}

if (typeof globalThis !== "undefined") {
	(globalThis as Record<string, unknown>).__APP_VERSION__ = "storybook-test";
}

// Mock local storage for story tests (only in browser environment)
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

	// Also set __APP_VERSION__ on window
	(window as unknown as Record<string, unknown>).__APP_VERSION__ = "storybook-test";
}

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
