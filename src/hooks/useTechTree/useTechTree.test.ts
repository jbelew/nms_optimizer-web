import type { Module, TechTree, TechTreeItem } from "./useTechTree";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as fetchWithTimeoutModule from "../../utils/fetchWithTimeout";
import { clearTechTreeCache, fetchTechTree, fetchTechTreeAsync } from "./useTechTree";

// Mock fetchWithTimeout
vi.mock("../../utils/fetchWithTimeout", () => ({
	fetchWithTimeout: vi.fn(),
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
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockTechTree),
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			const result = await fetchTechTreeAsync("standard");

			expect(result).toEqual(mockTechTree);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("tech_tree/standard"),
				{},
				10000
			);
		});

		it("should cache the tech tree result", async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockTechTree),
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			await fetchTechTreeAsync("standard");
			await fetchTechTreeAsync("standard");

			// Should only be called once due to caching
			expect(mockFetch).toHaveBeenCalledTimes(1);
		});

		it("should handle different ship types separately", async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockTechTree),
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			await fetchTechTreeAsync("standard");
			await fetchTechTreeAsync("explorer");

			// Should be called twice for different ship types
			expect(mockFetch).toHaveBeenCalledTimes(2);
		});

		it("should throw error on HTTP error response", async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			await expect(fetchTechTreeAsync("invalid")).rejects.toThrow("HTTP error! status: 404");
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

			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockData),
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			const result = await fetchTechTreeAsync("standard");

			// Valid builds should be preserved, invalid ones filtered
			expect(Array.isArray(result.recommended_builds)).toBe(true);
		});

		it("should use default ship type 'standard'", async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockTechTree),
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			await fetchTechTreeAsync();

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("tech_tree/standard"),
				{},
				10000
			);
		});
	});

	describe("fetchTechTree resource function", () => {
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

		it("should return a resource that can be read", async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockTechTree),
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			const resource = fetchTechTree("standard");

			expect(resource).toHaveProperty("read");
			expect(typeof resource.read).toBe("function");
		});

		it("should throw suspender on pending read", async () => {
			const mockPromise = new Promise(() => {
				// Never resolves to keep it pending
			});

			const mockFetch = vi.fn().mockReturnValue(
				Promise.resolve({
					ok: true,
					json: vi.fn().mockReturnValue(mockPromise),
				})
			);

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			const resource = fetchTechTree("standard");

			expect(() => resource.read()).toThrow();
		});

		it("should use async function to populate cache", async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockTechTree),
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			const resource = fetchTechTree("standard");

			// Give the promise time to resolve
			await new Promise((resolve) => setTimeout(resolve, 100));

			// After resolution, read should return the data
			expect(() => {
				const data = resource.read();
				expect(data).toBeDefined();
			}).not.toThrow();
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

			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockTechTree),
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			await fetchTechTreeAsync("standard");
			expect(mockFetch).toHaveBeenCalledTimes(1);

			clearTechTreeCache();

			await fetchTechTreeAsync("standard");
			// Should be called again after cache is cleared
			expect(mockFetch).toHaveBeenCalledTimes(2);
		});

		it("should allow re-fetching after cache clear", async () => {
			const mockTechTree: TechTree = { starship: [] };

			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockTechTree),
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			await fetchTechTreeAsync("standard");
			clearTechTreeCache();
			await fetchTechTreeAsync("standard");

			expect(mockFetch).toHaveBeenCalledTimes(2);
		});
	});

	describe("Error handling", () => {
		it("should handle network errors", async () => {
			const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			await expect(fetchTechTreeAsync("standard")).rejects.toThrow("Network error");
		});

		it("should handle JSON parse errors", async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			await expect(fetchTechTreeAsync("standard")).rejects.toThrow("Invalid JSON");
		});

		it("should handle timeout errors", async () => {
			const mockFetch = vi.fn().mockRejectedValue(new Error("Request timeout"));

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			await expect(fetchTechTreeAsync("standard")).rejects.toThrow("Request timeout");
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

			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockData),
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

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

			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockData),
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

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

			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockData),
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			const result = await fetchTechTreeAsync("standard");

			expect(result.grid_definition).toBeDefined();
			expect(result.grid_definition?.gridFixed).toBe(true);
		});
	});

	describe("API URL construction", () => {
		it("should construct correct API URL for different ship types", async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue({}),
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			const shipTypes = ["standard", "explorer", "fighter", "hauler", "exotic"];

			for (const shipType of shipTypes) {
				clearTechTreeCache();
				mockFetch.mockClear();

				await fetchTechTreeAsync(shipType);

				expect(mockFetch).toHaveBeenCalledWith(
					expect.stringContaining(`tech_tree/${shipType}`),
					{},
					10000
				);
			}
		});
	});

	describe("Resource read behavior", () => {
		it("should cache resource after resolution", async () => {
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

			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockTechTree),
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			const resource = fetchTechTree("standard");

			// Wait for promise to resolve
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Should not throw and should return data
			const data = resource.read();
			expect(data).toEqual(mockTechTree);
		});

		it("should return same resource for same ship type", async () => {
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

			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockTechTree),
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			const resource1 = fetchTechTree("standard");
			const resource2 = fetchTechTree("standard");

			expect(resource1).toBe(resource2);
		});

		it("should return different resources for different ship types", async () => {
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

			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockTechTree),
			});

			vi.mocked(fetchWithTimeoutModule.fetchWithTimeout).mockImplementation(mockFetch);

			const resource1 = fetchTechTree("standard");
			const resource2 = fetchTechTree("explorer");

			expect(resource1).not.toBe(resource2);
		});
	});
});
