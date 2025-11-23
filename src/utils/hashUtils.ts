/**
 * Computes SHA-256 hash of a string using the Web Crypto API.
 *
 * @param {string} data - The string to hash.
 * @returns {Promise<string>} A promise that resolves to the hex-encoded hash.
 */
export async function computeSHA256(data: string): Promise<string> {
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);
	const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	return hashHex;
}
