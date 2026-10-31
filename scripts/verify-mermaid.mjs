/**
 * @file Mermaid fenced-block syntax validator for Markdown docs and GitHub PR bodies.
 *
 * Catches GitHub Mermaid rendering failures before commit/PR publication:
 * - `sequenceDiagram`: `;` and `#` statement/comment terminators inside message or header text,
 *   unquoted `[[...]]` tokens in `participant` aliases, and unbalanced `alt`/`opt`/`loop`/etc. blocks.
 * - `flowchart` / `graph`: unquoted special characters (`()`, `[]`) or HTML tags inside node labels,
 *   and unbalanced `subgraph` / `end` blocks.
 * - Unclosed ```mermaid fenced code blocks or unsupported diagram headers.
 *
 * Usage:
 *   bun scripts/verify-mermaid.mjs [path/to/file.md ...]
 */

import fs from "node:fs";
import path from "node:path";

const DEFAULT_GLOBS = [
	"AGENTS.md",
	"GEMINI.md",
	"GLOSSARY.md",
	"README.md",
	"docs/**/*.md",
	"public/assets/**/*.md",
	".agents/skills/**/*.md",
];

const SUPPORTED_HEADERS = [
	/^flowchart(?:\s+(?:TB|TD|BT|RL|LR))?$/,
	/^graph(?:\s+(?:TB|TD|BT|RL|LR))?$/,
	/^sequenceDiagram$/,
	/^stateDiagram(?:-v2)?$/,
	/^classDiagram$/,
	/^erDiagram$/,
	/^xychart-beta$/,
];

const SEQUENCE_BLOCK_OPENERS = /^(?:alt|opt|loop|par|critical|break|rect|box)\b/;
const SEQUENCE_TEXT_CLAUSES =
	/^(?:alt|else|opt|loop|par|and|critical|option|break|note\s+(?:left\s+of|right\s+of|over)\s+[^:]+:)\b/;

/**
 * Extracts and validates all ```mermaid fenced code blocks in a Markdown document.
 *
 * @param {string} markdownText - Raw Markdown document contents.
 * @param {string} [filePath] - File path label used in error diagnostics.
 * @returns {Array<{ blockIndex: number, filePath: string, line: number, message: string }>} Validation errors with 1-based Markdown line numbers.
 * @default filePath = "<markdown>"
 * @see {@link ./verify-mermaid.test.mjs Unit Tests}
 */
export function validateMarkdownMermaid(markdownText, filePath = "<markdown>") {
	const lines = markdownText.split(/\r?\n/);
	const diagnostics = [];
	let activeFence = null;
	let blockIndex = 0;

	for (let idx = 0; idx < lines.length; idx += 1) {
		const line = lines[idx];
		const fenceOpenMatch = /^(\s*)(`{3,}|~{3,})mermaid\s*$/i.exec(line);

		if (!activeFence && fenceOpenMatch) {
			blockIndex += 1;
			activeFence = {
				blockIndex,
				bodyLines: [],
				fenceMarker: fenceOpenMatch[2],
				openLine: idx + 1,
			};
			continue;
		}

		if (activeFence) {
			const fenceChar = activeFence.fenceMarker[0];
			const minLen = activeFence.fenceMarker.length;
			const closeRegex = new RegExp(`^\\s*\\${fenceChar}{${minLen},}\\s*$`);

			if (closeRegex.test(line)) {
				const blockIssues = inspectMermaidLines(activeFence.bodyLines.join("\n"));

				for (const issue of blockIssues) {
					diagnostics.push({
						blockIndex: activeFence.blockIndex,
						filePath,
						line: activeFence.openLine + issue.lineOffset,
						message: issue.message,
					});
				}

				activeFence = null;
			} else {
				activeFence.bodyLines.push(line);
			}
		}
	}

	if (activeFence) {
		diagnostics.push({
			blockIndex: activeFence.blockIndex,
			filePath,
			line: activeFence.openLine,
			message: "Unclosed ```mermaid fenced code block.",
		});
	}

	return diagnostics;
}

/**
 * Validates a single Mermaid diagram source string against GitHub-compatible Mermaid syntax rules.
 *
 * @param {string} code - Raw Mermaid source inside a fenced block.
 * @returns {{ errors: string[], valid: boolean }} Validation result and human-readable error messages.
 * @see {@link ./verify-mermaid.test.mjs Unit Tests}
 */
export function validateMermaidBlock(code) {
	const issues = inspectMermaidLines(code);

	return {
		errors: issues.map((issue) => `Line ${issue.lineOffset}: ${issue.message}`),
		valid: issues.length === 0,
	};
}

