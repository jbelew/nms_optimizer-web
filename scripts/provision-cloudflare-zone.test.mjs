/**
 * @file Unit tests for the Cloudflare Free-tier Zone provisioning script.
 */

import { describe, expect, it, vi } from "bun:test";

import { provisionCloudflareZone } from "./provision-cloudflare-zone.mjs";

const SILENT_LOGGER = {
	info: () => {},
};

describe("provisionCloudflareZone (provision-cloudflare-zone.mjs)", () => {
	it("configures the http_request_transform URL Rewrite Rule for Accept: text/markdown with path/extension exclusions and preserved query strings", async () => {
		const requests = [];
		const fetchImpl = vi.fn(async (input, init = {}) => {
			const url = String(input);
			const method = init.method ?? "GET";
			const body = init.body ? JSON.parse(String(init.body)) : null;
			requests.push({ body, headers: init.headers, method, url });

			if (
				method === "GET"
				&& url.endsWith("/rulesets/phases/http_request_transform/entrypoint")
			) {
				return new Response(
					JSON.stringify({
						errors: [{ code: 10003, message: "could not find entrypoint ruleset" }],
						result: null,
						success: false,
					}),
					{ status: 404 },
				);
			}

			return new Response(
				JSON.stringify({
					errors: [],
					result: { id: "ruleset-1", rules: body?.rules ?? [] },
					success: true,
				}),
				{ status: 200 },
			);
		});

		await provisionCloudflareZone({
			apiToken: "test-zone-token",
			domain: "nms-optimizer.app",
			fetchImpl,
			logger: SILENT_LOGGER,
			zoneId: "zone-123",
		});

		const transformPut = requests.find(
			(req) =>
				req.method === "PUT"
				&& req.url
					=== "https://api.cloudflare.com/client/v4/zones/zone-123/rulesets/phases/http_request_transform/entrypoint",
		);

		expect(transformPut).toBeDefined();
		expect(transformPut.headers).toMatchObject({
			Authorization: "Bearer test-zone-token",
			"Content-Type": "application/json",
		});
		expect(transformPut.body.rules).toHaveLength(1);

		const [rewriteRule] = transformPut.body.rules;
		expect(rewriteRule.action).toBe("rewrite");
		expect(rewriteRule.enabled).toBe(true);
		expect(rewriteRule.action_parameters).toEqual({
			uri: {
				path: {
					expression: 'concat("/__md", http.request.uri.path)',
				},
			},
		});
		expect(rewriteRule.expression).toContain('http.host eq "nms-optimizer.app"');
		expect(rewriteRule.expression).toContain(
			'any(lower(http.request.headers["accept"][*])[*] contains "text/markdown")',
		);
		expect(rewriteRule.expression).toContain('http.request.uri.path ne "/__md"');
		expect(rewriteRule.expression).toContain(
			'not starts_with(http.request.uri.path, "/__md/")',
		);
		expect(rewriteRule.expression).toContain(
			'not starts_with(http.request.uri.path, "/build/")',
		);
		expect(rewriteRule.expression).toContain(
			'not starts_with(http.request.uri.path, "/assets/")',
		);
		expect(rewriteRule.expression).toContain(
			'not starts_with(http.request.uri.path, "/.well-known/")',
		);

		for (const ext of [
			"md",
			"txt",
			"xml",
			"json",
			"js",
			"css",
			"ico",
			"png",
			"svg",
			"webp",
			"woff",
			"woff2",
			"html",
		]) {
			expect(rewriteRule.expression).toContain(`"${ext}"`);
		}
	});

	it("configures Zone Cache Rules including /__md/* in the 300-second override_origin edge TTL rule while keeping SPA performance routes uncached", async () => {
		const requests = [];
		const fetchImpl = vi.fn(async (input, init = {}) => {
			const url = String(input);
			const method = init.method ?? "GET";
			const body = init.body ? JSON.parse(String(init.body)) : null;
			requests.push({ body, method, url });

			return new Response(
				JSON.stringify({
					errors: [],
					result: { id: "ruleset-1", rules: body?.rules ?? [] },
					success: true,
				}),
				{ status: 200 },
			);
		});

		await provisionCloudflareZone({
			apiToken: "test-zone-token",
			domain: "nms-optimizer.app",
			fetchImpl,
			logger: SILENT_LOGGER,
			zoneId: "zone-123",
		});

		const cachePut = requests.find(
			(req) =>
				req.method === "PUT"
				&& req.url
					=== "https://api.cloudflare.com/client/v4/zones/zone-123/rulesets/phases/http_request_cache_settings/entrypoint",
		);

		expect(cachePut).toBeDefined();

		const rules = cachePut.body.rules;
		const alwaysFreshIdx = rules.findIndex((rule) => rule.action_parameters?.cache === false);
		const subShellIdx = rules.findIndex((rule) =>
			String(rule.expression).includes('starts_with(http.request.uri.path, "/__md/")'),
		);

		expect(subShellIdx).toBeGreaterThanOrEqual(0);
		expect(alwaysFreshIdx).toBe(rules.length - 1);
		expect(alwaysFreshIdx).toBeGreaterThan(subShellIdx);

		const alwaysFreshRule = rules[alwaysFreshIdx];
		const subShellAndMarkdownRule = rules[subShellIdx];

		expect(alwaysFreshRule.action).toBe("set_cache_settings");
		expect(alwaysFreshRule.action_parameters).toEqual({ cache: false });
		expect(alwaysFreshRule.expression).toContain(
			'starts_with(http.request.uri.path, "/performance/")',
		);
		expect(alwaysFreshRule.expression).toContain(
			'starts_with(http.request.uri.path, "/es/performance/")',
		);
		expect(alwaysFreshRule.expression).toContain(
			'starts_with(http.request.uri.path, "/__md/performance/")',
		);
		expect(alwaysFreshRule.expression).toContain(
			'starts_with(http.request.uri.path, "/__md/es/performance/")',
		);
		expect(alwaysFreshRule.expression).toContain(
			'not any(lower(http.request.headers["accept"][*])[*] contains "text/markdown")',
		);
		expect(alwaysFreshRule.expression).toContain(
			'any(lower(http.request.headers["accept"][*])[*] contains "text/html")',
		);
		expect(alwaysFreshRule.expression).toContain(
			'any(lower(http.request.headers["accept"][*])[*] contains "application/xhtml+xml")',
		);
		expect(alwaysFreshRule.expression).toContain(
			'any(lower(http.request.headers["accept"][*])[*] contains ";")',
		);

		expect(subShellAndMarkdownRule.action).toBe("set_cache_settings");
		expect(subShellAndMarkdownRule.action_parameters).toEqual({
			browser_ttl: { mode: "respect_origin" },
			cache: true,
			edge_ttl: { default: 300, mode: "override_origin" },
		});
		expect(subShellAndMarkdownRule.expression).toContain(
			'starts_with(http.request.uri.path, "/__md/")',
		);
		expect(subShellAndMarkdownRule.expression).toContain(
			'starts_with(http.request.uri.path, "/it/")',
		);
		expect(subShellAndMarkdownRule.expression).toContain(
			'starts_with(http.request.uri.path, "/about/")',
		);
	});

	it("idempotently updates the existing markdown rewrite rule without duplicating it and preserves unrelated transform rules", async () => {
		const requests = [];
		const fetchImpl = vi.fn(async (input, init = {}) => {
			const url = String(input);
			const method = init.method ?? "GET";
			const body = init.body ? JSON.parse(String(init.body)) : null;
			requests.push({ body, method, url });

			if (
				method === "GET"
				&& url.endsWith("/rulesets/phases/http_request_transform/entrypoint")
			) {
				return new Response(
					JSON.stringify({
						errors: [],
						result: {
							id: "existing-transform-ruleset",
							rules: [
								{
									action: "rewrite",
									action_parameters: { uri: { path: { value: "/old" } } },
									description:
										"Rewrite Accept: text/markdown requests to /__md/*",
									enabled: true,
									expression: 'http.request.uri.path eq "/old"',
									id: "old-md-rule-id",
									last_updated: "2026-10-30T00:00:00Z",
									ref: "agent_markdown_accept_rewrite",
									version: "1",
								},
								{
									action: "rewrite",
									action_parameters: {
										uri: { path: { value: "/legacy-target" } },
									},
									description: "Unrelated custom rewrite",
									enabled: true,
									expression: 'http.request.uri.path eq "/legacy"',
									id: "unrelated-rule-id",
									last_updated: "2026-10-29T00:00:00Z",
									ref: "unrelated_custom_rewrite",
									version: "3",
								},
							],
						},
						success: true,
					}),
					{ status: 200 },
				);
			}

			return new Response(
				JSON.stringify({
					errors: [],
					result: { id: "ruleset-1", rules: body?.rules ?? [] },
					success: true,
				}),
				{ status: 200 },
			);
		});

		await provisionCloudflareZone({
			apiToken: "test-zone-token",
			domain: "nms-optimizer.app",
			fetchImpl,
			logger: SILENT_LOGGER,
			zoneId: "zone-123",
		});

		const transformPut = requests.find(
			(req) =>
				req.method === "PUT"
				&& req.url.endsWith("/rulesets/phases/http_request_transform/entrypoint"),
		);

		expect(transformPut.body.rules).toHaveLength(2);
		expect(transformPut.body.rules[0].ref).toBe("agent_markdown_accept_rewrite");
		expect(transformPut.body.rules[0].action_parameters.uri.path.expression).toBe(
			'concat("/__md", http.request.uri.path)',
		);
		expect(transformPut.body.rules[1]).toEqual({
			action: "rewrite",
			action_parameters: { uri: { path: { value: "/legacy-target" } } },
			description: "Unrelated custom rewrite",
			enabled: true,
			expression: 'http.request.uri.path eq "/legacy"',
			id: "unrelated-rule-id",
			ref: "unrelated_custom_rewrite",
		});
	});

	it("returns planned transform and cache rulesets without calling fetch in dryRun mode", async () => {
		const fetchImpl = vi.fn();
		const plan = await provisionCloudflareZone({
			apiToken: "",
			domain: "nms-optimizer.app",
			dryRun: true,
			fetchImpl,
			logger: SILENT_LOGGER,
			zoneId: "zone-123",
		});

		expect(fetchImpl).not.toHaveBeenCalled();
		expect(plan.transformRuleset.rules).toHaveLength(1);
		expect(plan.cacheRuleset.rules).toHaveLength(8);
	});

	it("throws an actionable error when apiToken is missing or Cloudflare rejects with 403", async () => {
		await expect(
			provisionCloudflareZone({
				apiToken: "",
				fetchImpl: vi.fn(),
				logger: SILENT_LOGGER,
				zoneId: "zone-123",
			}),
		).rejects.toThrow(/CLOUDFLARE_ZONE_API_TOKEN/);

		const forbiddenFetch = vi.fn(
			async () =>
				new Response(
					JSON.stringify({
						errors: [{ code: 10000, message: "Authentication error" }],
						result: null,
						success: false,
					}),
					{ status: 403 },
				),
		);

		await expect(
			provisionCloudflareZone({
				apiToken: "insufficient-scope-token",
				fetchImpl: forbiddenFetch,
				logger: SILENT_LOGGER,
				zoneId: "zone-123",
			}),
		).rejects.toThrow(/Transform Rules/);
	});
});
