import { useEffect, useRef, useState } from "react";

/**
 * Options for the `useDebouncedValidation` hook.
 */
interface UseDebouncedValidationOptions {
	/** Delay in milliseconds before the validation is executed. Defaults to `250`. */
	debounceMs?: number;
}

/**
 * Custom hook for executing validation logic with a debounce delay.
 *
 * @remarks
 * This is useful for validating user input (e.g., in a text field) without
 * triggering validation on every keystroke. It handles timer cleanup on unmount
 * to prevent memory leaks and state updates on unmounted components.
 *
 * @param {function(string): string|null} validator - A function that takes the current value and returns an error string or `null` if valid. **Must be a pure function.**
 * @param {UseDebouncedValidationOptions} [options={}] - Configuration for the debounce behavior.
 * @returns {{ error: string|null, handleChange: function(string): void }} State containing the current error and a handler for input changes.
 *
 * @hook
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { error, handleChange } = useDebouncedValidation(
 *   (val) => (val.length < 3 ? "Too short" : null),
 *   { debounceMs: 500 }
 * );
 *
 * // handleChange("a"); // error remains null for 500ms
 * // ... after 500ms: error is "Too short"
 * ```
 */
export const useDebouncedValidation = (
	validator: (value: string) => string | null,
	{ debounceMs = 250 }: UseDebouncedValidationOptions = {}
) => {
	const [error, setError] = useState<string | null>(null);
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleChange = (value: string) => {
		// Clear existing timer
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		// Set new debounced validation
		debounceTimerRef.current = setTimeout(() => {
			setError(validator(value));
		}, debounceMs);
	};

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	return { error, handleChange };
};
