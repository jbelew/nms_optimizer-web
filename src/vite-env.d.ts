/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
	// Add other env variables here if needed
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;

interface Window {
	useGridStore: typeof import("./store/GridStore").useGridStore;
}
