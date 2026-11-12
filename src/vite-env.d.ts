/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
	/** Whether Google Analytics 4 telemetry is enabled (`"false"` disables tracking). */
	readonly VITE_ANALYTICS_ENABLED?: string;
	/** The base URL for the backend API. */
	readonly VITE_API_URL: string;
	/** The semantic version string of the current build. */
	readonly VITE_BUILD_VERSION: string;
	readonly VITE_DOCKER: string;
	/** Whether Playwright E2E test hooks are active. */
	readonly VITE_E2E_TESTING?: string;
	readonly VITE_SENTRY_DSN: string;
	readonly VITE_SENTRY_ENABLED: string;
	readonly VITE_SENTRY_ENV: string;
	/** Optional WebSocket origin override for local or custom solver deployments. */
	readonly VITE_WS_URL?: string;
}

/** The semantic version string of the application, injected at build time. */
declare const __APP_VERSION__: string;
/** The ISO date string of when the application was built, injected at build time. */
declare const __BUILD_DATE__: string;

/**
 * Global `Window` extension for development, telemetry, and testing utilities.
 */
interface Window {
	/** Build date of the application. */
	__BUILD_DATE__?: string;

	/** E2E Expose flag. */
	__E2E_EXPOSE__?: boolean;

	/** Google Tag Manager / `gtag.js` command queue. */
	dataLayer?: unknown[];

	/** Google Tag Manager container registry populated when `gtag/js` loads. */
	google_tag_manager?: Record<string, unknown>;

	/** Direct `gtag.js` dispatch function initialized by the telemetry layer. */
	gtag?: (...args: unknown[]) => void;

	/** PWA File Handling API `launchQueue`. */
	launchQueue?: {
		setConsumer(callback: (params: { files: FileSystemFileHandle[] }) => void): void;
	};

	/** Lifecycle coordinator instance governing application lifecycle phases. */
	lifecycleCoordinator?: import("./utils/system/lifecycleCoordinator").LifecycleCoordinator;

	/** Direct access to the `GridStore` for E2E testing. */
	useGridStore: import("./store/grid/gridStore").useGridStore;
	/** Direct access to the `ModuleSelectionStore` for E2E testing. */
	useModuleSelectionStore: {
		getState: () => {
			clearAllModuleSelections: () => void;
			moduleSelections: Record<string, string[]>;
			setModuleSelection: (tech: string, modules: string[]) => void;
		};
		setState: (updates: { moduleSelections?: Record<string, string[]> }) => void;
	};
	/** Direct access to the `ShakeStore` for E2E testing. */
	useShakeStore: import("./store/ui/uiStore").useShakeStore;
	/** Direct access to the `TechBonusStore` for E2E testing. */
	useTechBonusStore: {
		getState: () => {
			bonusStatus: Record<string, import("./store/tech/techStore").BonusStatusData>;
			clearAllBonusStatus: () => void;
			setBonusStatus: (
				tech: string,
				bonus: import("./store/tech/techStore").BonusStatusData,
			) => void;
		};
		setState: (updates: {
			bonusStatus?: Record<string, import("./store/tech/techStore").BonusStatusData>;
		}) => void;
	};
	/** Direct access to the `TechStore` for E2E testing. */
	useTechStore: import("./store/tech/techStore").useTechStore;
}
