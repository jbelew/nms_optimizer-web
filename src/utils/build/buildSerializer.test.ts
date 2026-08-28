import { describe, expect, it, vi } from "vitest";

import { buildSerializer } from "./buildSerializer";

// Mock checksum to always return a stable value for testing
vi.mock("@/utils/system/hashUtils", () => ({
	computeSHA256: vi.fn(async () => "abc123def456"),
}));

const createValidBuildJson = () =>
	JSON.stringify({
		bonusState: {
			bonusStatus: {},
		},
		checksum: "abc123def456",
		gridState: {
			grid: { cells: [], height: 0, width: 0 },
			gridFixed: false,
			initialGridDefinition: undefined,
			isSharedGrid: false,
			result: null,
			superchargedFixed: false,
		},
		moduleState: {
			moduleSelections: {},
		},
		name: "Test Build",
		shipType: "freighter",
		techState: {
			checkedModules: {},
			maxBonus: {},
			solvedBonus: {},
			solveMethod: {},
		},
		timestamp: Date.now(),
	});

describe("buildSerializer", () => {
	describe("saveBuild", () => {
		it("should successfully serialize application state and return a Blob and filename", async () => {
			const result = await buildSerializer.saveBuild({
				buildName: "My Special Build",
				gridState: {
					grid: { cells: [], height: 0, width: 0 },
					gridFixed: false,
					initialGridDefinition: {},
					isSharedGrid: false,
					result: null,
					superchargedFixed: false,
				},
				shipType: "freighter",
				techState: {
					bonusStatus: {},
					checkedModules: {},
					maxBonus: {},
					solvedBonus: {},
					solveMethod: {},
				},
			});

			expect(result.filename).toBe("My Special Build.nms");
			expect(result.blob).toBeInstanceOf(Blob);

			const text = await result.blob.text();
			const parsed = JSON.parse(text);

			// Assert alphabetical sorting of top-level keys
			const topLevelKeys = Object.keys(parsed);
			expect(topLevelKeys).toEqual([
				"bonusState",
				"checksum",
				"gridState",
				"moduleState",
				"name",
				"shipType",
				"techState",
				"timestamp",
			]);

			// Assert nested state objects retain their original insertion order
			const gridStateKeys = Object.keys(parsed.gridState);
			expect(gridStateKeys).toEqual([
				"grid",
				"result",
				"isSharedGrid",
				"gridFixed",
				"superchargedFixed",
				"initialGridDefinition",
			]);

			const techStateKeys = Object.keys(parsed.techState);
			expect(techStateKeys).toEqual([
				"checkedModules",
				"maxBonus",
				"solvedBonus",
				"solveMethod",
			]);

			expect(parsed.name).toBe("My Special Build");
			expect(parsed.checksum).toBe("abc123def456");
			expect(parsed.shipType).toBe("freighter");
		});
	});

	describe("loadBuild", () => {
		it("should successfully parse and validate a valid build configuration text", async () => {
			const validJson = createValidBuildJson();

			const parsedData = await buildSerializer.loadBuild(validJson, ["freighter", "fighter"]);

			expect(parsedData.name).toBe("Test Build");
			expect(parsedData.shipType).toBe("freighter");
			expect(parsedData.checksum).toBe("abc123def456");
			expect(parsedData.gridState).toBeDefined();
			expect(parsedData.techState).toBeDefined();
		});

		it("should throw an error if the text is empty or whitespace", async () => {
			await expect(buildSerializer.loadBuild("", ["freighter"])).rejects.toThrow(
				"File is empty. Please select a valid build file."
			);

			await expect(buildSerializer.loadBuild("   ", ["freighter"])).rejects.toThrow(
				"File is empty. Please select a valid build file."
			);
		});

		it("should throw an error if the text contains invalid JSON", async () => {
			await expect(
				buildSerializer.loadBuild("{ invalid json }", ["freighter"])
			).rejects.toThrow("File contains invalid JSON. The build file may be corrupted.");
		});

		it("should throw an error if the build file is missing required fields", async () => {
			const incompleteJson = JSON.stringify({
				checksum: "abc123def456",
				name: "Incomplete Build",
				shipType: "freighter",
				timestamp: Date.now(),
				// missing states
			});

			await expect(buildSerializer.loadBuild(incompleteJson, ["freighter"])).rejects.toThrow(
				/The build file couldn.*t be loaded/i
			);
		});

		it("should throw an error if the checksum verification fails", async () => {
			const badChecksumJson = JSON.stringify({
				bonusState: { bonusStatus: {} },
				checksum: "incorrect_checksum",
				gridState: {
					grid: { cells: [], height: 0, width: 0 },
					gridFixed: false,
					isSharedGrid: false,
					result: null,
					superchargedFixed: false,
				},
				moduleState: { moduleSelections: {} },
				name: "Bad Checksum Build",
				shipType: "freighter",
				techState: { checkedModules: {}, maxBonus: {}, solvedBonus: {}, solveMethod: {} },
				timestamp: Date.now(),
			});

			await expect(buildSerializer.loadBuild(badChecksumJson, ["freighter"])).rejects.toThrow(
				"Build file integrity check failed. The file may have been corrupted or tampered with."
			);
		});

		it("should throw an error if the ship type is unsupported", async () => {
			const validJson = createValidBuildJson(); // has shipType: freighter

			await expect(buildSerializer.loadBuild(validJson, ["fighter"])).rejects.toThrow(
				'Unsupported ship type: "freighter". Valid types are: fighter.'
			);
		});
	});
});
