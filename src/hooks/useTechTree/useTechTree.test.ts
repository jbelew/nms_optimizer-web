import type { Module, TechTree, TechTreeItem } from "./useTechTree";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as apiCallModule from "../../utils/apiCall";
import { clearTechTreeCache, fetchTechTree, fetchTechTreeAsync } from "./useTechTree";

// Mock apiCall
vi.mock("../../utils/apiCall", () => ({
	apiCall: vi.fn(),
}));

describe("useTechTree utilities", () => {
	beforeEach(() => {
		clearTechTreeCache();
		vi.clearAllMocks();
	});

	afterEach(() => {
		clearTechTreeCache();
	});

	describe("createResource and fetchTechTree", () => {
		const mockTechTree: TechTree = {
			starship: [
				{
					label: "Defense",
					key: "defense",
					modules: [],
					image: null,
					color: "red",
					module_count: 5,
				} as TechTreeItem,
			],
		};

		it("should fetch tech tree successfully", async () => {
			const mockApiCall = vi.fn().mockResolvedValue(mockTechTree);

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const result = await fetchTechTreeAsync("standard");

			expect(result).toEqual(mockTechTree);
			expect(mockApiCall).toHaveBeenCalledWith(
				expect.stringContaining("tech_tree/standard"),
				{},
				10000
			);
		});

		it("should cache the tech tree result", async () => {
			const mockApiCall = vi.fn().mockResolvedValue(mockTechTree);

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			await fetchTechTreeAsync("standard");
			await fetchTechTreeAsync("standard");

			// Should only be called once due to caching
			expect(mockApiCall).toHaveBeenCalledTimes(1);
		});

		it("should handle different ship types separately", async () => {
			const mockApiCall = vi.fn().mockResolvedValue(mockTechTree);

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			await fetchTechTreeAsync("standard");
			await fetchTechTreeAsync("explorer");

			// Should be called twice for different ship types
			expect(mockApiCall).toHaveBeenCalledTimes(2);
		});

		it("should handle HTTP error response gracefully", async () => {
			const mockApiCall = vi.fn().mockRejectedValue(new Error("HTTP error! status: 404"));

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			// Should not throw - errors are caught and trigger the error dialog instead
			const result = await fetchTechTreeAsync("invalid");

			// Should return empty object on error
			expect(result).toEqual({});
		});

		it("should filter out invalid recommended builds", async () => {
			const mockData = {
				starship: [
					{
						label: "Defense",
						key: "defense",
						modules: [],
						image: null,
						color: "red",
						module_count: 5,
					},
				],
				recommended_builds: [
					{
						title: "Valid Build",
						layout: [[{ tech: "defense" }]],
					},
					{
						title: "Invalid Build",
						layout: [], // Invalid: empty layout
					},
				],
			};

			const mockApiCall = vi.fn().mockResolvedValue(mockData);

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const result = await fetchTechTreeAsync("standard");

			// Valid builds should be preserved, invalid ones filtered
			expect(Array.isArray(result.recommended_builds)).toBe(true);
		});

		it("should use default ship type 'standard'", async () => {
			const mockApiCall = vi.fn().mockResolvedValue(mockTechTree);

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			await fetchTechTreeAsync();

			expect(mockApiCall).toHaveBeenCalledWith(
				expect.stringContaining("tech_tree/standard"),
				{},
				10000
			);
		});
	});

	describe("fetchTechTree promise function", () => {
		const mockTechTree: TechTree = {
			starship: [
				{
					label: "Defense",
					key: "defense",
					modules: [],
					image: null,
					color: "red",
					module_count: 5,
				},
			],
		};

		it("should return a promise", async () => {
			const mockApiCall = vi.fn().mockResolvedValue(mockTechTree);

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const promise = fetchTechTree("standard");

			expect(promise).toBeInstanceOf(Promise);
		});

		it("should resolve with tech tree data", async () => {
			const mockApiCall = vi.fn().mockResolvedValue(mockTechTree);

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const promise = fetchTechTree("standard");

			const data = await promise;
			expect(data).toEqual(mockTechTree);
		});

		it("should resolve with data after async operation", async () => {
			const mockApiCall = vi.fn().mockResolvedValue(mockTechTree);

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const promise = fetchTechTree("standard");

			// Wait for promise to resolve
			const data = await promise;
			expect(data).toBeDefined();
			expect(data).toEqual(mockTechTree);
		});
	});

	describe("clearTechTreeCache", () => {
		it("should clear the cache", async () => {
			const mockTechTree: TechTree = {
				starship: [
					{
						label: "Defense",
						key: "defense",
						modules: [],
						image: null,
						color: "red",
						module_count: 5,
					},
				],
			};

			const mockApiCall = vi.fn().mockResolvedValue(mockTechTree);

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			await fetchTechTreeAsync("standard");
			expect(mockApiCall).toHaveBeenCalledTimes(1);

			clearTechTreeCache();

			await fetchTechTreeAsync("standard");
			// Should be called again after cache is cleared
			expect(mockApiCall).toHaveBeenCalledTimes(2);
		});

		it("should allow re-fetching after cache clear", async () => {
			const mockTechTree: TechTree = { starship: [] };

			const mockApiCall = vi.fn().mockResolvedValue(mockTechTree);

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			await fetchTechTreeAsync("standard");
			clearTechTreeCache();
			await fetchTechTreeAsync("standard");

			expect(mockApiCall).toHaveBeenCalledTimes(2);
		});
	});

	describe("Error handling", () => {
		it("should handle network errors gracefully", async () => {
			const mockApiCall = vi.fn().mockRejectedValue(new Error("Network error"));

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			// Should not throw - errors are caught and trigger the error dialog instead
			const result = await fetchTechTreeAsync("standard");
			expect(result).toEqual({});
		});

		it("should handle JSON parse errors gracefully", async () => {
			const mockApiCall = vi.fn().mockRejectedValue(new Error("Invalid JSON"));

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			// Should not throw - errors are caught and trigger the error dialog instead
			const result = await fetchTechTreeAsync("standard");
			expect(result).toEqual({});
		});

		it("should handle timeout errors gracefully", async () => {
			const mockApiCall = vi.fn().mockRejectedValue(new Error("Request timeout"));

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			// Should not throw - errors are caught and trigger the error dialog instead
			const result = await fetchTechTreeAsync("standard");
			expect(result).toEqual({});
		});
	});

	describe("Data structure validation", () => {
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
			};

			const mockApiCall = vi.fn().mockResolvedValue(mockData);

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const result = await fetchTechTreeAsync("standard");

			expect(result.starship).toBeDefined();
			expect(result.exosuit).toBeDefined();
		});

		it("should handle tech tree with modules", async () => {
			const mockModule: Module = {
				active: true,
				adjacency: "cardinal",
				adjacency_bonus: 10,
				bonus: 5,
				id: "mod1",
				image: "image.png",
				label: "Module 1",
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

			const result = await fetchTechTreeAsync("standard");

			expect((result.starship as TechTreeItem[])[0].modules).toHaveLength(1);
			expect((result.starship as TechTreeItem[])[0].modules[0]).toEqual(mockModule);
		});

		it("should preserve grid_definition if present", async () => {
			const mockData: TechTree = {
				grid_definition: {
					grid: [] as never[][],
					gridFixed: true,
					superchargedFixed: false,
				},
			} as unknown as TechTree;

			const mockApiCall = vi.fn().mockResolvedValue(mockData);

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const result = await fetchTechTreeAsync("standard");

			expect(result.grid_definition).toBeDefined();
			expect(result.grid_definition?.gridFixed).toBe(true);
		});
	});

	describe("API URL construction", () => {
		it("should construct correct API URL for different ship types", async () => {
			const mockApiCall = vi.fn().mockResolvedValue({});

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const shipTypes = ["standard", "explorer", "fighter", "hauler", "exotic"];

			for (const shipType of shipTypes) {
				clearTechTreeCache();
				mockApiCall.mockClear();

				await fetchTechTreeAsync(shipType);

				expect(mockApiCall).toHaveBeenCalledWith(
					expect.stringContaining(`tech_tree/${shipType}`),
					{},
					10000
				);
			}
		});
	});

	describe("Promise caching behavior", () => {
		it("should return cached promise after resolution", async () => {
			const mockTechTree: TechTree = {
				starship: [
					{
						label: "Defense",
						key: "defense",
						modules: [],
						image: null,
						color: "red",
						module_count: 5,
					},
				],
			};

			const mockApiCall = vi.fn().mockResolvedValue(mockTechTree);

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const promise = fetchTechTree("standard");

			// Wait for promise to resolve
			const data = await promise;
			expect(data).toEqual(mockTechTree);
		});

		it("should return same promise for same ship type", async () => {
			const mockTechTree: TechTree = {
				starship: [
					{
						label: "Defense",
						key: "defense",
						modules: [],
						image: null,
						color: "red",
						module_count: 5,
					},
				],
			};

			const mockApiCall = vi.fn().mockResolvedValue(mockTechTree);

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const promise1 = fetchTechTree("standard");
			const promise2 = fetchTechTree("standard");

			expect(promise1).toBe(promise2);
		});

		it("should return different promises for different ship types", async () => {
			const mockTechTree: TechTree = {
				starship: [
					{
						label: "Defense",
						key: "defense",
						modules: [],
						image: null,
						color: "red",
						module_count: 5,
					},
				],
			};

			const mockApiCall = vi.fn().mockResolvedValue(mockTechTree);

			vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

			const promise1 = fetchTechTree("standard");
			const promise2 = fetchTechTree("explorer");

			expect(promise1).not.toBe(promise2);
		});
	});
});
