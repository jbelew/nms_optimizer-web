/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

/**
 * Interface for environment variables accessible via `import.meta.env`.
 */
interface ImportMetaEnv {
	/** The base URL for the backend API. */
	readonly VITE_API_URL: string;
	/** The semantic version string of the current build. */
	readonly VITE_BUILD_VERSION: string;
}

/**
 * Type extension for Vite's `ImportMeta` to include custom environment variables.
 */
interface ImportMeta {
	readonly env: ImportMetaEnv;
}

/** The semantic version string of the application, injected at build time. */
declare const __APP_VERSION__: string;
/** The ISO date string of when the application was built, injected at build time. */
declare const __BUILD_DATE__: string;

/**
 * Global `Window` extension for development and testing utilities.
 */
interface Window {
	/** Direct access to the `GridStore` for E2E testing. */
	useGridStore: typeof import("./store/GridStore").useGridStore;
}
