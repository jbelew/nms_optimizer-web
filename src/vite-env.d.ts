/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
	readonly VITE_BUILD_VERSION: string;
	// Add other env variables here if needed
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;

interface Window {
	useGridStore: typeof import("./store/GridStore").useGridStore;
}
