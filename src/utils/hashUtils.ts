/**
 * Computes the SHA-256 hash of a string using the browser's native Web Crypto API.
 *
 * This function is used to generate checksums for data integrity verification.
 * **Requires a secure context (HTTPS) in most browsers.**
 *
 * @param {string} data - The input string to hash. **Must not be null.**
 * @returns {Promise<string>} A promise that resolves to the hex-encoded hash string.
 *
 * @example
 * const hash = await computeSHA256("my-secret-data");
 */
export async function computeSHA256(data: string): Promise<string> {
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);
	const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

	return hashHex;
}
