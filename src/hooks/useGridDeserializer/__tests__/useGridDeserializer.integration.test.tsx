import fs from "node:fs";
import path from "node:path";
import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
			aqua: [{ color: "#777777", key: "aqua", modules: [{ id: "AJ" }] }],
			cargo_scanner: [{ color: "#333333", key: "cargo_scanner", modules: [{ id: "CD" }] }],
			ceto: [{ color: "#222222", key: "ceto", modules: [{ id: "Cb" }, { id: "Ca" }] }],
			cockpit: [
				{
					color: "#FF0000",
					key: "cockpit",
					modules: [{ id: "CP" }, { id: "Ca" }, { id: "Cb" }],
				},
			],
			conflict_scanner: [
				{ color: "#111111", key: "conflict_scanner", modules: [{ id: "CS" }] },
			],
			economy_scanner: [
				{ color: "#555555", key: "economy_scanner", modules: [{ id: "ES" }] },
			],
			habitation: [
				{
					color: "#FF00FF",
					key: "habitation",
					modules: [{ id: "Hc" }, { id: "Ha" }, { id: "Hb" }],
				},
			],
			hyper: [
				{
					color: "#444444",
					key: "hyper",
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
			launch: [
				{
					color: "#00FF00",
					key: "launch",
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
			phase: [
				{
					color: "#FFFF00",
					key: "phase",
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
			pulse: [
				{
					color: "#0000FF",
					key: "pulse",
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
			shield: [
				{
					color: "#FFFFFF",
					key: "shield",
					modules: [{ id: "AA" }, { id: "Ca" }, { id: "DS" }, { id: "Cb" }],
				},
			],
			teleporter: [{ color: "#00FFFF", key: "teleporter", modules: [{ id: "TP" }] }],
			trails: [
				{
					color: "#888888",
					key: "trails",
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
			cockpit: [{ color: "#FF0000", key: "cockpit", modules: [{ id: "CP" }] }],
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
