/**
 * Custom error class for HTTP errors.
 *
 * Provides a structured way to handle failed network requests by including
 * the HTTP status code and status text alongside the error message.
 *
 * @example
 * throw new HttpError(404, "Not Found", "User with ID 1 does not exist");
 */
export class HttpError extends Error {
	/**
	 * The HTTP status code (e.g., 404, 500).
	 */
	status: number;

	/**
	 * The HTTP status text (e.g., "Not Found", "Internal Server Error").
	 */
	statusText: string;

	/**
	 * Creates an instance of `HttpError`.
	 *
	 * @param {number} status - The HTTP status code. **Must be a valid HTTP status.**
	 * @param {string} statusText - The HTTP status text.
	 * @param {string} [message] - An optional descriptive error message. Defaults to a generic "HTTP error" string.
	 * @returns {HttpError} A new `HttpError` instance.
	 * @example
	 */
	constructor(status: number, statusText: string, message?: string) {
		super(message || `HTTP error! status: ${status}`);
		this.name = "HttpError";
		this.status = status;
		this.statusText = statusText;
	}
}
