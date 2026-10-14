export interface RegisterSWOptions {
	immediate?: boolean;
	onNeedRefresh?: (updateServiceWorker: () => Promise<void>) => void;
	onNeedReload?: () => void;
	onOfflineReady?: () => void;
}

export function registerSW(_options?: RegisterSWOptions): () => Promise<void> {
	return async () => {
		// Mock implementation
	};
}
