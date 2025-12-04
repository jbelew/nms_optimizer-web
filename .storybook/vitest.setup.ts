import { setProjectAnnotations } from "@storybook/react-vite";
import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import * as projectAnnotations from "./preview";

declare global {
	const __APP_VERSION__: string;
}

if (typeof globalThis !== "undefined") {
	(globalThis as Record<string, unknown>).__APP_VERSION__ = "storybook-test";
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
}

setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
