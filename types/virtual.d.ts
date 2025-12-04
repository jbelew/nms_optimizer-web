declare module "virtual:pwa-register" {
	export interface RegisterSWOptions {
		immediate?: boolean;
		onOfflineReady?: () => void;
		onNeedRefresh?: (updateServiceWorker: () => Promise<void>) => void;
	}

	export function registerSW(options?: RegisterSWOptions): () => Promise<void>;
}

declare module "virtual:markdown-bundle" {
	export function getMarkdown(path: string): Promise<string>;
}
