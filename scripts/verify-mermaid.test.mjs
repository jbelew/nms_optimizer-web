/**
 * @file Unit tests for the Mermaid fenced-block syntax validator.
 */

import { describe, expect, it } from "bun:test";

import {
	validateMarkdownMermaid,
	validateMermaidBlock,
	verifyMermaidFiles,
} from "./verify-mermaid.mjs";

describe("verify-mermaid.mjs", () => {
	it("rejects sequenceDiagram messages containing semicolons, hashes, or [[...]] participant aliases (PR #826 regression)", () => {
		const brokenPrDiagram = [
			"sequenceDiagram",
			"    participant Client as Browser / AI Agent",
			"    participant Fn as Pages Function (functions/[[path]].js)",
			"    alt Browser (Accept: text/html)",
			"        Client->>Fn: GET /about/",
			"        Fn-->>Client: 200 text/markdown; Vary: Accept; x-markdown-tokens; Content-Signal",
			"    end",
		].join("\n");

		const result = validateMermaidBlock(brokenPrDiagram);

		expect(result.valid).toBe(false);
		expect(result.errors.some((err) => err.includes(";"))).toBe(true);
		expect(result.errors.some((err) => err.includes("[["))).toBe(true);
	});

	it("accepts clean sequenceDiagram blocks with comma-separated message items and balanced alt/end", () => {
		const validDiagram = [
			"sequenceDiagram",
			"    participant Client as Browser or AI Agent",
			"    participant Zone as Cloudflare Zone Rules",
			"    participant CDN as Static Asset CDN",
			"    participant Fn as Pages Function",
			"",
			"    alt Browser request (Accept text/html)",
			"        Client->>Zone: GET /about/",
			"        Zone->>CDN: Static cache lookup /about/",
			"        CDN-->>Client: 200 text/html (Static SEO Fallback, cf-cache-status HIT)",
			"    else AI Agent request (Accept text/markdown)",
			"        Client->>Zone: GET /about/ with Accept text/markdown",
			"        Zone->>Zone: Rewrite URI to /__md/about/",
			"        Fn-->>Client: 200 text/markdown (Vary Accept, x-markdown-tokens, Content-Signal)",
			"    end",
		].join("\n");

		expect(validateMermaidBlock(validDiagram)).toEqual({
			errors: [],
			valid: true,
		});
	});

	it("rejects sequenceDiagram blocks with # in message text or unbalanced control blocks", () => {
		const hashAndUnclosed = [
			"sequenceDiagram",
			"    participant A",
			"    participant B",
			"    alt Ticket check",
			"        A->>B: Resolves #825",
		].join("\n");

		const result = validateMermaidBlock(hashAndUnclosed);

		expect(result.valid).toBe(false);
		expect(result.errors.some((err) => err.includes("#"))).toBe(true);
		expect(result.errors.some((err) => err.includes("end"))).toBe(true);
	});

	it("rejects unquoted parentheses in flowchart node labels while allowing quoted labels and multi-char shapes", () => {
		const unquotedFlowchart = [
			"flowchart LR",
			"    A[Cloudflare Zone (Free Tier)] --> B[Pages Function]",
		].join("\n");

		const badResult = validateMermaidBlock(unquotedFlowchart);
		expect(badResult.valid).toBe(false);
		expect(badResult.errors.some((err) => err.includes("quote"))).toBe(true);

		const quotedFlowchart = [
			"flowchart TD",
			'    Start(["Incoming Request"]) --> Zone["Cloudflare Zone (Free Tier)"]',
			'    Zone --> Cache[("Edge Cache")]',
			"    subgraph Edge",
			'        Cache --> Fn["Pages Function [[path]].js"]',
			"    end",
		].join("\n");

		expect(validateMermaidBlock(quotedFlowchart)).toEqual({
			errors: [],
			valid: true,
		});
	});

	it("extracts fenced mermaid blocks from Markdown with 1-based line numbers and detects unclosed fences", async () => {
		const markdown = [
			"# PR Summary",
			"",
			"Intro paragraph.",
			"",
			"```mermaid",
			"sequenceDiagram",
			"    A->>B: 200 text/markdown; Vary: Accept",
			"```",
		].join("\n");

		const errors = validateMarkdownMermaid(markdown, "pr-body.md");
		expect(errors).toHaveLength(1);
		expect(errors[0].filePath).toBe("pr-body.md");
		expect(errors[0].line).toBe(7);

		const unclosed = validateMarkdownMermaid(
			"# Title\n\n```mermaid\nflowchart LR\n    A --> B\n",
		);
		expect(unclosed).toHaveLength(1);
		expect(unclosed[0].message).toContain("Unclosed");

		const repoCheck = await verifyMermaidFiles([".agents/skills/pr/SKILL.md"]);
		expect(repoCheck.errors).toEqual([]);
		expect(repoCheck.checkedBlocks).toBeGreaterThanOrEqual(1);
	});
});
