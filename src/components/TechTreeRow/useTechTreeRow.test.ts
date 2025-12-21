import { renderHook } from "@testing-library/react";
import { describe, expect, it, Mock, vi } from "vitest";

import { useGridStore } from "@/store/GridStore";
import { useTechStore } from "@/store/TechStore";

import { TechTreeRowProps } from "./TechTreeRow";
import { useTechTreeRow } from "./useTechTreeRow";

// Mock child hooks and stores
vi.mock("./useTechModuleManagement", () => ({
	useTechModuleManagement: vi.fn(() => ({
		currentCheckedModules: ["module1"],
		groupedModules: {},
		allModulesSelected: false,
		isIndeterminate: true,
		handleValueChange: vi.fn(),
		handleSelectAllChange: vi.fn(),
		handleAllCheckboxesChange: vi.fn(),
	})),
}));

vi.mock("./useTechOptimization", () => ({
	useTechOptimization: vi.fn(() => ({
		handleOptimizeClick: vi.fn(),
		handleReset: vi.fn(),
		isResetting: false,
	})),
}));

vi.mock("@/store/GridStore");
vi.mock("@/store/TechStore");

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key, // Just return the key for simplicity
	}),
}));

const mockProps: TechTreeRowProps = {
	tech: "testTech",
	handleOptimize: vi.fn(),
	solving: false,
	techImage: "test.webp",
	isGridFull: false,
	techColor: "blue",
};

describe("useTechTreeRow", () => {
	beforeEach(() => {
		(useGridStore as unknown as Mock).mockImplementation(
			(selector: (state: { hasTechInGrid: (tech: string) => boolean }) => unknown) =>
				selector({ hasTechInGrid: vi.fn(() => false) })
		);
		(useTechStore as unknown as Mock).mockImplementation(
			(
				selector: (state: {
					techGroups: { [key: string]: [{ modules: unknown[] }] };
					max_bonus: { [key: string]: number };
					solved_bonus: { [key: string]: number };
				}) => unknown
			) =>
				selector({
					techGroups: { testTech: [{ modules: [] }] },
					max_bonus: {},
					solved_bonus: {},
				})
		);
	});

	it("should return the correct data shape", () => {
		const { result } = renderHook(() => useTechTreeRow(mockProps));

		// Check for some key properties to ensure the hook is returning what's expected
		expect(result.current).toHaveProperty("hasTechInGrid");
		expect(result.current).toHaveProperty("translatedTechName");
		expect(result.current).toHaveProperty("handleOptimizeClick");
		expect(result.current).toHaveProperty("currentCheckedModules");
		expect(result.current.techColor).toBe("blue");
	});

	it("should calculate translatedTechName correctly", () => {
		const { result } = renderHook(() => useTechTreeRow(mockProps));
		expect(result.current.translatedTechName).toBe("technologies.test");
	});

	it("should construct image paths correctly", () => {
		const { result } = renderHook(() => useTechTreeRow(mockProps));
		expect(result.current.imagePath).toBe(`/assets/img/tech/test.webp?v=${__APP_VERSION__}`);
		expect(result.current.imagePath2x).toBe(
			`/assets/img/tech/test@2x.webp?v=${__APP_VERSION__}`
		);
	});

	it("should use fallback image when techImage is null", () => {
		const { result } = renderHook(() => useTechTreeRow({ ...mockProps, techImage: null }));
		expect(result.current.imagePath).toBe(`/assets/img/tech/infra.webp?v=${__APP_VERSION__}`);
		expect(result.current.imagePath2x).toBe(
			`/assets/img/tech/infra@2x.webp?v=${__APP_VERSION__}`
		);
	});

	it("should memoize image paths and translation (no recalculation on non-dependency changes)", () => {
		const { result, rerender } = renderHook(
			({ props }: { props: TechTreeRowProps }) => useTechTreeRow(props),
			{ initialProps: { props: mockProps } }
		);

		const initialImagePath = result.current.imagePath;
		const initialTranslation = result.current.translatedTechName;

		// Change a non-dependency prop (solving)
		rerender({ props: { ...mockProps, solving: true } });

		// Image paths and translation should remain the same (memoized)
		expect(result.current.imagePath).toBe(initialImagePath);
		expect(result.current.translatedTechName).toBe(initialTranslation);
	});

	it("should update image paths when techImage dependency changes", () => {
		const { result, rerender } = renderHook(
			({ props }: { props: TechTreeRowProps }) => useTechTreeRow(props),
			{ initialProps: { props: mockProps } }
		);

		expect(result.current.imagePath).toBe(`/assets/img/tech/test.webp?v=${__APP_VERSION__}`);

		// Change techImage
		rerender({ props: { ...mockProps, techImage: "different.webp" } });

		// Image paths should be updated
		expect(result.current.imagePath).toBe(
			`/assets/img/tech/different.webp?v=${__APP_VERSION__}`
		);
	});

	it("should handle empty modules array", () => {
		// The mock returns ["module1"] by default, so we're testing that the data flows through
		const { result } = renderHook(() => useTechTreeRow(mockProps));

		// Should pass through the mocked module data
		expect(result.current.currentCheckedModules).toEqual(["module1"]);
		expect(result.current.moduleCount).toBe(0); // No modules in the mocked tech group
	});

	it("should handle case when tech is not in tech store", () => {
		(useTechStore as unknown as Mock).mockImplementation(
			(
				selector: (state: {
					techGroups: { [key: string]: [{ modules: unknown[] }] };
					max_bonus: { [key: string]: number };
					solved_bonus: { [key: string]: number };
				}) => unknown
			) =>
				selector({
					techGroups: {}, // No testTech key
					max_bonus: {},
					solved_bonus: {},
				})
		);

		const { result } = renderHook(() => useTechTreeRow(mockProps));

		// Should gracefully handle missing tech
		expect(result.current.moduleCount).toBe(0);
		expect(result.current.modules).toEqual([]);
	});

	it("should expose callbacks from child hooks", () => {
		const { result } = renderHook(() => useTechTreeRow(mockProps));

		// Callbacks should exist
		expect(typeof result.current.handleOptimizeClick).toBe("function");
		expect(typeof result.current.handleReset).toBe("function");
		expect(typeof result.current.handleValueChange).toBe("function");
		expect(typeof result.current.handleSelectAllChange).toBe("function");
		expect(typeof result.current.handleAllCheckboxesChange).toBe("function");
	});
});
