/**
 * @file Validation check for Git lifecycle hooks (Lefthook).
 *
 * Runs `lefthook validate` to ensure `lefthook.yml` syntax and schema are valid
 * without brittle string assertions on individual hook commands.
 */

import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

describe("Git Hooks Configuration (Lefthook)", () => {
	it("passes lefthook CLI schema validation", () => {
		const output = execSync("bunx lefthook validate", { cwd: ROOT, encoding: "utf-8" });
		expect(output.toLowerCase()).toContain("all good");
	});
});
