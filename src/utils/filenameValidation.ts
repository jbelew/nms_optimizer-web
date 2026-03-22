/**
 * Regex for validating filenames across major platforms (Windows, macOS, Linux).
 *
 * Validates:
 * - Length between 1 and 255 characters.
 * - No reserved Windows filenames (CON, PRN, AUX, NUL, COM1-9, LPT1-9).
 * - No invalid characters: `< > : " / \ | ? *` and control characters.
 * - No trailing spaces or periods.
 */

const CONTROL_CHARS = "\x00-\x1F";

/**
 * Regular expression for validating filenames.
 * **Length must be between 1 and 255 characters.**
 */
export const FILENAME_REGEX = new RegExp(
	`^(?=.{1,255}$)(?!^(CON|PRn|AUX|NUL|COM[1-9]|LPT[1-9])$)[^<>:"/\\\\|?*${CONTROL_CHARS}]+(?<![ .])$`,
	"i"
);

/**
 * Validates if a string is a valid filename according to cross-platform standards.
 *
 * Validates length and checks against restricted names like `CON`, `PRN`, and
 * illegal characters like `< > : " / \ | ? *`.
 *
 * @param {string} filename - The filename to validate. Must not be empty.
 * @returns {boolean} Returns `true` if the filename is valid, otherwise `false`.
 *
 * @example
 * const isValid = isValidFilename("my_build.json");
 * // returns true
 */
export const isValidFilename = (filename: string): boolean => {
	const trimmed = filename.trim();

	return FILENAME_REGEX.test(trimmed);
};

/**
 * Sanitizes a string to make it safe for use as a filename on most file systems.
 *
 * Removes invalid characters, strips trailing spaces/periods, and enforces
 * length limits. If the result is empty or a reserved name, it defaults to `"build"`.
 *
 * @param {string} filename - The raw filename string to sanitize.
 * @returns {string} A sanitized, file-system safe filename (length capped at 255 chars).
 *
 * @example
 * const safeName = sanitizeFilename("Build: #1? (Draft)");
 * // returns "Build #1 (Draft)"
 */
export const sanitizeFilename = (filename: string): string => {
	// Remove invalid characters
	// eslint-disable-next-line no-control-regex
	let sanitized = filename.replace(/[<>:"/\\|?*\x00-\x1F`$&;(){}#!]/g, "");

	// Remove trailing spaces and periods
	sanitized = sanitized.replace(/[\s.]+$/, "");

	// Trim to 255 characters max
	if (sanitized.length > 255) {
		sanitized = sanitized.substring(0, 255);
	}

	// If result is empty or a reserved name, use a default
	if (!sanitized || /^(CON|PRn|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(sanitized)) {
		sanitized = "build";
	}

	return sanitized;
};
