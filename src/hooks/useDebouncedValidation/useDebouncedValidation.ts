import { useCallback, useEffect, useRef, useState } from "react";

interface UseDebouncedValidationOptions {
	debounceMs?: number;
}

/**
 * Custom hook for debounced validation
 * @param validator - Function that validates input and returns error message (or null if valid)
 * @param options - Configuration options
 * @returns Object with error state and change handler
 */
export const useDebouncedValidation = (
	validator: (value: string) => string | null,
	{ debounceMs = 250 }: UseDebouncedValidationOptions = {}
) => {
	const [error, setError] = useState<string | null>(null);
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleChange = useCallback(
		(value: string) => {
			// Clear existing timer
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}

			// Set new debounced validation
			debounceTimerRef.current = setTimeout(() => {
				setError(validator(value));
			}, debounceMs);
		},
		[validator, debounceMs]
	);

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
