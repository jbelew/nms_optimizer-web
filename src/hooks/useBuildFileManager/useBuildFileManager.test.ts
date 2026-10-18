import type { ChangeEvent } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePlatformStore } from "@/store/app/platformStore";
import { createGrid, useGridStore } from "@/store/grid/gridStore";
import { sessionCoordinator } from "@/store/sessionCoordinator";
import { useTechStore } from "@/store/tech/techStore";
import { buildSerializer } from "@/utils/build/buildSerializer";
import { Logger } from "@/utils/system/monitoring";

import { useBuildFileManager, useFileHandling } from "./useBuildFileManager";

const { mockSendEvent, mockShowError, mockShowSuccess } = vi.hoisted(() => ({
	mockSendEvent: vi.fn(),
	mockShowError: vi.fn(),
	mockShowSuccess: vi.fn(),
}));

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock("@/hooks/useToast/useToast", () => ({
	useToast: () => ({
		showError: mockShowError,
		showSuccess: mockShowSuccess,
	}),
}));

vi.mock("@/hooks/useAnalytics/useAnalytics", () => ({
	useAnalytics: () => ({
		sendEvent: mockSendEvent,
	}),
}));

const mockPlatformCatalog = {
	explorer: { label: "Explorer", type: "Starship" },
	fighter: { label: "Fighter", type: "Starship" },
	freighter: { label: "Freighter", type: "Freighter" },
	shuttle: { label: "Shuttle", type: "Starship" },
	standard: { label: "Standard", type: "Starship" },
};

vi.mock("@/store/app/platformStore", async () => {
	const actual = await vi.importActual("@/store/app/platformStore");

	return {
		...actual,
		fetchPlatforms: vi.fn(async () => mockPlatformCatalog),
	};
});

/**
 * Creates a synthetic file input ChangeEvent for testing `handleFileSelect`.
 *
 * @param {File[]} files - The files to attach to `event.target.files`.
 * @param {string} [initialValue="C:\\fakepath\\test.nms"] - Initial value of `event.target.value`.
 *
 * @returns {ChangeEvent<HTMLInputElement>} The synthetic change event.
 */
const createFileChangeEvent = (
	files: File[],
	initialValue = "C:\\fakepath\\test.nms"
): ChangeEvent<HTMLInputElement> => {
	const target = {
		files,
		value: initialValue,
	} as unknown as HTMLInputElement;

	return { target } as ChangeEvent<HTMLInputElement>;
};

