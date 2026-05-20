/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
	/** The base URL for the backend API. */
	readonly VITE_API_URL: string;
	/** The semantic version string of the current build. */
	readonly VITE_BUILD_VERSION: string;
	readonly VITE_DOCKER: string;
	readonly VITE_SENTRY_DSN: string;
	readonly VITE_SENTRY_ENABLED: string;
	readonly VITE_SENTRY_ENV: string;
}

/** The semantic version string of the application, injected at build time. */
declare const __APP_VERSION__: string;
/** The ISO date string of when the application was built, injected at build time. */
declare const __BUILD_DATE__: string;

/**
 * Global `Window` extension for development and testing utilities.
 */
interface Window {
	/** Indicates if the application has completed its initial mount and is ready. */
	__APP_READY__?: boolean;

	/** Build date of the application. */
	__BUILD_DATE__?: string;

	/** E2E Expose flag. */
	__E2E_EXPOSE__?: boolean;

	/** Direct access to specific store actions for E2E testing. */
	handleCellDoubleTap?: (row: number, col: number) => void;

	/** PWA File Handling API `launchQueue`. */
	launchQueue?: {
		setConsumer(callback: (params: { files: FileSystemFileHandle[] }) => void): void;
	};

	/** Direct access to the `ErrorStore` for E2E testing. */
	useErrorStore: import("./store/ui/uiStore").useErrorStore;
	/** Direct access to the `GridStore` for E2E testing. */
	useGridStore: import("./store/grid/gridStore").useGridStore;
	/** Direct access to the `ModuleSelectionStore` for E2E testing. */
	useModuleSelectionStore: import("./store/tech/moduleSelectionStore").useModuleSelectionStore;
	/** Direct access to the `SessionStore` for E2E testing. */
	useSessionStore: import("./store/ui/uiStore").useSessionStore;
	/** Direct access to the `ShakeStore` for E2E testing. */
	useShakeStore: import("./store/ui/uiStore").useShakeStore;
	/** Direct access to the `TechBonusStore` for E2E testing. */
	useTechBonusStore: import("./store/tech/techBonusStore").useTechBonusStore;
}
