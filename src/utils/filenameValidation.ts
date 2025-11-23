/**
 * Regex for validating filenames
 * Validates:
 * - Length between 1 and 255 characters
 * - No reserved Windows filenames (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
 * - No invalid characters: < > : " / \ | ? * and control characters
 * - No trailing spaces or periods
 */

const CONTROL_CHARS = "\x00-\x1F";
export const FILENAME_REGEX = new RegExp(
	`^(?=.{1,255}$)(?!^(CON|PRn|AUX|NUL|COM[1-9]|LPT[1-9])$)[^<>:"/\\\\|?*${CONTROL_CHARS}]+(?<![ .])$`,
	"i"
);

/**
 * Validates if a filename is valid according to cross-platform standards
 * @param filename - The filename to validate
 * @returns true if valid, false otherwise
 */
export const isValidFilename = (filename: string): boolean => {
	const trimmed = filename.trim();
	return FILENAME_REGEX.test(trimmed);
};

/**
 * Sanitizes a filename to make it safe for file systems
 * Removes invalid characters while preserving spaces and general readability
 * @param filename - The filename to sanitize
 * @returns A sanitized filename safe for use in file systems
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
