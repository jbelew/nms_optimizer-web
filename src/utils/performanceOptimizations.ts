/**
 * Performance Optimization Utilities
 *
 * This file contains reusable utilities to help optimize performance across the application.
 * Based on analysis of Trace-20251116T101135.json.gz
 */

/**
 * Throttle function - Limits function execution to a maximum frequency
 *
 * Usage:
 *   const throttledHandler = throttle(expensiveFunction, 16); // ~60 FPS
 *   element.addEventListener('mousemove', throttledHandler);
 *
 * @param callback - The function to throttle
 * @param delay - Minimum milliseconds between function calls
 * @returns Throttled version of the callback
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
	callback: T,
	delay: number
): (...args: Parameters<T>) => void {
	let lastCall = 0;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return function throttled(...args: Parameters<T>) {
		const now = Date.now();
		const timeSinceLastCall = now - lastCall;

		if (timeSinceLastCall >= delay) {
			lastCall = now;
			if (timeoutId !== null) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
			callback(...args);
		} else if (!timeoutId) {
			// Schedule another call at the end of the delay period
			timeoutId = setTimeout(() => {
				lastCall = Date.now();
				timeoutId = null;
				callback(...args);
			}, delay - timeSinceLastCall);
		}
	};
}

/**
 * Debounce function - Delays function execution until a period of inactivity
 *
 * Usage:
 *   const debouncedSearch = debounce(search, 300);
 *   input.addEventListener('input', debouncedSearch);
 *
 * @param callback - The function to debounce
 * @param delay - Milliseconds of inactivity before execution
 * @returns Debounced version of the callback
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
	callback: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return function debounced(...args: Parameters<T>) {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			callback(...args);
			timeoutId = null;
		}, delay);
	};
}

/**
 * Request Animation Frame Debounce
 * Batches updates to happen on the next animation frame
 *
 * Usage:
 *   const batchedUpdate = rafDebounce(updateDOM);
 *   element.addEventListener('input', (e) => batchedUpdate(() => processInput(e)));
 *
 * @param callback - The function to batch
 * @returns Function that schedules the callback on next RAF
 */
export function rafDebounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
	callback: T
): (...args: Parameters<T>) => void {
	let rafId: number | null = null;

	return function scheduled(...args: Parameters<T>) {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
		}

		rafId = requestAnimationFrame(() => {
			callback(...args);
			rafId = null;
		});
	};
}

/**
 * Batch DOM Updates - Groups multiple DOM operations into a single reflow/repaint
 *
 * Usage:
 *   batchDOMUpdates(() => {
 *     element1.style.width = '100px';
 *     element2.style.height = '50px';
 *     element3.classList.add('active');
 *   });
 *
 * @param updates - Function containing DOM mutations
 */
export function batchDOMUpdates(updates: () => void): void {
	requestAnimationFrame(() => {
		updates();
	});
}

/**
 * Safely Read Layout Properties
 * Reads layout properties and batches them before writing
 * Prevents layout thrashing
 *
 * Usage:
 *   const { width, height } = readLayoutProperties(() => ({
 *     width: element.offsetWidth,
 *     height: element.offsetHeight
 *   }));
 *
 * @param reader - Function that reads layout properties
 * @returns The read properties
 */
export function readLayoutProperties<T extends Record<string, unknown>>(reader: () => T): T {
	// Disable transitions temporarily to avoid animation during layout reads
	const root = document.documentElement;
	const pointerEvents = root.style.pointerEvents;
	root.style.pointerEvents = "none";

	try {
		return reader();
	} finally {
		root.style.pointerEvents = pointerEvents;
	}
}

/**
 * Observe visibility and pause animations when off-screen
 *
 * Usage:
 *   observeVisibility(animatedElement, {
 *     onVisible: () => startAnimation(),
 *     onHidden: () => pauseAnimation()
 *   });
 *
 * @param element - The element to observe
 * @param callbacks - Callbacks for visibility changes
 * @returns Function to stop observing
 */
export function observeVisibility(
	element: Element,
	callbacks: {
		onVisible?: () => void;
		onHidden?: () => void;
	}
): () => void {
	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				callbacks.onVisible?.();
			} else {
				callbacks.onHidden?.();
			}
		},
		{
			threshold: 0.1,
		}
	);

	observer.observe(element);

	return () => observer.disconnect();
}

/**
 * Measure Performance of a Function
 * Logs execution time to console in development
 *
 * Usage:
 *   const result = measurePerformance('expensiveCalc', () => calculate());
 *
 * @param label - The label for this operation
 * @param fn - The function to measure
 * @returns The result of the function
 */
export function measurePerformance<T>(label: string, fn: () => T): T {
	if (process.env.NODE_ENV === "development") {
		const start = performance.now();
		const result = fn();
		const duration = performance.now() - start;

		if (duration > 16.67) {
			// 60 FPS threshold
			console.warn(
				`⚠️ Performance: "${label}" took ${duration.toFixed(2)}ms (exceeds 16.67ms budget)`
			);
		} else {
			console.log(`✓ Performance: "${label}" took ${duration.toFixed(2)}ms`);
		}

		return result;
	}

	return fn();
}

/**
 * Batch Multiple Layout Reads and Writes
 * Prevents layout thrashing by reading first, then writing
 *
 * Usage:
 *   const results = batchLayoutOperations([
 *     { read: () => element1.offsetWidth, write: (w) => element1.style.left = w + 'px' },
 *     { read: () => element2.offsetHeight, write: (h) => element2.style.top = h + 'px' }
 *   ]);
 *
 * @param operations - Array of read/write pairs
 * @returns Array of read results
 */
