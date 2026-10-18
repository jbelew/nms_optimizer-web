/**
 * Shared mock API payloads and `window.fetch` interceptor for Storybook UI, Chromatic, and Vitest.
 */

export const mockPlatforms = {
	colossus: { type: "Exocraft" },
	corvette: { type: "Starship" },
	exosuit: { type: "Exosuit" },
	standard: { type: "Starship" },
};

export const mockTechTree = {
	Hyperdrive: [
		{
			color: "blue",
			image: "starship/hyper.webp",
			key: "hyper",
			label: "Hyperdrive",
			module_count: 5,
			modules: [
				{
					active: true,
					adjacency: "greater",
					adjacency_bonus: 1,
					bonus: 100,
					checked: true,
					id: "HD",
					image: "starship/hyper.webp",
					label: "Hyperdrive",
					sc_eligible: false,
					supercharged: false,
					tech: "hyper",
					type: "core",
					value: 100,
				},
				{
					active: true,
					adjacency: "greater",
					adjacency_bonus: 1,
					bonus: 50,
					checked: true,
					id: "HB1",
					image: "starship/hyper.webp",
					label: "Emergency Warp Unit",
					sc_eligible: true,
					supercharged: false,
					tech: "hyper",
					type: "bonus",
					value: 50,
				},
				{
					active: true,
					adjacency: "greater",
					adjacency_bonus: 1,
					bonus: 250,
					checked: true,
					id: "UA1",
					image: "starship/hyper-upgrade.webp",
					label: "Hyperdrive Upgrade [1]",
					sc_eligible: true,
					supercharged: false,
					tech: "hyper",
					type: "upgrade",
					value: 250,
				},
				{
					active: true,
					adjacency: "greater",
					adjacency_bonus: 1,
					bonus: 250,
					checked: true,
					id: "UA2",
					image: "starship/hyper-upgrade.webp",
					label: "Hyperdrive Upgrade [2]",
					sc_eligible: true,
					supercharged: false,
					tech: "hyper",
					type: "upgrade",
					value: 250,
				},
				{
					active: true,
					adjacency: "greater",
					adjacency_bonus: 1,
					bonus: 120,
					checked: false,
					id: "CV1",
					image: "starship/hyper.webp",
					label: "Sub-Light Amplifier",
					sc_eligible: true,
					supercharged: false,
					tech: "hyper",
					type: "corvette",
					value: 120,
				},
			],
			type: "normal",
			window_rules: { "3": [2, 2], "4": [3, 2], "5": [3, 2] },
		},
	],
	Utilities: [
		{
			color: "amber",
			image: "starship/trails.webp",
			key: "trails",
			label: "Starship Trails",
			module_count: 3,
			modules: [
				{
					active: true,
					adjacency: "greater",
					adjacency_bonus: 1,
					bonus: 1,
					checked: true,
					id: "polo",
					image: "starship/polo.webp",
					label: "Polo Figurine",
					sc_eligible: false,
					supercharged: false,
					tech: "trails",
					type: "core",
					value: 1,
				},
				{
					active: true,
					adjacency: "greater",
					adjacency_bonus: 1,
					bonus: 1,
					checked: true,
					id: "cadmium",
					image: "starship/trails.webp",
					label: "Cadmium Starship Trail",
					sc_eligible: false,
					supercharged: false,
					tech: "trails",
					type: "bonus",
					value: 1,
				},
				{
					active: true,
					adjacency: "greater",
					adjacency_bonus: 1,
					bonus: 0,
					checked: false,
					id: "stealth",
					image: "starship/trails.webp",
					label: "Stealth Starship Trail",
					sc_eligible: false,
					supercharged: false,
					tech: "trails",
					type: "cosmetic",
					value: 0,
				},
			],
			type: "normal",
			window_rules: { "2": [2, 2], "3": [2, 2] },
		},
	],
};

export const mockColossusTechTree = {
	...mockTechTree,
	recommended_builds: [
		{
			layout: [
				[
					{
						active: true,
						adjacency_bonus: 1,
						module: "HD",
						supercharged: true,
						tech: "hyper",
					},
					{
						active: true,
						adjacency_bonus: 1,
						module: "HB1",
						supercharged: false,
						tech: "hyper",
					},
					{
						active: true,
						adjacency_bonus: 1,
						module: "UA1",
						supercharged: false,
						tech: "hyper",
					},
				],
			],
			title: "Default",
		},
	],
};

export const mockPerformanceMetrics = [
	{
		app_version: "v1.0.0",
		average_value: 920,
		metric_name: "LCP",
		p50: 800,
		p75: 920,
		p90: 1100,
		timestamp: 1715731200000,
	},
	{
		app_version: "v1.0.0",
		average_value: 650,
		metric_name: "FCP",
		p50: 550,
		p75: 650,
		p90: 800,
		timestamp: 1715731200000,
	},
	{
		app_version: "v1.0.0",
		average_value: 10,
		metric_name: "CLS",
		p50: 5,
		p75: 10,
		p90: 25,
		timestamp: 1715731200000,
	},
	{
		app_version: "v1.0.0",
		average_value: 48,
		metric_name: "INP",
		p50: 32,
		p75: 48,
		p90: 72,
		timestamp: 1715731200000,
	},
];

export const mockUserStats = [
	{
		event_name: "optimize_tech",
		ship_type: "standard",
		supercharged: "true",
		technology: "hyper",
		total_events: 42,
	},
	{
		event_name: "optimize_tech",
		ship_type: "standard-mt",
		supercharged: "true",
		technology: "mining",
		total_events: 18,
	},
	{
		event_name: "optimize_tech",
		ship_type: "corvette",
		supercharged: "true",
		technology: "hyper",
		total_events: 12,
	},
];

/**
 * Installs a deterministic `window.fetch` interceptor for Storybook stories so
 * that `/platforms`, `/tech_tree/*`, and analytics endpoints resolve immediately
 * in Storybook UI, Chromatic, and Vitest browser tests.
 *
 * @returns Side-effects only.
 */
export function installStorybookFetchMock(): void {
	if (typeof window === "undefined") {
		return;
	}

	const win = window as typeof window & { __STORYBOOK_FETCH_MOCK_INSTALLED__?: boolean };

	if (win.__STORYBOOK_FETCH_MOCK_INSTALLED__) {
		return;
	}

	win.__STORYBOOK_FETCH_MOCK_INSTALLED__ = true;
	const originalFetch = window.fetch.bind(window);

	window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
		const url =
			typeof input === "string" ? input
			: input instanceof URL ? input.href
			: input.url;

		if (url.includes("platforms")) {
			return new Response(JSON.stringify(mockPlatforms), {
				headers: { "Content-Type": "application/json" },
				status: 200,
			});
		}

		if (url.includes("tech_tree/colossus")) {
			return new Response(JSON.stringify(mockColossusTechTree), {
				headers: { "Content-Type": "application/json" },
				status: 200,
			});
		}

		if (url.includes("tech_tree/")) {
			return new Response(JSON.stringify(mockTechTree), {
				headers: { "Content-Type": "application/json" },
				status: 200,
			});
		}

		if (url.includes("analytics/performance_data")) {
			return new Response(JSON.stringify(mockPerformanceMetrics), {
				headers: { "Content-Type": "application/json" },
				status: 200,
			});
		}

		if (url.includes("analytics/popular_data")) {
			return new Response(JSON.stringify(mockUserStats), {
				headers: { "Content-Type": "application/json" },
				status: 200,
			});
		}

		return originalFetch(input, init);
	};
}
