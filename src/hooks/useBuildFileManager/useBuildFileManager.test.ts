import type React from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildSerializer } from "@/utils/build/buildSerializer";

import { useBuildFileManager } from "./useBuildFileManager";

// Use vi.hoisted to declare mock functions and states that must be evaluated
// before the hoisted vi.mock factories run.
const {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockSetSelectedPlatform,
	mockSetTechState,
} = vi.hoisted(() => {
	const mockRestoreGridState = vi.fn();
	const mockGetGridState = vi.fn(() => ({
		grid: { cells: [], height: 0, width: 0 },
		gridFixed: false,
		initialGridDefinition: undefined,
		isSharedGrid: false,
		restoreGridState: mockRestoreGridState,
		result: null,
		superchargedFixed: false,
	}));

	const mockSetTechState = vi.fn();
	const mockGetTechState = vi.fn(() => ({
		bonusStatus: {},
		checkedModules: {},
		maxBonus: {},
		solvedBonus: {},
		solveMethod: {},
	}));

	const mockSetSelectedPlatform = vi.fn();
	const mockGetPlatformState = vi.fn(() => ({
		selectedPlatform: "freighter",
		setSelectedPlatform: mockSetSelectedPlatform,
	}));

	return {
		mockGetGridState,
		mockGetPlatformState,
		mockGetTechState,
		mockRestoreGridState,
		mockSetSelectedPlatform,
		mockSetTechState,
	};
});

vi.mock("@/store/grid/gridStore", () => {
	const mockStore = vi.fn((selector) => {
		const store = mockGetGridState();

		return typeof selector === "function" ? selector(store) : store;
	});
	Object.defineProperty(mockStore, "getState", {
		value: mockGetGridState,
		writable: true,
	});

	return {
		useGridStore: mockStore,
	};
});

vi.mock("@/store/tech/techStore", () => {
	const mockStore = vi.fn((selector) => {
		const store = mockGetTechState();

		return typeof selector === "function" ? selector(store) : store;
	});
	Object.defineProperty(mockStore, "getState", {
		value: mockGetTechState,
		writable: true,
	});
	Object.defineProperty(mockStore, "setState", {
		value: mockSetTechState,
		writable: true,
	});

	return {
		useTechStore: mockStore,
	};
});

vi.mock("@/store/app/platformStore", () => {
	const mockStore = vi.fn((selector) => {
		const store = mockGetPlatformState();

		return typeof selector === "function" ? selector(store) : store;
	});
	Object.defineProperty(mockStore, "getState", {
		value: mockGetPlatformState,
		writable: true,
	});

	return {
		usePlatformStore: mockStore,
	};
});

// Mock react's startTransition and useTransition to run immediately/synchronously and track pending state
vi.mock("react", async (importOriginal) => {
	const actual = await importOriginal<typeof React>();

	return {
		...actual,
		startTransition: vi.fn((cb: () => void) => cb()),
		useTransition: vi.fn(() => {
			const [isPending, setIsPending] = actual.useState(false);
			const startTransition = actual.useCallback(
				(cb: () => Promise<void> | void) => {
					const result = cb();

					if (result instanceof Promise) {
						setIsPending(true);

						return result.finally(() => {
							setIsPending(false);
						});
					}
				},
				[setIsPending]
			);

			return [isPending, startTransition];
		}),
	};
});

// Mock buildSerializer
vi.mock("@/utils/build/buildSerializer", () => ({
	buildSerializer: {
		loadBuild: vi.fn(),
		saveBuild: vi.fn(),
	},
}));

// Mock useFetchShipTypesSuspense hook
vi.mock("@/hooks/useShipTypes/useShipTypes", () => ({
	useFetchShipTypesSuspense: vi.fn(() => ({
		explorer: {},
		fighter: {},
		freighter: {},
		shuttle: {},
	})),
}));

