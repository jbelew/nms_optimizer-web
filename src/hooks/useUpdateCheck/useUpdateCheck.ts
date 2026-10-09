import { useEffect } from "react";

/**
 * Custom hook for detecting application updates via Service Worker.
 *
 * @remarks
 * Listens for the `new-version-available` event dispatched by the service
 * worker registration when a new service worker has installed and is waiting.
 * When triggered, it invokes the provided callback with the `updateSW` function.
 *
 * @param {(updateSW: (reloadPage?: boolean) => Promise<void>) => void} onUpdateAvailable - Callback function that receives the `updateSW` function from the service worker.
 *
 * @returns {void} Side-effects only; registers event listeners.
 *
 * @see {@link ./useUpdateCheck.test.ts Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const App = () => {
 *   const [showPrompt, setShowPrompt] = useState(false);
 *   const updateFn = useRef<() => void>();
 *
 *   useUpdateCheck((updateSW) => {
 *     updateFn.current = updateSW;
 *     setShowPrompt(true);
 *   });
 *
 *   return (
 *     {showPrompt && (
 *       <UpdateDialog onConfirm={() => updateFn.current?.(true)} />
 *     )}
 *   );
 * };
 * ```
 */
export const useUpdateCheck = (
	onUpdateAvailable: (updateSW: (reloadPage?: boolean) => Promise<void>) => void
) => {
	useEffect(() => {
		const handleNewVersion = (event: Event) => {
			if (!(event instanceof CustomEvent)) return;
			onUpdateAvailable(event.detail);
		};

		window.addEventListener("new-version-available", handleNewVersion);

		return () => {
			window.removeEventListener("new-version-available", handleNewVersion);
		};
	}, [onUpdateAvailable]);
};
