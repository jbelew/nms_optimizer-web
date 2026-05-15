import { vi } from "vitest";

import { API_URL } from "../../constants";
import { createEmptyCell } from "../../store/grid/gridStore"; // Import createEmptyCell
import { apiCall } from "../../utils/api/network";
import { clearTechTreeCache } from "../useTechTree/useTechTree";
import { deserialize } from "./useGridDeserializer";

// Mock dependencies
vi.mock("../../store/grid/gridStore", () => ({
	createEmptyCell: vi.fn(() => ({
		active: false,
		adjacency: "none",
		adjacency_bonus: 0,
		bonus: 0,
		image: null,
		label: "",
		module: null,
		sc_eligible: false,
		supercharged: false,
		tech: null,
		value: 0,
	})),
	createGrid: vi.fn((width, height) => ({
		cells: Array.from({ length: height }, () =>
			Array.from({ length: width }, () => createEmptyCell())
		),
		height,
		width,
	})),
}));

vi.mock("../../utils/validation/dataValidation", () => ({
	validateRecommendedBuild: vi.fn(),
}));

vi.mock("../../utils/api/network", () => ({
	apiCall: vi.fn(),
}));

describe("deserialize", () => {
	const mockSetTechColors = vi.fn();
	const mockShipType = "standard";

	beforeEach(() => {
		vi.clearAllMocks();
		clearTechTreeCache();
	});

	it("should deserialize a valid grid string and set tech colors", async () => {
		// Arrange
		const serializedGrid =
			"111111111111111111111111111111111111111111111111111111111111|%033%207%032%2048|ABC%207DE%2048|T3F7T2F48|shield:%03|Cb:A,Ca:B,DS:C,Cc:D,AA:E";

		const mockTechTree = {
			"Tech Category 1": [
				{
					color: "blue",
					key: "shield",
					modules: [
						{
							active: true,
							adjacency: "none",
							adjacency_bonus: 0,
							bonus: 0,
							id: "Cb",
							image: "cb.webp",
							label: "Combat Booster",
							sc_eligible: false,
							supercharged: false,
							tech: "shield",
							type: "module",
							value: 0,
						},
						{
							active: true,
							adjacency: "none",
							adjacency_bonus: 0,
							bonus: 0,
							id: "Ca",
							image: "ca.webp",
							label: "Cargo",
							sc_eligible: false,
							supercharged: false,
							tech: "shield",
							type: "module",
							value: 0,
						},
						{
							active: true,
							adjacency: "none",
							adjacency_bonus: 0,
							bonus: 0,
							id: "DS",
							image: "ds.webp",
							label: "Deflector Shield",
							sc_eligible: false,
							supercharged: false,
							tech: "shield",
							type: "module",
							value: 0,
						},
						{
							active: true,
							adjacency: "none",
							adjacency_bonus: 0,
							bonus: 0,
							id: "Cc",
							image: "cc.webp",
							label: "Coolant",
							sc_eligible: false,
							supercharged: false,
							tech: "shield",
							type: "module",
							value: 0,
						},
						{
							active: true,
							adjacency: "none",
							adjacency_bonus: 0,
							bonus: 0,
							id: "AA",
							image: "aa.webp",
							label: "Auto-Attacker",
							sc_eligible: false,
							supercharged: false,
							tech: "shield",
							type: "module",
							value: 0,
						},
					],
				},
			],
		};

		// Mock apiCall response
		vi.mocked(apiCall).mockResolvedValueOnce(mockTechTree);

		// Act
		const resultGrid = await deserialize(serializedGrid, mockShipType, mockSetTechColors);

		// Assert
		expect(apiCall).toHaveBeenCalledWith(`${API_URL}/tech_tree/${mockShipType}`, {}, 10000);
		expect(mockSetTechColors).toHaveBeenCalledWith({
			shield: "blue",
		});
		expect(resultGrid).not.toBeNull();
		expect(resultGrid?.cells.length).toBe(6);
		expect(resultGrid?.cells[0].length).toBe(10);

		// Further assertions to check cell content if needed
		// For example, check a specific cell's tech and module
		expect(resultGrid?.cells[0][0].active).toBe(true);
		expect(resultGrid?.cells[0][0].tech).toBe("shield");
		expect(resultGrid?.cells[0][0].module).toBe("Cb");
	});

	it("should return null and log an error if fetch fails", async () => {
		// Arrange
		// Use a valid serialized grid that will pass initial checks
		const serializedGrid =
			"111111111111111111111111111111111111111111111111111111111111|%033%207%032%2048|ABC%207DE%2048|T3F7T2F48|shield:%03|Cb:A,Ca:B,DS:C,Cc:D,AA:E";

		// Mock apiCall to reject - this will cause fetchTechTreeAsync to return an empty object
		vi.mocked(apiCall).mockRejectedValueOnce(new Error("HTTP error! status: 500"));

		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		// Act
		const result = await deserialize(serializedGrid, mockShipType, mockSetTechColors);

		// Assert
		expect(result).toBeNull();
		// The error about fetch failing is logged from fetchTechTreeAsync, and then
		// deserialize logs its own error about empty tech tree data
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Error fetching tech tree:",
			expect.any(Error)
		);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Tech tree data is empty. Fetch likely failed."
		);
		expect(mockSetTechColors).not.toHaveBeenCalled();
		consoleErrorSpy.mockRestore();
	});

	it("should return null and log a warning if serializedGrid is empty", async () => {
		// Arrange
		const serializedGrid = "";
		const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		// Act
		const result = await deserialize(serializedGrid, mockShipType, mockSetTechColors);

		// Assert
		expect(result).toBeNull();
		expect(consoleWarnSpy).toHaveBeenCalledWith(
			"No serialized grid data found. Skipping deserialization."
		);
		expect(mockSetTechColors).not.toHaveBeenCalled();
		consoleWarnSpy.mockRestore();
	});

	it("should return null and log an error if decodedURIComponent is empty", async () => {
		// Arrange
		// This serialized grid will result in a URI malformed error
		const serializedGrid = "%";
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		// Act
		const result = await deserialize(serializedGrid, mockShipType, mockSetTechColors);

		// Assert
		expect(result).toBeNull();
		// The actual error thrown is URI malformed, caught by the outer try/catch
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Error deserializing grid:",
			"URI malformed",
			expect.any(String)
		);
		expect(mockSetTechColors).not.toHaveBeenCalled();
		consoleErrorSpy.mockRestore();
	});

	it("should return null and log an error if serialized grid format is invalid (wrong number of parts)", async () => {
		// Arrange
		const serializedGrid = "part1|part2|part3"; // Only 3 parts
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		// Act
		const result = await deserialize(serializedGrid, mockShipType, mockSetTechColors);

		// Assert
		expect(result).toBeNull();
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Invalid serialized grid format. Incorrect number of parts. Expected 6, got",
			3,
			"Skipping deserialization."
		);
		expect(mockSetTechColors).not.toHaveBeenCalled();
		consoleErrorSpy.mockRestore();
	});

	it("should return null and log an error if serialized grid format is invalid (missing parts)", async () => {
		// Arrange
		const serializedGrid = "|||||"; // 6 parts, but all undefined/empty
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		// Mock apiCall to avoid unrelated errors
		vi.mocked(apiCall).mockResolvedValueOnce({});
		// Act
		const result = await deserialize(serializedGrid, mockShipType, mockSetTechColors);

		// Assert
		expect(result).toBeNull();
		// This now correctly catches the length mismatch error
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			expect.stringContaining("Invalid serialized grid format: String length mismatch.")
		);
		expect(mockSetTechColors).not.toHaveBeenCalled();
		consoleErrorSpy.mockRestore();
	});

	it("should return null and log an error if string length mismatch", async () => {
		// Arrange
		// A grid string that is too short
		const serializedGrid =
			"1|%033%207%032%2048|ABC%207DE%2048|T3F7T2F48|shield:%03|Cb:A,Ca:B,DS:C,Cc:D,AA:E";

		// Mock apiCall to avoid unrelated errors
		vi.mocked(apiCall).mockResolvedValueOnce({});

		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		// Act
		const result = await deserialize(serializedGrid, mockShipType, mockSetTechColors);

		// Assert
		expect(result).toBeNull();
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			expect.stringContaining("Invalid serialized grid format: String length mismatch.")
		);
		expect(mockSetTechColors).not.toHaveBeenCalled();
		consoleErrorSpy.mockRestore();
	});
});