describe("useBuildFileManager", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset store state getters to their default mock implementations
		mockGetGridState.mockImplementation(() => ({
			grid: { cells: [], height: 0, width: 0 },
			gridFixed: false,
			initialGridDefinition: undefined,
			isSharedGrid: false,
			restoreGridState: mockRestoreGridState,
			result: null,
			superchargedFixed: false,
		}));
		mockGetTechState.mockImplementation(() => ({
			bonusStatus: {},
			checkedModules: {},
			maxBonus: {},
			solvedBonus: {},
			solveMethod: {},
		}));
		mockGetPlatformState.mockImplementation(() => ({
			selectedPlatform: "freighter",
			setSelectedPlatform: mockSetSelectedPlatform,
		}));
	});

	describe("saveBuildToFile", () => {
		let originalCreateObjectURL: typeof URL.createObjectURL;
		let originalRevokeObjectURL: typeof URL.revokeObjectURL;
		const mockBlob = new Blob(["test"], { type: "application/octet-stream" });

		beforeEach(() => {
			originalCreateObjectURL = URL.createObjectURL;
			originalRevokeObjectURL = URL.revokeObjectURL;
			URL.createObjectURL = vi.fn(() => "blob:http://localhost/mock-uuid");
			URL.revokeObjectURL = vi.fn();
		});

		afterEach(() => {
			URL.createObjectURL = originalCreateObjectURL;
			URL.revokeObjectURL = originalRevokeObjectURL;
		});

		it("should delegate serialization to buildSerializer and trigger a DOM download", async () => {
			const buildName = "My Test Build";
			const mockFilename = "My-Test-Build.nms";

			vi.mocked(buildSerializer.saveBuild).mockResolvedValueOnce({
				blob: mockBlob,
				filename: mockFilename,
			});

			const { result } = renderHook(() => useBuildFileManager());

			const clickSpy = vi
				.spyOn(HTMLAnchorElement.prototype, "click")
				.mockImplementation(() => {});
			const appendChildSpy = vi.spyOn(document.body, "appendChild");
			const removeChildSpy = vi.spyOn(document.body, "removeChild");

			await act(async () => {
				await result.current.saveBuildToFile(buildName);
			});

			// Assert serialization delegation with store states
			expect(buildSerializer.saveBuild).toHaveBeenCalledWith({
				buildName,
				gridState: {
					grid: { cells: [], height: 0, width: 0 },
					gridFixed: false,
					initialGridDefinition: undefined,
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

			// Assert DOM download sequence
			expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
			expect(clickSpy).toHaveBeenCalled();

			const appendedElement = appendChildSpy.mock.calls.find(
				(call) => call[0] instanceof HTMLAnchorElement
			)?.[0] as HTMLAnchorElement | undefined;

			expect(appendedElement).toBeDefined();
			expect(appendedElement?.href).toBe("blob:http://localhost/mock-uuid");
			expect(appendedElement?.download).toBe(mockFilename);

			expect(removeChildSpy).toHaveBeenCalledWith(appendedElement);
			expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/mock-uuid");

			clickSpy.mockRestore();
			appendChildSpy.mockRestore();
			removeChildSpy.mockRestore();
		});

		it("should manage isPending state during save", async () => {
			const buildName = "My Test Build";
			const mockFilename = "My-Test-Build.nms";

			let resolveSave: (value: { blob: Blob; filename: string }) => void = () => {};

			const savePromise = new Promise<{ blob: Blob; filename: string }>((resolve) => {
				resolveSave = resolve;
			});

			vi.mocked(buildSerializer.saveBuild).mockReturnValueOnce(
				savePromise as unknown as ReturnType<typeof buildSerializer.saveBuild>
			);

			const { result } = renderHook(() => useBuildFileManager());

			const clickSpy = vi
				.spyOn(HTMLAnchorElement.prototype, "click")
				.mockImplementation(() => {});
			const appendChildSpy = vi.spyOn(document.body, "appendChild");
			const removeChildSpy = vi.spyOn(document.body, "removeChild");

			// Initially, isPending should be false
			expect(result.current.isPending).toBe(false);

			// Start saving - do not await the returned promise yet so we can inspect intermediate state
			let savePromiseResult: Promise<void>;
			act(() => {
				savePromiseResult = result.current.saveBuildToFile(buildName);
			});

			// Now, isPending should be true
			expect(result.current.isPending).toBe(true);

			// Resolve the save operation
			await act(async () => {
				resolveSave({
					blob: mockBlob,
					filename: mockFilename,
				});
				await savePromiseResult;
			});

			// Finally, isPending should be false again
			expect(result.current.isPending).toBe(false);

			clickSpy.mockRestore();
			appendChildSpy.mockRestore();
			removeChildSpy.mockRestore();
		});

		it("should reset isPending state to false and propagate errors if serialization fails", async () => {
			const serializerError = new Error("Serialization error");

			let rejectSave: (reason: Error) => void = () => {};

			const savePromise = new Promise<{ blob: Blob; filename: string }>((_, reject) => {
				rejectSave = reject;
			});

			vi.mocked(buildSerializer.saveBuild).mockReturnValueOnce(
				savePromise as unknown as ReturnType<typeof buildSerializer.saveBuild>
			);

			const { result } = renderHook(() => useBuildFileManager());

			const clickSpy = vi
				.spyOn(HTMLAnchorElement.prototype, "click")
				.mockImplementation(() => {});
			const appendChildSpy = vi.spyOn(document.body, "appendChild");
			const removeChildSpy = vi.spyOn(document.body, "removeChild");

			// Initially, isPending should be false
			expect(result.current.isPending).toBe(false);

			// Start saving
			let savePromiseResult: Promise<void>;
			act(() => {
				savePromiseResult = result.current.saveBuildToFile("Fail Build");
			});

			// Now, isPending should be true
			expect(result.current.isPending).toBe(true);

			// Reject the save operation
			await act(async () => {
				rejectSave(serializerError);
				await expect(savePromiseResult).rejects.toThrow("Failed to save build file");
			});

			// Finally, isPending should be false again
			expect(result.current.isPending).toBe(false);

			// Assert no DOM download elements were created or cleaned up abnormally
			expect(URL.createObjectURL).not.toHaveBeenCalled();
			expect(clickSpy).not.toHaveBeenCalled();
			expect(appendChildSpy).not.toHaveBeenCalled();

			clickSpy.mockRestore();
			appendChildSpy.mockRestore();
			removeChildSpy.mockRestore();
		});
	});

	describe("loadBuildFromFile", () => {
		it("should delegate validation and state restoration to buildSerializer", async () => {
			const mockFile = new File(["{}"], "test.nms", { type: "application/octet-stream" });
			const mockBuildData = {
				bonusState: {
					bonusStatus: {},
				},
				checksum: "abc123def456",
				gridState: {
					grid: { cells: [], height: 0, width: 0 },
					gridFixed: false,
					isSharedGrid: false,
					result: null,
					superchargedFixed: false,
				},
				moduleState: {},
				name: "Test Build",
				shipType: "freighter",
				techState: {
					checkedModules: {},
				},
				timestamp: Date.now(),
			};

			vi.mocked(buildSerializer.loadBuild).mockResolvedValueOnce(mockBuildData);

			const { result } = renderHook(() => useBuildFileManager());
			await act(async () => {
				await result.current.loadBuildFromFile(mockFile);
			});

			// Assert delegation to serializer with string content and valid ship types
			expect(buildSerializer.loadBuild).toHaveBeenCalledWith("{}", [
				"explorer",
				"fighter",
				"freighter",
				"shuttle",
			]);

			// Assert state restoration calls
			expect(mockRestoreGridState).toHaveBeenCalledWith({
				buildName: "Test Build",
				grid: { cells: [], height: 0, width: 0 },
				gridFixed: false,
				isSharedGrid: false,
				result: null,
				superchargedFixed: false,
			});
			expect(mockSetTechState).toHaveBeenCalledWith({
				bonusStatus: {},
				checkedModules: {},
			});
			expect(mockSetSelectedPlatform).not.toHaveBeenCalled();
		});

		it("should throw an error if the file extension is not .nms", async () => {
			const mockFile = new File(["{}"], "test.json", {
				type: "application/json",
			});

			const { result } = renderHook(() => useBuildFileManager());

			await expect(result.current.loadBuildFromFile(mockFile)).rejects.toThrow(
				"Invalid file type. Please select a .nms build file."
			);

			expect(result.current.isPending).toBe(false);
		});

		it("should throw an error if the file exceeds 10MB limit", async () => {
			const chunk = "x".repeat(1024 * 1024); // 1MB
			const parts = Array.from({ length: 11 }, () => chunk); // 11MB
			const mockFile = new File(parts, "large.nms", {
				type: "application/octet-stream",
			});

			const { result } = renderHook(() => useBuildFileManager());

			await expect(result.current.loadBuildFromFile(mockFile)).rejects.toThrow(
				"File is too large. Build files should be under 10MB."
			);

			expect(result.current.isPending).toBe(false);
		});

		it("should throw an error if the file is empty", async () => {
			const mockFile = new File([], "empty.nms", {
				type: "application/octet-stream",
			});

			const { result } = renderHook(() => useBuildFileManager());

			await expect(
				act(async () => {
					await result.current.loadBuildFromFile(mockFile);
				})
			).rejects.toThrow("File is empty. Please select a valid build file.");

			expect(result.current.isPending).toBe(false);
		});

		it("should manage isPending state during load", async () => {
			const mockFile = new File(["{}"], "test.nms", { type: "application/octet-stream" });
			const mockBuildData = {
				bonusState: {
					bonusStatus: {},
				},
				checksum: "abc123def456",
				gridState: {
					grid: { cells: [], height: 0, width: 0 },
					gridFixed: false,
					isSharedGrid: false,
					result: null,
					superchargedFixed: false,
				},
				moduleState: {},
				name: "Test Build",
				shipType: "freighter",
				techState: {
					checkedModules: {},
				},
				timestamp: Date.now(),
			};

			let resolveLoad: (value: typeof mockBuildData) => void = () => {};

			const loadPromise = new Promise<typeof mockBuildData>((resolve) => {
				resolveLoad = resolve;
			});

			vi.mocked(buildSerializer.loadBuild).mockReturnValueOnce(
				loadPromise as unknown as ReturnType<typeof buildSerializer.loadBuild>
			);

			const { result } = renderHook(() => useBuildFileManager());

			// Initially, isPending should be false
			expect(result.current.isPending).toBe(false);

			// Start loading - do not await the returned promise yet so we can inspect intermediate state
			let loadPromiseResult: Promise<void>;
			act(() => {
				loadPromiseResult = result.current.loadBuildFromFile(mockFile);
			});

			// Now, isPending should be true
			expect(result.current.isPending).toBe(true);

			// Resolve the load operation
			await act(async () => {
				resolveLoad(mockBuildData);
				await loadPromiseResult;
			});

			// Finally, isPending should be false again
			expect(result.current.isPending).toBe(false);
		});

		it("should reset isPending state to false and propagate errors if load fails", async () => {
			const mockFile = new File(["{}"], "test.nms", { type: "application/octet-stream" });
			const serializerError = new Error("Validation failed");

			let rejectLoad: (reason: Error) => void = () => {};

			const loadPromise = new Promise<never>((_, reject) => {
				rejectLoad = reject;
			});

			vi.mocked(buildSerializer.loadBuild).mockReturnValueOnce(
				loadPromise as unknown as ReturnType<typeof buildSerializer.loadBuild>
			);

			const { result } = renderHook(() => useBuildFileManager());

			// Initially, isPending should be false
			expect(result.current.isPending).toBe(false);

			// Start loading
			let loadPromiseResult: Promise<void>;
			act(() => {
				loadPromiseResult = result.current.loadBuildFromFile(mockFile);
			});

			// Now, isPending should be true
			expect(result.current.isPending).toBe(true);

			// Reject the load operation
			await act(async () => {
				rejectLoad(serializerError);
				await expect(loadPromiseResult).rejects.toThrow("Validation failed");
			});

			// Finally, isPending should be false again
			expect(result.current.isPending).toBe(false);
		});
	});
});
