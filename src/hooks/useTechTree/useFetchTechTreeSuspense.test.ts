/**
 * Tests for useFetchTechTreeSuspense hook
 * Tests the processing of tech tree data and integration with stores
 */
import type { Module, TechTree, TechTreeItem } from "./useTechTree";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useGridStore } from "../../store/GridStore";
import { useTechStore } from "../../store/TechStore";
import * as apiCallModule from "../../utils/apiCall";
import { clearTechTreeCache, fetchTechTree } from "./useTechTree";

vi.mock("../../utils/apiCall", () => ({
	apiCall: vi.fn(),
}));

describe("useFetchTechTreeSuspense - Tech Tree Processing", () => {
	beforeEach(() => {
		clearTechTreeCache();
		vi.clearAllMocks();
		// Reset stores
		useGridStore.setState({
			initialGridDefinition: undefined,
			grid: { cells: [], height: 0, width: 0 },
		});
		useTechStore.setState({
			techColors: {},
			techGroups: {},
			activeGroups: {},
		});
	});

	describe("tech tree data processing", () => {
		it("should return raw tech tree data from fetchTechTree", async () => {
			const mockData: TechTree = {
				starship: [
					{
						label: "Defense",
						key: "defense",
						modules: [],
						image: null,
						color: "red",
						module_count: 0,
					},
					{
						label: "Defense Duplicate",
						key: "defense", // Same key
						modules: [],
						image: null,
						color: "red",
						module_count: 0,
					},
					{
						label: "Attack",
						key: "attack",
						modules: [],
						image: null,
						color: "red",
						module_count: 0,
					},
				],
			};

			const mockApiCall = vi.fn().mockResolvedValue(mockData);
			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const resource = fetchTechTree("standard");

			// Wait for promise to resolve
			await new Promise((resolve) => setTimeout(resolve, 100));

			const result = resource.read();
			const starshipItems = result.starship as TechTreeItem[];
			// fetchTechTree returns raw data without deduplication
			// useFetchTechTreeSuspense hook applies deduplication via useMemo
			expect(starshipItems).toHaveLength(3);
		});

		it("should preserve non-array categories", async () => {
			const mockData: TechTree = {
				starship: [
					{
						label: "Defense",
						key: "defense",
						modules: [],
						image: null,
						color: "red",
						module_count: 0,
					},
				],
				grid_definition: {
					grid: [] as never[][],
					gridFixed: true,
					superchargedFixed: false,
				},
			} as unknown as TechTree;

			const mockApiCall = vi.fn().mockResolvedValue(mockData);
			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const resource = fetchTechTree("standard");

			await new Promise((resolve) => setTimeout(resolve, 100));

			const result = resource.read();
			expect(result.grid_definition).toBeDefined();
			expect(result.grid_definition?.gridFixed).toBe(true);
		});

		it("should handle tech tree with multiple categories", async () => {
			const mockData: TechTree = {
				starship: [
					{
						label: "Defense",
						key: "defense",
						modules: [],
						image: null,
						color: "red",
						module_count: 0,
					},
				],
				exosuit: [
					{
						label: "Health",
						key: "health",
						modules: [],
						image: null,
						color: "green",
						module_count: 0,
					},
				],
				multitool: [
					{
						label: "Scanner",
						key: "scanner",
						modules: [],
						image: null,
						color: "blue",
						module_count: 0,
					},
				],
			};

			const mockApiCall = vi.fn().mockResolvedValue(mockData);
			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const resource = fetchTechTree("standard");

			await new Promise((resolve) => setTimeout(resolve, 100));

			const result = resource.read();
			expect(Object.keys(result)).toContain("starship");
			expect(Object.keys(result)).toContain("exosuit");
			expect(Object.keys(result)).toContain("multitool");
		});

		it("should accept items without key property in raw fetch", async () => {
			const mockData: TechTree = {
				starship: [
					{
						label: "Defense",
						key: "defense",
						modules: [],
						image: null,
						color: "red",
						module_count: 0,
					},
					// Invalid item without key
					{
						label: "Invalid",
						modules: [],
						image: null,
						color: "red",
						module_count: 0,
					} as unknown as TechTreeItem,
				],
			};

			const mockApiCall = vi.fn().mockResolvedValue(mockData);
			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const resource = fetchTechTree("standard");

			await new Promise((resolve) => setTimeout(resolve, 100));

			const result = resource.read();
			// fetchTechTree returns raw data - filtering happens in useFetchTechTreeSuspense
			expect(result.starship).toBeDefined();
		});

		it("should handle recommended_builds properly", async () => {
			const mockData: TechTree = {
				starship: [
					{
						label: "Defense",
						key: "defense",
						modules: [],
						image: null,
						color: "red",
						module_count: 0,
					},
				],
				recommended_builds: [
					{
						title: "Build 1",
						layout: [[{ tech: "defense" }]],
					},
					{
						title: "Build 2",
						layout: [[{ tech: "defense" }, { tech: "defense" }]],
					},
				],
			};

			const mockApiCall = vi.fn().mockResolvedValue(mockData);
			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const resource = fetchTechTree("standard");

			await new Promise((resolve) => setTimeout(resolve, 100));

			const result = resource.read();
			expect(Array.isArray(result.recommended_builds)).toBe(true);
		});

		it("should handle null values in categories", async () => {
			const mockData: TechTree = {
				starship: [
					{
						label: "Defense",
						key: "defense",
						modules: [],
						image: null,
						color: "red",
						module_count: 0,
					},
				],
				empty_category: null as unknown as TechTreeItem[],
			};

			const mockApiCall = vi.fn().mockResolvedValue(mockData);
			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const resource = fetchTechTree("standard");

			await new Promise((resolve) => setTimeout(resolve, 100));

			const result = resource.read();
			expect(result.empty_category).toBe(null);
		});

		it("should preserve tech tree items with type property", async () => {
			const mockData: TechTree = {
				starship: [
					{
						label: "Defense Normal",
						key: "defense",
						modules: [],
						image: null,
						color: "red",
						module_count: 0,
						type: "normal",
					},
					{
						label: "Defense Max",
						key: "defense_max",
						modules: [],
						image: null,
						color: "red",
						module_count: 0,
						type: "max",
					},
				],
			};

			const mockApiCall = vi.fn().mockResolvedValue(mockData);
			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const resource = fetchTechTree("standard");

			await new Promise((resolve) => setTimeout(resolve, 100));

			const result = resource.read();
			const starshipItems = result.starship as TechTreeItem[];
			expect(starshipItems.some((item) => item.type === "normal")).toBe(true);
			expect(starshipItems.some((item) => item.type === "max")).toBe(true);
		});

		it("should handle complex module data in tech tree", async () => {
			const mockModule: Module = {
				active: true,
				adjacency: "cardinal",
				adjacency_bonus: 15,
				bonus: 5,
				id: "mod_defense_1",
				image: "defense_module.png",
				label: "Defense Module",
				sc_eligible: true,
				supercharged: false,
				tech: "defense",
				type: "shield",
				value: 100,
			};

			const mockData: TechTree = {
				starship: [
					{
						label: "Defense",
						key: "defense",
						modules: [mockModule],
						image: null,
						color: "red",
						module_count: 1,
					},
				],
			};

			const mockApiCall = vi.fn().mockResolvedValue(mockData);
			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const resource = fetchTechTree("standard");

			await new Promise((resolve) => setTimeout(resolve, 100));

			const result = resource.read();
			const starshipItems = result.starship as TechTreeItem[];
			expect(starshipItems[0].modules[0]).toEqual(mockModule);
		});

		it("should handle empty tech tree", async () => {
			const mockData: TechTree = {};

			const mockApiCall = vi.fn().mockResolvedValue(mockData);
			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const resource = fetchTechTree("standard");

			await new Promise((resolve) => setTimeout(resolve, 100));

			const result = resource.read();
			expect(Object.keys(result)).toHaveLength(0);
		});
	});

	describe("edge cases and error states", () => {
		it("should handle tech tree with undefined values", async () => {
			const mockData: TechTree = {
				starship: [
					{
						label: "Defense",
						key: "defense",
						modules: [],
						image: null,
						color: "red",
						module_count: 0,
					},
				],
				undefined_category: undefined,
			};

			const mockApiCall = vi.fn().mockResolvedValue(mockData);
			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const resource = fetchTechTree("standard");

			await new Promise((resolve) => setTimeout(resolve, 100));

			const result = resource.read();
			expect(result.undefined_category).toBeUndefined();
		});

		it("should handle very large tech trees without performance issues", async () => {
			const largeModuleArray = Array.from({ length: 100 }, (_, i) => ({
				active: true,
				adjacency: "cardinal",
				adjacency_bonus: 10,
				bonus: 5,
				id: `mod_${i}`,
				image: `image_${i}.png`,
				label: `Module ${i}`,
				sc_eligible: true,
				supercharged: false,
				tech: "defense",
				type: "shield",
				value: 100,
			}));

			const mockData: TechTree = {
				starship: [
					{
						label: "Defense",
						key: "defense",
						modules: largeModuleArray,
						image: null,
						color: "red",
						module_count: 100,
					},
				],
			};

			const mockApiCall = vi.fn().mockResolvedValue(mockData);
			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const start = performance.now();
			const resource = fetchTechTree("standard");

			await new Promise((resolve) => setTimeout(resolve, 100));

			const result = resource.read();
			const end = performance.now();

			expect(end - start).toBeLessThan(1000); // Should process within 1 second
			expect((result.starship as TechTreeItem[])[0].modules).toHaveLength(100);
		});
	});
});
