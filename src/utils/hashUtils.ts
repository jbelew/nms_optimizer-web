/**
 * Utility module for cryptographic operations.
 *
 * @remarks
 * This module provides functions for generating secure hashes using the Web Crypto API.
 * It ensures data integrity and supports checksum verification across the application.
 *
 * @category Utilities
 * @see {@link computeSHA256}
 */

/**
 * Computes the SHA-256 hash of a string using the browser's native Web Crypto API.
 *
 * @remarks
 * This function is used to generate checksums for data integrity verification.
 * It converts the input string to a byte array, computes the digest, and
 * returns the result as a hex-encoded string.
 *
 * **Requires a secure context (HTTPS) in most browsers.**
 *
 * @param {string} data - The input string to hash. **Must not be null.**
 * @returns {Promise<string>} A promise that resolves to the hex-encoded hash string.
 * @category Utilities
 *
 * @example
 * ```ts
 * const hash = await computeSHA256("my-secret-data");
 * // returns Promise<string>
 * ```
 */
export async function computeSHA256(data: string): Promise<string> {
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);
	const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

	return hashHex;
}
