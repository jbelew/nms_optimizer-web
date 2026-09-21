import type { RecommendedBuild, TechTree } from "@/types/tech";
import { describe, expect, test } from "vitest";

import { countBuildModules, getTechTreeMaps } from "./techTreeUtils";

describe("techTreeUtils", () => {
	describe("countBuildModules", () => {
		test("should return 0 when layout is empty or undefined", () => {
			const emptyBuild = {
				layout: [],
				title: "Empty",
			} as unknown as RecommendedBuild;

			expect(countBuildModules(emptyBuild)).toBe(0);
		});

		test("should correctly count modules in a 2D layout ignoring nulls and empty slots", () => {
			const build: RecommendedBuild = {
				layout: [
					[{ module: "MOD_1" }, null, { module: "MOD_2" }],
					[{ module: null }, { module: "MOD_3" }, { module: "MOD_4" }],
				],
				title: "Test Build",
			};

			expect(countBuildModules(build)).toBe(4);
		});
	});

	describe("getTechTreeMaps", () => {
		test("should return empty maps when techTree is null", () => {
			const result = getTechTreeMaps(null);
			expect(result.modulesMap.size).toBe(0);
			expect(result.validTechKeys.size).toBe(0);
		});

		test("should extract modules and colors from valid tech categories", () => {
			const mockTechTree: TechTree = {
				Weaponry: [
					{
						color: "red",
						image: null,
						key: "photon",
						label: "Photon Cannon",
						module_count: 1,
						modules: [
							{
								active: true,
								adjacency: "photon",
								adjacency_bonus: 0.05,
								bonus: 10,
								id: "photon_mod",
								image: "photon.png",
								label: "Photon Module",
								sc_eligible: true,
								supercharged: false,
								tech: "photon",
								type: "normal",
								value: 10,
							},
						],
					},
				],
			};

			const result = getTechTreeMaps(mockTechTree);
			expect(result.validTechKeys.has("photon")).toBe(true);
			expect(result.techColors.photon).toBe("red");
			expect(result.modulesMap.has("photon/photon_mod")).toBe(true);
		});
	});
});
