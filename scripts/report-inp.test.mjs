import { describe, expect, it } from "bun:test";

/**
 * Executes a Python snippet importing `scripts/report-inp.py` and returns parsed JSON stdout.
 *
 * @param {string} code - Python code that prints a single JSON payload to stdout.
 * @returns {unknown} Parsed JSON result from the Python process.
 */
function runPythonHelper(code) {
	const proc = Bun.spawnSync([
		"./venv/bin/python",
		"-c",
		`import importlib.util, json, pathlib, sys, types\ngc = types.ModuleType("google.cloud")\ngc.bigquery = types.ModuleType("google.cloud.bigquery")\ngc.bigquery.Client = object\ngc.bigquery.table = types.SimpleNamespace(Row=object)\nsys.modules.setdefault("google", types.ModuleType("google"))\nsys.modules["google.cloud"] = gc\nsys.modules["google.cloud.bigquery"] = gc.bigquery\nspec = importlib.util.spec_from_file_location("report_inp", pathlib.Path("scripts/report-inp.py"))\nmod = importlib.util.module_from_spec(spec)\nspec.loader.exec_module(mod)\n${code}`,
	]);

	if (proc.exitCode !== 0) {
		throw new Error(
			`Python helper exited with ${proc.exitCode}: ${proc.stderr.toString("utf8")}`,
		);
	}

	return JSON.parse(proc.stdout.toString("utf8").trim());
}

describe("scripts/report-inp.py BigQuery & CrUX contract", () => {
	it("supports --device crux-mobile and crux-desktop CLI arguments", () => {
		const result = runPythonHelper(`
args_mobile = mod.parse_arguments(["--device", "crux-mobile", "--days", "14"])
args_desktop = mod.parse_arguments(["--device", "crux-desktop"])
print(json.dumps({
	"mobile_device": args_mobile.device,
	"days": args_mobile.days,
	"desktop_device": args_desktop.device,
}))
`);

		expect(result).toEqual({
			days: 14,
			desktop_device: "crux-desktop",
			mobile_device: "crux-mobile",
		});
	});

	it("builds ADR-0003 deduplicated BigQuery SQL with prod host filter, snapshot vs delta logic, and CrUX cohort filter", () => {
		const sql = runPythonHelper(`
query = mod.build_deduped_vitals_cte("cosmic-inkwell-467922-v5.analytics_484727815", device_filter="crux-mobile", version_filter="8.10.0", metric_name="INP")
print(json.dumps(query))
`);

		expect(sql).toContain("events_intraday_*");
		expect(sql).toContain("nms-optimizer.app");
		expect(sql).toContain("pages\\.dev");
		expect(sql).toContain("ORDER BY event_timestamp DESC LIMIT 1");
		expect(sql).toContain("delta_sum");
		expect(sql).toContain("device_category = 'mobile'");
		expect(sql).toContain("os = 'Android'");
		expect(sql).toContain("browser = 'Chrome'");
		expect(sql).toContain("app_version = 'v8.10.0'");
	});

	it("formats p75 status against Core Web Vitals Good/Needs Improvement/Poor thresholds", () => {
		const statuses = runPythonHelper(`
import re
strip = lambda s: re.sub(r"\\x1b\\[[0-9;]*m", "", s)
print(json.dumps({
	"good": strip(mod.format_status(196, "INP")),
	"needs_imp": strip(mod.format_status(248, "INP")),
	"poor": strip(mod.format_status(512, "INP")),
}))
`);

		expect(statuses).toEqual({
			good: "196ms (Good)",
			needs_imp: "248ms (Needs Imp)",
			poor: "512ms (Poor)",
		});
	});
});