/**
 * Validates Mermaid fenced blocks across a list of Markdown file paths (or the repository defaults).
 *
 * @param {string[]} [inputPaths] - Explicit file paths; non-`.md` files and missing paths are skipped.
 * @returns {Promise<{ checkedBlocks: number, checkedFiles: number, errors: Array<{ blockIndex: number, filePath: string, line: number, message: string }> }>} Aggregated scan report.
 * @see {@link ./verify-mermaid.test.mjs Unit Tests}
 */
export async function verifyMermaidFiles(inputPaths = []) {
	const resolvedFiles =
		inputPaths.length > 0 ?
			inputPaths.filter((p) => p.endsWith(".md") && fs.existsSync(p))
		:	await collectDefaultMarkdownFiles();

	const errors = [];
	let checkedBlocks = 0;

	for (const filePath of resolvedFiles) {
		const text = fs.readFileSync(filePath, "utf8");
		checkedBlocks += countMermaidFences(text);
		errors.push(...validateMarkdownMermaid(text, filePath));
	}

	return {
		checkedBlocks,
		checkedFiles: resolvedFiles.length,
		errors,
	};
}

/**
 * Resolves the default set of repository Markdown files via `Bun.Glob`.
 *
 * @returns {Promise<string[]>} Sorted relative Markdown file paths.
 */
async function collectDefaultMarkdownFiles() {
	const found = new Set();

	for (const pattern of DEFAULT_GLOBS) {
		const glob = new Bun.Glob(pattern);

		for await (const match of glob.scan({ cwd: process.cwd(), dot: true })) {
			found.add(match);
		}
	}

	return [...found].sort();
}

/**
 * Counts opening ```mermaid fences in a Markdown document.
 *
 * @param {string} markdownText - Markdown source text.
 * @returns {number} Count of Mermaid blocks.
 */
function countMermaidFences(markdownText) {
	return markdownText
		.split(/\r?\n/)
		.filter((line) => /^(\s*)(`{3,}|~{3,})mermaid\s*$/i.test(line)).length;
}

/**
 * Checks a single `flowchart` or `graph` statement line for unquoted parentheses/brackets or HTML tags.
 *
 * @param {string} trimmed - Trimmed diagram line.
 * @param {number} lineOffset - 1-based line offset inside the Mermaid block.
 * @returns {Array<{ lineOffset: number, message: string }>} Detected line issues.
 */
function inspectFlowchartLine(trimmed, lineOffset) {
	const issues = [];

	// Strip double-quoted label strings first so quoted characters like `A["Zone (Rules)"]` pass.
	const withoutQuotedStrings = trimmed.replace(/"[^"]*"/g, '""');

	// Match rectangular node definitions `id[Label]` excluding multi-char shape wrappers `([""])`, `[[""]]`, `[("")]`.
	const squareLabelRegex = /\b[A-Za-z0-9_-]+\[([^\][("][^\]]*)\]/g;
	let match = squareLabelRegex.exec(withoutQuotedStrings);

	while (match !== null) {
		const rawLabel = match[1];

		if (/[()]/.test(rawLabel)) {
			issues.push({
				lineOffset,
				message: `Unquoted parentheses in flowchart node label "[${rawLabel}]"; quote the label as \`id["..."]\`.`,
			});
		}

		if (/<[A-Za-z][^>]*>/.test(rawLabel)) {
			issues.push({
				lineOffset,
				message: `Avoid HTML tags in flowchart node label "[${rawLabel}]".`,
			});
		}

		match = squareLabelRegex.exec(withoutQuotedStrings);
	}

	return issues;
}

/**
 * Performs line-by-line structural and lexical validation on a Mermaid diagram block.
 *
 * @param {string} code - Raw Mermaid source.
 * @returns {Array<{ lineOffset: number, message: string }>} Issues with 1-based block line offsets.
 */
