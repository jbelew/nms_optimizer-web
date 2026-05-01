import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import * as useTechTree from "../../useTechTree/useTechTree";
import { deserialize, serialize } from "../useGridDeserializer";

const fixturePath = path.resolve(__dirname, "../../../../scripts/Corvette - Akamai Terror VI.nms");
const nmsFixture = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));

// Mock the tech tree fetcher to return stable data matching the fixture
vi.mock("../../useTechTree/useTechTree", async () => {
	const actual = await vi.importActual("../../useTechTree/useTechTree");

	return {
		...actual,
		fetchTechTreeAsync: vi.fn(),
	};
});

describe("useGridDeserializer Integration", () => {
	const mockSetTechColors = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		// Setup the mock to return data that matches the expected ship type in the fixture
		(useTechTree.fetchTechTreeAsync as Mock).mockResolvedValue({
			cockpit: [
				{
					key: "cockpit",
					color: "#FF0000",
					modules: [{ id: "CP" }, { id: "Ca" }, { id: "Cb" }],
				},
			],
			launch: [
				{
					key: "launch",
					color: "#00FF00",
					modules: [
						{ id: "Aa" },
						{ id: "Ab" },
						{ id: "LT" },
						{ id: "La" },
						{ id: "Lb" },
						{ id: "EF" },
						{ id: "Ac" },
					],
				},
			],
			pulse: [
				{
					key: "pulse",
					color: "#0000FF",
					modules: [
						{ id: "SL" },
						{ id: "PC" },
						{ id: "Bc" },
						{ id: "Ba" },
						{ id: "Xa" },
						{ id: "Xc" },
						{ id: "FA" },
						{ id: "Xb" },
						{ id: "PE" },
						{ id: "ID" },
					],
				},
			],
			phase: [
				{
					key: "phase",
					color: "#FFFF00",
					modules: [
						{ id: "Cb" },
						{ id: "Ca" },
						{ id: "FD" },
						{ id: "Xb" },
						{ id: "Xa" },
						{ id: "PB" },
						{ id: "Xc" },
						{ id: "Cc" },
					],
				},
			],
			habitation: [
				{
					key: "habitation",
					color: "#FF00FF",
					modules: [{ id: "Hc" }, { id: "Ha" }, { id: "Hb" }],
				},
			],
			teleporter: [{ key: "teleporter", color: "#00FFFF", modules: [{ id: "TP" }] }],
			shield: [
				{
					key: "shield",
					color: "#FFFFFF",
					modules: [{ id: "AA" }, { id: "Ca" }, { id: "DS" }, { id: "Cb" }],
				},
			],
			trails: [
				{
					key: "trails",
					color: "#888888",
					modules: [
						{ id: "RT" },
						{ id: "GT" },
						{ id: "PB" },
						{ id: "ST" },
						{ id: "CT" },
						{ id: "AB" },
						{ id: "ET" },
					],
				},
			],
			hyper: [
				{
					key: "hyper",
					color: "#444444",
					modules: [
						{ id: "AD" },
						{ id: "Xc" },
						{ id: "Zb" },
						{ id: "HD" },
						{ id: "Xa" },
						{ id: "Xb" },
						{ id: "Zc" },
						{ id: "Za" },
					],
				},
			],
			ceto: [{ key: "ceto", color: "#222222", modules: [{ id: "Cb" }, { id: "Ca" }] }],
			conflict_scanner: [
				{ key: "conflict_scanner", color: "#111111", modules: [{ id: "CS" }] },
			],
			cargo_scanner: [{ key: "cargo_scanner", color: "#333333", modules: [{ id: "CD" }] }],
			economy_scanner: [
				{ key: "economy_scanner", color: "#555555", modules: [{ id: "ES" }] },
			],
			aqua: [{ key: "aqua", color: "#777777", modules: [{ id: "AJ" }] }],
		});
	});

	it("should correctly serialize and deserialize a grid state from the .nms fixture", async () => {
		const originalGrid = nmsFixture.gridState.grid;
		const shipType = nmsFixture.shipType;

		// 1. Serialize the grid from the fixture
		const serialized = serialize(originalGrid);
		expect(serialized).toBeDefined();
		expect(typeof serialized).toBe("string");

		// 2. Deserialize it back
		const deserializedGrid = await deserialize(serialized, shipType, mockSetTechColors);

		// 3. Verify the round-trip integrity
		expect(deserializedGrid).not.toBeNull();

		if (deserializedGrid) {
			expect(deserializedGrid.width).toBe(originalGrid.width);
			expect(deserializedGrid.height).toBe(originalGrid.height);

			// Compare specific high-value cells
			// Cell [1,0] - Cockpit
			expect(deserializedGrid.cells[1][0].tech).toBe("cockpit");
			expect(deserializedGrid.cells[1][0].module).toBe("CP");
			expect(deserializedGrid.cells[1][0].active).toBe(true);

			// Cell [0,2] - Pulse Engine Upgrade (Supercharged)
			expect(deserializedGrid.cells[0][2].tech).toBe("pulse");
			expect(deserializedGrid.cells[0][2].module).toBe("Xa");
			expect(deserializedGrid.cells[0][2].supercharged).toBe(true);

			// Verify adjacency bonus flags
			expect(deserializedGrid.cells[1][0].adjacency_bonus).toBe(1.0); // Active in fixture
			expect(deserializedGrid.cells[5][1].active).toBe(true); // Economy Scanner replaced but still active
		}
	});

	it("should handle partial or missing tech tree data gracefully during deserialization", async () => {
		// Mocking a scenario where some tech categories are missing
		(useTechTree.fetchTechTreeAsync as Mock).mockResolvedValue({
			cockpit: [{ key: "cockpit", color: "#FF0000", modules: [{ id: "CP" }] }],
		});

		const originalGrid = nmsFixture.gridState.grid;
		const serialized = serialize(originalGrid);

		// This should warn but not crash
		const deserializedGrid = await deserialize(serialized, "corvette", mockSetTechColors);

		expect(deserializedGrid).not.toBeNull();

		if (deserializedGrid) {
			// Known tech should be restored
			expect(deserializedGrid.cells[1][0].tech).toBe("cockpit");
			// Unknown tech (e.g. cargo_scanner at 0,0) should be null in this mock
			expect(deserializedGrid.cells[0][0].tech).toBeNull();
		}
	});
});
