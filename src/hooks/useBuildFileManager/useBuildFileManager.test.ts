import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildSerializer } from "@/utils/build/buildSerializer";

import { useBuildFileManager } from "./useBuildFileManager";

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

			const clickSpy = vi
				.spyOn(HTMLAnchorElement.prototype, "click")
				.mockImplementation(() => {});
			const appendChildSpy = vi.spyOn(document.body, "appendChild");
			const removeChildSpy = vi.spyOn(document.body, "removeChild");

			const { result } = renderHook(() => useBuildFileManager());
			await result.current.saveBuildToFile(buildName);

			// Assert serialization delegation
			expect(buildSerializer.saveBuild).toHaveBeenCalledWith(buildName);

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

		it("should propagate errors thrown by the serializer", async () => {
			const serializerError = new Error("Serialization error");
			vi.mocked(buildSerializer.saveBuild).mockRejectedValueOnce(serializerError);

			const { result } = renderHook(() => useBuildFileManager());

			await expect(result.current.saveBuildToFile("Fail Build")).rejects.toThrow(
				"Failed to save build file"
			);
		});
	});

	describe("loadBuildFromFile", () => {
		it("should delegate validation and state restoration to buildSerializer", async () => {
			const mockFile = new File(["{}"], "test.nms", { type: "application/octet-stream" });
			vi.mocked(buildSerializer.loadBuild).mockResolvedValueOnce();

			const { result } = renderHook(() => useBuildFileManager());
			await result.current.loadBuildFromFile(mockFile);

			// Assert delegation to serializer with valid ship types resolved from the hook
			expect(buildSerializer.loadBuild).toHaveBeenCalledWith(mockFile, [
				"explorer",
				"fighter",
				"freighter",
				"shuttle",
			]);
		});

		it("should propagate errors thrown by the serializer", async () => {
			const mockFile = new File(["{}"], "test.nms", { type: "application/octet-stream" });
			const serializerError = new Error("Validation failed");
			vi.mocked(buildSerializer.loadBuild).mockRejectedValueOnce(serializerError);

			const { result } = renderHook(() => useBuildFileManager());

			await expect(result.current.loadBuildFromFile(mockFile)).rejects.toThrow(
				"Validation failed"
			);
		});
	});
});