describe("useBuildFileManager", () => {
	let originalCreateObjectURL: typeof URL.createObjectURL;
	let originalRevokeObjectURL: typeof URL.revokeObjectURL;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(Logger, "error").mockImplementation(() => {});

		originalCreateObjectURL = URL.createObjectURL;
		originalRevokeObjectURL = URL.revokeObjectURL;
		URL.createObjectURL = vi.fn(() => "blob:http://localhost/mock-uuid");
		URL.revokeObjectURL = vi.fn();

		sessionCoordinator.resetSession();
		usePlatformStore.setState({
			platforms: mockPlatformCatalog,
			selectedPlatform: "freighter",
		});
	});

	afterEach(() => {
		URL.createObjectURL = originalCreateObjectURL;
		URL.revokeObjectURL = originalRevokeObjectURL;
		vi.restoreAllMocks();
	});

	describe("save workflow (handleSaveBuild, handleBuildNameConfirm, handleBuildNameCancel)", () => {
		it("synchronizes save dialog state across desktop and mobile hook instances", () => {
			const { result: desktop } = renderHook(() => useBuildFileManager());
			const { result: mobile } = renderHook(() => useBuildFileManager());

			expect(desktop.current.isSaveBuildDialogOpen).toBe(false);
			expect(mobile.current.isSaveBuildDialogOpen).toBe(false);

			act(() => {
				mobile.current.handleSaveBuild();
			});

			expect(desktop.current.isSaveBuildDialogOpen).toBe(true);
			expect(mobile.current.isSaveBuildDialogOpen).toBe(true);

			act(() => {
				desktop.current.handleBuildNameCancel();
			});

			expect(desktop.current.isSaveBuildDialogOpen).toBe(false);
			expect(mobile.current.isSaveBuildDialogOpen).toBe(false);
		});

		it("serializes the active session snapshot, triggers a DOM download, and emits toast and analytics feedback", async () => {
			const grid = createGrid(10, 6);
			grid.cells[0][0].module = "pulse-core";
			grid.cells[0][0].tech = "pulse";
			useGridStore.getState().setGrid(grid);
			useTechStore.setState({
				checkedModules: { pulse: ["pulse-core", "upgrade-1"] },
				maxBonus: { pulse: 112.5 },
				solvedBonus: { pulse: 108.2 },
			});

			const clickSpy = vi
				.spyOn(HTMLAnchorElement.prototype, "click")
				.mockImplementation(() => {});
			const appendChildSpy = vi.spyOn(document.body, "appendChild");
			const removeChildSpy = vi.spyOn(document.body, "removeChild");

			const { result: desktop } = renderHook(() => useBuildFileManager());
			const { result: mobile } = renderHook(() => useBuildFileManager());

			act(() => {
				desktop.current.handleSaveBuild();
			});
			expect(desktop.current.isSaveBuildDialogOpen).toBe(true);

			await act(async () => {
				await desktop.current.handleBuildNameConfirm("My Fighter Build");
			});

			expect(desktop.current.isSaveBuildDialogOpen).toBe(false);
			expect(desktop.current.isSavePending).toBe(false);
			expect(mobile.current.isSavePending).toBe(false);

			expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
			expect(clickSpy).toHaveBeenCalledTimes(1);

			const appendedAnchor = appendChildSpy.mock.calls.find(
				(call) => call[0] instanceof HTMLAnchorElement
			)?.[0] as HTMLAnchorElement | undefined;

			expect(appendedAnchor).toBeDefined();
			expect(appendedAnchor?.href).toBe("blob:http://localhost/mock-uuid");
			expect(appendedAnchor?.download).toBe("My Fighter Build.nms");
			expect(removeChildSpy).toHaveBeenCalledWith(appendedAnchor);
			expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/mock-uuid");

			expect(mockShowSuccess).toHaveBeenCalledWith(
				"toast.buildSaved.title",
				"toast.buildSaved.description",
				5000
			);
			expect(mockSendEvent).toHaveBeenCalledWith({
				action: "save_build",
				build_name: "My Fighter Build",
				category: "ui",
				method: "nms_file",
				nonInteraction: false,
				shipType: "freighter",
				value: 1,
			});
		});

		it("synchronizes isSavePending across callers while saving and shows an error toast on failure", async () => {
			let rejectDigest: (reason: Error) => void = () => {};

			const digestPromise = new Promise<ArrayBuffer>((_, reject) => {
				rejectDigest = reject;
			});

			vi.spyOn(crypto.subtle, "digest").mockReturnValueOnce(digestPromise);
			const clickSpy = vi
				.spyOn(HTMLAnchorElement.prototype, "click")
				.mockImplementation(() => {});

			const { result: desktop } = renderHook(() => useBuildFileManager());
			const { result: mobile } = renderHook(() => useBuildFileManager());

			let pendingConfirm!: Promise<void>;
			act(() => {
				pendingConfirm = desktop.current.handleBuildNameConfirm("Broken Build");
			});

			expect(desktop.current.isSavePending).toBe(true);
			expect(mobile.current.isSavePending).toBe(true);

			await act(async () => {
				rejectDigest(new Error("WebCrypto digest failed"));
				await pendingConfirm;
			});

			expect(desktop.current.isSavePending).toBe(false);
			expect(mobile.current.isSavePending).toBe(false);
			expect(clickSpy).not.toHaveBeenCalled();
			expect(mockShowError).toHaveBeenCalledWith(
				"toast.buildSaveError.title",
				"toast.buildSaveError.description",
				5000
			);
		});
	});

	describe("load workflow via file input (handleLoadBuild, handleFileSelect)", () => {
		it("clicks the shared hidden file input when handleLoadBuild is called from any instance", () => {
			const { result: desktop } = renderHook(() => useBuildFileManager());
			const { result: mobile } = renderHook(() => useBuildFileManager());

			const input = document.createElement("input");
			const clickSpy = vi.spyOn(input, "click").mockImplementation(() => {});
			desktop.current.fileInputRef.current = input;

			act(() => {
				mobile.current.handleLoadBuild();
			});

			expect(clickSpy).toHaveBeenCalledTimes(1);
		});

		it("round-trips a real .nms Build File into the stores, synchronizes isLoadPending across callers, and emits toast and analytics", async () => {
			// 1. Prepare a real serialized .nms payload for platform "fighter"
			const sourceGrid = createGrid(10, 6);
			sourceGrid.cells[1][2].module = "hyper-core";
			sourceGrid.cells[1][2].tech = "hyper";
			sourceGrid.cells[1][2].supercharged = true;

			const { blob, filename } = await buildSerializer.saveBuild({
				buildName: "Roundtrip Fighter",
				gridState: {
					grid: sourceGrid,
					gridFixed: true,
					initialGridDefinition: undefined,
					isSharedGrid: false,
					result: null,
					superchargedFixed: true,
				},
				shipType: "fighter",
				techState: {
					bonusStatus: {},
					checkedModules: { hyper: ["hyper-core", "upgrade-s"] },
					maxBonus: { hyper: 125 },
					solvedBonus: { hyper: 120 },
					solveMethod: { hyper: "SA" },
				},
			});

			const nmsText = await blob.text();
			const nmsFile = new File([nmsText], filename, { type: "application/octet-stream" });

			// Reset stores to a different platform ("freighter") before loading
			sessionCoordinator.resetSession();
			usePlatformStore.setState({ selectedPlatform: "freighter" });

			const { result: desktop } = renderHook(() => useBuildFileManager());
			const { result: mobile } = renderHook(() => useBuildFileManager());

			const changeEvent = createFileChangeEvent([nmsFile]);

			await act(async () => {
				await desktop.current.handleFileSelect(changeEvent);
			});

			// Verify stores were restored via real sessionCoordinator.restoreBuildSnapshot
			expect(usePlatformStore.getState().selectedPlatform).toBe("fighter");
			expect(useGridStore.getState().buildName).toBe("Roundtrip Fighter");
			expect(useGridStore.getState().gridFixed).toBe(true);
			expect(useGridStore.getState().superchargedFixed).toBe(true);
			expect(useGridStore.getState().grid.cells[1][2].module).toBe("hyper-core");
			expect(useTechStore.getState().checkedModules.hyper).toEqual([
				"hyper-core",
				"upgrade-s",
			]);
			expect(useTechStore.getState().solvedBonus.hyper).toBe(120);

			// Verify input reset, pending state, toast, and analytics
			expect(changeEvent.target.value).toBe("");
			expect(desktop.current.isLoadPending).toBe(false);
			expect(mobile.current.isLoadPending).toBe(false);
			expect(mockShowSuccess).toHaveBeenCalledWith(
				"toast.buildLoaded.title",
				expect.anything(),
				5000
			);
			expect(mockSendEvent).toHaveBeenCalledWith({
				action: "load_build",
				category: "ui",
				file_name: "Roundtrip Fighter.nms",
				method: "nms_file",
				nonInteraction: false,
				shipType: "fighter",
				value: 1,
			});
		});

		it("synchronizes isLoadPending across both desktop and mobile callers while a file load is in flight", async () => {
			let resolveText: (text: string) => void = () => {};

			const delayedFile = new File(["{}"], "pending.nms", {
				type: "application/octet-stream",
			});
			vi.spyOn(delayedFile, "text").mockReturnValueOnce(
				new Promise<string>((resolve) => {
					resolveText = resolve;
				})
			);

			const { result: desktop } = renderHook(() => useBuildFileManager());
			const { result: mobile } = renderHook(() => useBuildFileManager());

			const changeEvent = createFileChangeEvent([delayedFile]);

			let pendingSelect!: Promise<void>;
			act(() => {
				pendingSelect = desktop.current.handleFileSelect(changeEvent);
			});

			// Both desktop and mobile instances must observe isLoadPending = true
			expect(desktop.current.isLoadPending).toBe(true);
			expect(mobile.current.isLoadPending).toBe(true);

			await act(async () => {
				resolveText("");
				await pendingSelect;
			});

			expect(desktop.current.isLoadPending).toBe(false);
			expect(mobile.current.isLoadPending).toBe(false);
		});

		it("shows a validation error toast when the selected file does not have a .nms extension", async () => {
			const invalidFile = new File(["{}"], "build.json", { type: "application/json" });
			const changeEvent = createFileChangeEvent([invalidFile], "C:\\fakepath\\build.json");

			const { result } = renderHook(() => useBuildFileManager());

			await act(async () => {
				await result.current.handleFileSelect(changeEvent);
			});

			expect(mockShowError).toHaveBeenCalledWith(
				"toast.buildLoadError.title",
				"Invalid file type. Please select a .nms build file.",
				5000
			);
			expect(changeEvent.target.value).toBe("");
			expect(result.current.isLoadPending).toBe(false);
		});

		it("shows a validation error toast when the file exceeds the 10MB limit", async () => {
			const chunk = "x".repeat(1024 * 1024);
			const parts = Array.from({ length: 11 }, () => chunk);
			const largeFile = new File(parts, "huge.nms", { type: "application/octet-stream" });
			const changeEvent = createFileChangeEvent([largeFile]);

			const { result } = renderHook(() => useBuildFileManager());

			await act(async () => {
				await result.current.handleFileSelect(changeEvent);
			});

			expect(mockShowError).toHaveBeenCalledWith(
				"toast.buildLoadError.title",
				"File is too large. Build files should be under 10MB.",
				5000
			);
			expect(result.current.isLoadPending).toBe(false);
		});

		it("shows a validation error toast when the .nms file is empty", async () => {
			const emptyFile = new File([], "empty.nms", { type: "application/octet-stream" });
			const changeEvent = createFileChangeEvent([emptyFile]);

			const { result } = renderHook(() => useBuildFileManager());

			await act(async () => {
				await result.current.handleFileSelect(changeEvent);
			});

			expect(mockShowError).toHaveBeenCalledWith(
				"toast.buildLoadError.title",
				"File is empty. Please select a valid build file.",
				5000
			);
			expect(result.current.isLoadPending).toBe(false);
		});

		it("shows a validation error toast when the .nms file fails checksum or schema validation", async () => {
			const tamperedFile = new File(
				[JSON.stringify({ checksum: "bad", name: "Tampered", shipType: "fighter" })],
				"tampered.nms",
				{ type: "application/octet-stream" }
			);
			const changeEvent = createFileChangeEvent([tamperedFile]);

			const { result } = renderHook(() => useBuildFileManager());

			await act(async () => {
				await result.current.handleFileSelect(changeEvent);
			});

			expect(mockShowError).toHaveBeenCalledWith(
				"toast.buildLoadError.title",
				expect.any(String),
				5000
			);
			expect(result.current.isLoadPending).toBe(false);
		});
	});

	describe("PWA OS file launch workflow (useFileHandling)", () => {
		let originalLaunchQueue: Window["launchQueue"];

		beforeEach(() => {
			originalLaunchQueue = window.launchQueue;
		});

		afterEach(() => {
			Object.defineProperty(window, "launchQueue", {
				configurable: true,
				value: originalLaunchQueue,
				writable: true,
			});
		});

		it("routes OS-launched .nms files through the unified intake pipeline with store restoration, toast, and analytics", async () => {
			let capturedConsumer:
				((params: { files: FileSystemFileHandle[] }) => Promise<void>) | undefined;

			Object.defineProperty(window, "launchQueue", {
				configurable: true,
				value: {
					setConsumer: vi.fn((consumer) => {
						capturedConsumer = consumer;
					}),
				},
				writable: true,
			});

			const { blob, filename } = await buildSerializer.saveBuild({
				buildName: "OS Launched Explorer",
				gridState: {
					grid: createGrid(10, 6),
					gridFixed: false,
					initialGridDefinition: undefined,
					isSharedGrid: false,
					result: null,
					superchargedFixed: false,
				},
				shipType: "explorer",
				techState: {
					bonusStatus: {},
					checkedModules: { shield: ["shield-core"] },
					maxBonus: {},
					solvedBonus: {},
					solveMethod: {},
				},
			});

			const nmsText = await blob.text();
			const nmsFile = new File([nmsText], filename, { type: "application/octet-stream" });

			renderHook(() => useFileHandling());
			expect(capturedConsumer).toBeDefined();

			await act(async () => {
				await capturedConsumer?.({
					files: [
						{
							getFile: vi.fn(async () => nmsFile),
						} as unknown as FileSystemFileHandle,
					],
				});
			});

			expect(usePlatformStore.getState().selectedPlatform).toBe("explorer");
			expect(useGridStore.getState().buildName).toBe("OS Launched Explorer");
			expect(useTechStore.getState().checkedModules.shield).toEqual(["shield-core"]);
			expect(mockShowSuccess).toHaveBeenCalledWith(
				"toast.buildLoaded.title",
				expect.anything(),
				5000
			);
			expect(mockSendEvent).toHaveBeenCalledWith({
				action: "load_build",
				category: "ui",
				file_name: "OS Launched Explorer.nms",
				method: "nms_file",
				nonInteraction: false,
				shipType: "explorer",
				value: 1,
			});
		});

		it("surfaces an error toast when an OS-launched .nms file is corrupted", async () => {
			let capturedConsumer:
				((params: { files: FileSystemFileHandle[] }) => Promise<void>) | undefined;

			Object.defineProperty(window, "launchQueue", {
				configurable: true,
				value: {
					setConsumer: vi.fn((consumer) => {
						capturedConsumer = consumer;
					}),
				},
				writable: true,
			});

			const brokenFile = new File(["not-json"], "corrupted.nms", {
				type: "application/octet-stream",
			});

			renderHook(() => useFileHandling());

			await act(async () => {
				await capturedConsumer?.({
					files: [
						{
							getFile: vi.fn(async () => brokenFile),
						} as unknown as FileSystemFileHandle,
					],
				});
			});

			expect(mockShowError).toHaveBeenCalledWith(
				"toast.buildLoadError.title",
				expect.any(String),
				5000
			);
		});
	});
});