function inspectMermaidLines(code) {
	const rawLines = code.split(/\r?\n/);
	const issues = [];
	let headerLine = null;
	let headerOffset = 1;

	for (let i = 0; i < rawLines.length; i += 1) {
		const trimmed = rawLines[i].trim();

		if (!trimmed || trimmed.startsWith("%%")) {
			continue;
		}

		if (headerLine === null) {
			headerLine = trimmed;
			headerOffset = i + 1;
			break;
		}
	}

	if (headerLine === null) {
		return [{ lineOffset: 1, message: "Empty Mermaid diagram block." }];
	}

	if (!SUPPORTED_HEADERS.some((pattern) => pattern.test(headerLine))) {
		return [
			{
				lineOffset: headerOffset,
				message: `Unsupported or malformed Mermaid diagram header "${headerLine}".`,
			},
		];
	}

	const isSequence = headerLine === "sequenceDiagram";
	const isFlowchart = headerLine.startsWith("flowchart") || headerLine.startsWith("graph");
	let openBlocks = 0;

	for (let i = headerOffset; i < rawLines.length; i += 1) {
		const trimmed = rawLines[i].trim();
		const lineOffset = i + 1;

		if (!trimmed || trimmed.startsWith("%%")) {
			continue;
		}

		if (isSequence) {
			if (SEQUENCE_BLOCK_OPENERS.test(trimmed)) {
				openBlocks += 1;
			} else if (trimmed === "end") {
				openBlocks -= 1;

				if (openBlocks < 0) {
					issues.push({
						lineOffset,
						message: "Unmatched `end` in sequenceDiagram.",
					});
					openBlocks = 0;
				}
			}

			issues.push(...inspectSequenceLine(trimmed, lineOffset));
		} else if (isFlowchart) {
			if (/^subgraph\b/.test(trimmed)) {
				openBlocks += 1;
			} else if (trimmed === "end") {
				openBlocks -= 1;

				if (openBlocks < 0) {
					issues.push({
						lineOffset,
						message: "Unmatched `end` in flowchart.",
					});
					openBlocks = 0;
				}
			}

			issues.push(...inspectFlowchartLine(trimmed, lineOffset));
		}
	}

	if (openBlocks > 0) {
		issues.push({
			lineOffset: rawLines.length,
			message: `Unclosed block: missing ${openBlocks} \`end\` statement(s).`,
		});
	}

	return issues;
}

/**
 * Checks a single `sequenceDiagram` statement line for `;` / `#` Jison terminators and unsafe aliases.
 *
 * @param {string} trimmed - Trimmed diagram line.
 * @param {number} lineOffset - 1-based line offset inside the Mermaid block.
 * @returns {Array<{ lineOffset: number, message: string }>} Detected line issues.
 */
function inspectSequenceLine(trimmed, lineOffset) {
	const issues = [];
	const participantMatch = /^(?:participant|actor)\s+\S+\s+as\s+(.+)$/.exec(trimmed);

	if (participantMatch) {
		const alias = participantMatch[1];

		if (alias.includes("[[") || alias.includes("]]")) {
			issues.push({
				lineOffset,
				message: `Participant alias "${alias}" contains \`[[...]]\` link tokens; use a plain alphanumeric alias.`,
			});
		}

		if (alias.includes(";") || alias.includes("#")) {
			issues.push({
				lineOffset,
				message: `Participant alias "${alias}" contains \`;\` or \`#\`, which terminates sequenceDiagram statements.`,
			});
		}

		return issues;
	}

	const messageArrowMatch = /^[^:]+?(?:->>|-->>|->|-->|-x|--x|-\)|--\))[-+]?[^:]+:\s*(.*)$/.exec(
		trimmed,
	);

	if (messageArrowMatch) {
		const messageText = messageArrowMatch[1];

		if (messageText.includes(";")) {
			issues.push({
				lineOffset,
				message:
					"sequenceDiagram message contains `;` (Mermaid statement separator); replace `;` with `,`.",
			});
		}

		if (messageText.includes("#")) {
			issues.push({
				lineOffset,
				message:
					'sequenceDiagram message contains `#` (Mermaid line/comment terminator); remove `#` or spell out "issue".',
			});
		}

		return issues;
	}

	if (SEQUENCE_TEXT_CLAUSES.test(trimmed) && (trimmed.includes(";") || trimmed.includes("#"))) {
		issues.push({
			lineOffset,
			message:
				"sequenceDiagram header/note contains `;` or `#`, which terminates the statement prematurely.",
		});
	}

	return issues;
}

if (import.meta.main) {
	const cliPaths = process.argv.slice(2).map((p) => path.normalize(p));
	const { checkedBlocks, checkedFiles, errors } = await verifyMermaidFiles(cliPaths);

	if (errors.length > 0) {
		for (const err of errors) {
			console.error(`${err.filePath}:${err.line} [block #${err.blockIndex}] ${err.message}`);
		}

		process.exit(1);
	}

	if (cliPaths.length === 0) {
		console.log(
			`✓ Verified ${checkedBlocks} Mermaid block(s) across ${checkedFiles} Markdown file(s).`,
		);
	}
}