export function batchLayoutOperations<T>(
	operations: Array<{
		read: () => T;
		write: (value: T) => void;
	}>
): T[] {
	// First, read all layout properties
	const readValues = operations.map((op) => op.read());

	// Then batch writes on the next frame
	requestAnimationFrame(() => {
		operations.forEach((op, index) => {
			op.write(readValues[index]);
		});
	});

	return readValues;
}

/**
 * Pause Page Animations When Tab is Hidden
 * Automatically resumes when tab becomes visible
 *
 * Usage:
 *   const cleanup = pauseAnimationsOnHidden();
 */
export function pauseAnimationsOnHidden(): () => void {
	const handleVisibilityChange = () => {
		const animations = document.getAnimations?.() || [];

		if (document.hidden) {
			animations.forEach((animation) => {
				if (animation.playState === "running") {
					animation.pause();
					// Mark that we paused it (so we don't resume others)
					(animation as unknown as { __wasPaused?: boolean }).__wasPaused = true;
				}
			});
		} else {
			animations.forEach((animation) => {
				if ((animation as unknown as { __wasPaused?: boolean }).__wasPaused) {
					animation.play();
					delete (animation as unknown as { __wasPaused?: boolean }).__wasPaused;
				}
			});
		}
	};

	document.addEventListener("visibilitychange", handleVisibilityChange);

	// Return cleanup function
	return function cleanup() {
		document.removeEventListener("visibilitychange", handleVisibilityChange);
	};
}

/**
 * Memoize an Expensive Function Result
 * Caches result and only recalculates when dependencies change
 *
 * Usage:
 *   const memoized = memoize(calculateLayout, (deps) => JSON.stringify(deps));
 *
 * @param fn - The function to memoize
 * @param keyGenerator - Optional function to generate cache key
 * @returns Memoized version of the function
 */
export function memoize<T extends (...args: Parameters<T>) => ReturnType<T>>(
	fn: T,
	keyGenerator?: (args: Parameters<T>) => string
): T {
	const cache = new Map<string, ReturnType<T>>();

	return ((...args: Parameters<T>) => {
		const key = keyGenerator ? keyGenerator(args) : JSON.stringify(args);

		if (cache.has(key)) {
			return cache.get(key) as ReturnType<T>;
		}

		const result = fn(...args);
		cache.set(key, result);

		// Limit cache size to prevent memory issues
		if (cache.size > 100) {
			const firstKey = cache.keys().next().value as string;
			cache.delete(firstKey);
		}

		return result;
	}) as T;
}

/**
 * Monitor Core Web Vitals
 * Sends metrics to console and analytics
 *
 * Usage:
 *   monitorWebVitals((metrics) => {
 *     console.log('Web Vitals:', metrics);
 *     analytics.track('web_vitals', metrics);
 *   });
 */
export function monitorWebVitals(
	callback: (metrics: { lcp?: number; fid?: number; cls?: number; ttfb?: number }) => void
): void {
	const metrics: Record<string, unknown> = {};

	// Largest Contentful Paint
	try {
		const observer = new PerformanceObserver((list) => {
			const entries = list.getEntries();
			const lastEntry = entries[entries.length - 1] as unknown as {
				renderTime?: number;
				loadTime?: number;
			};
			metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
			callback(metrics as Parameters<typeof callback>[0]);
		});
		observer.observe({ entryTypes: ["largest-contentful-paint"] });
	} catch {
		console.debug("LCP observer not supported");
	}

	// First Input Delay
	try {
		const observer = new PerformanceObserver((list) => {
			const entries = list.getEntries();
			entries.forEach((entry) => {
				metrics.fid = (
					entry as unknown as { processingDuration?: number }
				).processingDuration;
				callback(metrics as Parameters<typeof callback>[0]);
			});
		});
		observer.observe({ entryTypes: ["first-input"] });
	} catch {
		console.debug("FID observer not supported");
	}

	// Cumulative Layout Shift
	try {
		let clsValue = 0;
		const observer = new PerformanceObserver((list) => {
			list.getEntries().forEach((entry) => {
				if (!(entry as unknown as { hadRecentInput?: boolean }).hadRecentInput) {
					clsValue += (entry as unknown as { value?: number }).value || 0;
					metrics.cls = clsValue;
					callback(metrics as Parameters<typeof callback>[0]);
				}
			});
		});
		observer.observe({ entryTypes: ["layout-shift"] });
	} catch {
		console.debug("CLS observer not supported");
	}

	// Time to First Byte
	try {
		const nav = performance.getEntriesByType("navigation")[0] as unknown as {
			responseStart?: number;
			fetchStart?: number;
		};
		if (nav) {
			metrics.ttfb = (nav.responseStart || 0) - (nav.fetchStart || 0);
			callback(metrics as Parameters<typeof callback>[0]);
		}
	} catch {
		console.debug("TTFB measurement not available");
	}
}

export default {
	throttle,
	debounce,
	rafDebounce,
	batchDOMUpdates,
	readLayoutProperties,
	observeVisibility,
	measurePerformance,
	batchLayoutOperations,
	pauseAnimationsOnHidden,
	memoize,
	monitorWebVitals,
};
