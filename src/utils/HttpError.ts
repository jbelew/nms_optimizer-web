/**
 * Custom error class for HTTP errors.
 * Allows handling specific status codes and messages.
 */
export class HttpError extends Error {
	status: number;
	statusText: string;

	constructor(status: number, statusText: string, message?: string) {
		super(message || `HTTP error! status: ${status}`);
		this.name = "HttpError";
		this.status = status;
		this.statusText = statusText;
	}
}
