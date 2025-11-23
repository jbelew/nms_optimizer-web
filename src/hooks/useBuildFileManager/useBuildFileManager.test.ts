import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as hashUtils from "../../utils/hashUtils";
import { useBuildFileManager } from "./useBuildFileManager";

// Mock dependencies
vi.mock("../../store/GridStore", () => ({
	useGridStore: vi.fn(() => ({
		setGrid: vi.fn(),
		setIsSharedGrid: vi.fn(),
	})),
}));

vi.mock("../../store/PlatformStore", () => {
	const usePlatformStoreMock = vi.fn((selector) => {
		const store = {
			selectedPlatform: "freighter",
			setSelectedPlatform: vi.fn(),
		};
		return typeof selector === "function" ? selector(store) : store;
	});
	return {
		usePlatformStore: usePlatformStoreMock,
	};
});

vi.mock("../../store/TechStore", () => {
	const useTechStoreMock = vi.fn((selector) => {
		const store = {
			setTechColors: vi.fn(),
		};
		return typeof selector === "function" ? selector(store) : store;
	});
	return {
		useTechStore: useTechStoreMock,
	};
});

vi.mock("../../utils/hashUtils", () => ({
	computeSHA256: vi.fn(),
}));

vi.mock("../useGridDeserializer/useGridDeserializer", () => ({
	deserialize: vi.fn(),
	useGridDeserializer: () => ({
		serializeGrid: vi.fn(() => "serialized_data"),
	}),
}));

vi.mock("../useShipTypes/useShipTypes", () => ({
	useFetchShipTypesSuspense: () => ({
		freighter: {},
		explorer: {},
		fighter: {},
		shuttle: {},
	}),
}));

describe("useBuildFileManager", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("loadBuildFromFile", () => {
		it("should reject build file without checksum", async () => {
			const { result } = renderHook(() => useBuildFileManager());

			const buildFileWithoutChecksum = {
				name: "Test Build",
				shipType: "freighter",
				serialized: "test_serialized_data",
				timestamp: Date.now(),
				// Missing checksum
			};

			const file = new File([JSON.stringify(buildFileWithoutChecksum)], "test.nms", {
				type: "application/json",
			});

			await expect(result.current.loadBuildFromFile(file)).rejects.toThrow(
				"Build file is missing integrity checksum"
			);
		});

		it("should reject build file with invalid checksum", async () => {
			const { result } = renderHook(() => useBuildFileManager());

			const buildFileWithInvalidChecksum = {
				name: "Test Build",
				shipType: "freighter",
				serialized: "test_serialized_data",
				timestamp: Date.now(),
				checksum: "invalid_checksum_value",
			};

			vi.mocked(hashUtils.computeSHA256).mockResolvedValue("correct_checksum_value");

			const file = new File([JSON.stringify(buildFileWithInvalidChecksum)], "test.nms", {
				type: "application/json",
			});

			await expect(result.current.loadBuildFromFile(file)).rejects.toThrow(
				"Build file integrity check failed"
			);
		});

		it("should accept build file with valid checksum", async () => {
			const { result } = renderHook(() => useBuildFileManager());

			const correctChecksum = "abc123def456";
			const buildFileWithValidChecksum = {
				name: "Test Build",
				shipType: "freighter",
				serialized: "test_serialized_data",
				timestamp: Date.now(),
				checksum: correctChecksum,
			};

			vi.mocked(hashUtils.computeSHA256).mockResolvedValue(correctChecksum);
			const { deserialize } = await import("../useGridDeserializer/useGridDeserializer");
			vi.mocked(deserialize).mockResolvedValue({
				cells: [],
				width: 0,
				height: 0,
			});

			const file = new File([JSON.stringify(buildFileWithValidChecksum)], "test.nms", {
				type: "application/json",
			});

			await expect(result.current.loadBuildFromFile(file)).resolves.not.toThrow();
		});

		it("should reject file with invalid JSON", async () => {
			const { result } = renderHook(() => useBuildFileManager());

			const file = new File(["{ invalid json }"], "test.nms", {
				type: "application/json",
			});

			await expect(result.current.loadBuildFromFile(file)).rejects.toThrow(
				"File contains invalid JSON"
			);
		});

		it("should reject file with wrong extension", async () => {
			const { result } = renderHook(() => useBuildFileManager());

			const buildData = {
				name: "Test Build",
				shipType: "freighter",
				serialized: "test_serialized_data",
				timestamp: Date.now(),
				checksum: "some_checksum",
			};

			const file = new File([JSON.stringify(buildData)], "test.txt", {
				type: "text/plain",
			});

			await expect(result.current.loadBuildFromFile(file)).rejects.toThrow(
				"Invalid file type"
			);
		});

		it("should reject empty file", async () => {
			const { result } = renderHook(() => useBuildFileManager());

			const file = new File([], "test.nms", { type: "application/json" });

			await expect(result.current.loadBuildFromFile(file)).rejects.toThrow("File is empty");
		});

		it("should reject file that is too large", async () => {
			const { result } = renderHook(() => useBuildFileManager());

			// Create a large file (11MB, exceeds 10MB limit)
			const largeData = new Array(11 * 1024 * 1024).fill("x").join("");
			const file = new File([largeData], "test.nms", {
				type: "application/json",
			});

			await expect(result.current.loadBuildFromFile(file)).rejects.toThrow(
				"File is too large"
			);
		});

		it("should reject build file with unsupported shipType", async () => {
			const { result } = renderHook(() => useBuildFileManager());

			const correctChecksum = "abc123def456";
			const buildFileWithUnsupportedShip = {
				name: "Test Build",
				shipType: "unsupported_ship",
				serialized: "test_serialized_data",
				timestamp: Date.now(),
				checksum: correctChecksum,
			};

			vi.mocked(hashUtils.computeSHA256).mockResolvedValue(correctChecksum);

			const file = new File([JSON.stringify(buildFileWithUnsupportedShip)], "test.nms", {
				type: "application/json",
			});

			await expect(result.current.loadBuildFromFile(file)).rejects.toThrow(
				"Unsupported ship type"
			);
		});
	});
});
