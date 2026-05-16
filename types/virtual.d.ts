declare module "virtual:pwa-register" {
	export interface RegisterSWOptions {
		immediate?: boolean;
		onNeedRefresh?: (updateServiceWorker: () => Promise<void>) => void;
		onOfflineReady?: () => void;
	}

	export function registerSW(options?: RegisterSWOptions): () => Promise<void>;
}

declare module "virtual:markdown-bundle" {
	export function getMarkdown(path: string): Promise<string>;
}
