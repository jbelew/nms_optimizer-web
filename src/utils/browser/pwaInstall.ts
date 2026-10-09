/**
 * PWA installation prompt coordination module.
 *
 * @remarks
 * Coordinates the browser's native `beforeinstallprompt` lifecycle. Because modern Chromium
 * browsers fire `beforeinstallprompt` early during initial page load—often before React components
 * mount or idle tasks execute—this module captures and holds the prompt event so that late-mounting
 * UI components (such as deferred or idle-mounted install prompts) never miss it.
 *
 * @see {@link onBeforeInstallPrompt}
 * @see {@link getDeferredInstallPrompt}
 * @see {@link ./pwaInstall.test.ts Unit Tests}
 *
 * @category Utilities
 */

/** Callback function invoked when a beforeinstallprompt event is available. */
export type BeforeInstallPromptCallback = (event: BeforeInstallPromptEvent) => void;

/**
 * Interface representing the standard Chromium BeforeInstallPromptEvent.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent}
 */
export interface BeforeInstallPromptEvent extends Event {
	/** List of platforms on which the app can be installed. */
	readonly platforms: string[];
	/**
	 * Shows the browser's native installation prompt dialog to the user.
	 *
	 * @returns {Promise<void>} Resolves when the prompt has been presented.
	 */
	prompt(): Promise<void>;
	/**
	 * Promise that resolves to the user's choice after the prompt is displayed.
	 */
	readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<BeforeInstallPromptCallback>();
let isListenerInitialized = false;

/**
 * Clears the currently cached install prompt event.
 *
 * @returns {void} Side-effects only.
 *
 * @example
 * ```ts
 * clearDeferredInstallPrompt();
 * // returns void
 * ```
 */
export function clearDeferredInstallPrompt(): void {
	deferredPrompt = null;
}

/**
 * Retrieves the currently captured deferred install prompt, if any.
 *
 * @returns {BeforeInstallPromptEvent | null} The deferred prompt event or null.
 *
 * @example
 * ```ts
 * const prompt = getDeferredInstallPrompt();
 * // returns BeforeInstallPromptEvent | null
 * ```
 */
export function getDeferredInstallPrompt(): BeforeInstallPromptEvent | null {
	return deferredPrompt;
}

/**
 * Initializes the global window event listener for `beforeinstallprompt`.
 *
 * @remarks
 * Safe to call multiple times; only attaches a single event listener.
 * Returns an unbind function for cleanup or testing.
 *
 * @returns {() => void} Cleanup function to remove the window event listener.
 *
 * @example
 * ```ts
 * const unbind = initBeforeInstallPromptListener();
 * // returns function
 * ```
 */
export function initBeforeInstallPromptListener(): () => void {
	if (typeof window === "undefined" || isListenerInitialized) {
		return () => {};
	}

	window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
	isListenerInitialized = true;

	return () => {
		window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		isListenerInitialized = false;
	};
}

/**
 * Subscribes to the `beforeinstallprompt` event.
 *
 * @remarks
 * If a `beforeinstallprompt` event was already captured before subscription,
 * the callback is immediately invoked with that cached event.
 *
 * @param {BeforeInstallPromptCallback} callback - Function called with the prompt event.
 *
 * @returns {() => void} Unsubscribe function to remove the listener.
 *
 * @example
 * ```ts
 * const unsubscribe = onBeforeInstallPrompt((e) => {
 *   console.log("Install prompt available");
 * });
 * // later
 * unsubscribe();
 * ```
 */
export function onBeforeInstallPrompt(callback: BeforeInstallPromptCallback): () => void {
	// Ensure the window listener is active
	initBeforeInstallPromptListener();

	if (deferredPrompt) {
		callback(deferredPrompt);
	}

	promptListeners.add(callback);

	return () => {
		promptListeners.delete(callback);
	};
}

/**
 * Resets internal state for unit test isolation.
 *
 * @returns {void} Side-effects only.
 *
 * @example
 * ```ts
 * resetPwaInstallForTesting();
 * // returns void
 * ```
 */
export function resetPwaInstallForTesting(): void {
	deferredPrompt = null;
	promptListeners.clear();

	if (typeof window !== "undefined") {
		initBeforeInstallPromptListener();
	}
}

/**
 * Internal event handler that intercepts the browser's native beforeinstallprompt event.
 *
 * @param {Event} e - The raw DOM event.
 *
 * @returns {void}
 */
function handleBeforeInstallPrompt(e: Event): void {
	e.preventDefault();
	deferredPrompt = e as BeforeInstallPromptEvent;
	promptListeners.forEach((listener) => {
		listener(deferredPrompt!);
	});
}

// Auto-initialize when running in browser environments
if (typeof window !== "undefined") {
	initBeforeInstallPromptListener();
}
