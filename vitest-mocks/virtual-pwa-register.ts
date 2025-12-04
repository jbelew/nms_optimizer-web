export interface RegisterSWOptions {
	immediate?: boolean;
	onOfflineReady?: () => void;
	onNeedRefresh?: (updateServiceWorker: () => Promise<void>) => void;
}

export function registerSW(options?: RegisterSWOptions): () => Promise<void> {
	return async () => {
		// Mock implementation
	};
}
