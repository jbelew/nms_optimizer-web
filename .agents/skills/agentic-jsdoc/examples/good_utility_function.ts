// @ts-nocheck
// GOOD EXAMPLE - Plain utility function with full JSDoc coverage

/**
 * Shape of the result returned by `parseCSVRow`.
 */
interface ParsedRow {
  /** The ordered column values extracted from the row. */
  columns: string[];
  /** The zero-based row index in the source file. */
  index: number;
}

/**
 * Parses a single CSV row into structured column data.
 *
 * @remarks
 * Handles quoted fields containing commas and trims whitespace from each value.
 * Does not validate column count against a header row — callers should
 * verify alignment separately.
 *
 * @template T - Optional narrowed return type when columns are known at compile time.
 * @param {string} raw - The raw CSV line to parse.
 * @param {number} index - The zero-based position of this row in the file.
 * @returns {ParsedRow} The parsed column values and their source index.
 * @throws {SyntaxError} Throws if the row contains an unterminated quoted field.
 * @see {@link validateCSVHeaders}
 * @category Utilities
 *
 * @example
 * const row = parseCSVRow('"hello, world",42', 0);
 * // returns { columns: ["hello, world", "42"], index: 0 }
 */
export function parseCSVRow(raw: string, index: number): ParsedRow {
  const columns: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of raw) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      columns.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (inQuotes) throw new SyntaxError("Unterminated quoted field");
  columns.push(current.trim());

  return { columns, index };
}
