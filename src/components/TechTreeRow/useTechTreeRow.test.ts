import type { TechTreeRowProps } from "@/types/props";
import type { Mock } from "vitest";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";

import { useTechTreeRow } from "./useTechTreeRow";

vi.mock("@/hooks/useOptimize/useOptimize", () => ({
	useOptimize: vi.fn(() => ({
		clearPatternNoFitTech: vi.fn(),
		gridContainerRef: { current: null },
		handleForceCurrentPnfOptimize: vi.fn(),
		handleOptimize: vi.fn(),
		patternNoFitTech: null,
		solving: false,
	})),
}));

vi.mock("@/store/grid/gridStore");
vi.mock("@/store/tech/techStore");

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key, // Just return the key for simplicity
	}),
}));

const mockProps: TechTreeRowProps = {
	tech: "testTech",
	techColor: "blue",
	techImage: "test.webp",
};

describe("useTechTreeRow", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(useGridStore as unknown as Mock).mockImplementation(
			(selector: (state: Record<string, unknown>) => unknown) =>
				selector({
					activeTechs: new Set(),
					hasTechInGrid: vi.fn(() => false),
					isGridFull: false,
				})
		);
		(useTechStore as unknown as Mock).mockImplementation(
			(
				selector: (state: {
					checkedModules: { [key: string]: string[] };
					maxBonus: { [key: string]: number };
					solvedBonus: { [key: string]: number };
					techGroups: { [key: string]: [{ modules: unknown[] }] };
				}) => unknown
			) =>
				selector({
					checkedModules: { testTech: ["module1"] },
					maxBonus: {},
					solvedBonus: {},
					techGroups: { testTech: [{ modules: [] }] },
				})
		);
	});

	it("should return the correct data shape for TechTreeRow", () => {
		const { result } = renderHook(() => useTechTreeRow(mockProps));

		// Check for key properties to ensure the hook returns what TechTreeRow needs
		expect(result.current).toHaveProperty("hasTechInGrid");
		expect(result.current).toHaveProperty("translatedTechName");
		expect(result.current).toHaveProperty("handleOptimizeClick");
		expect(result.current.checkedModulesCount).toBe(1);
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
		const { rerender, result } = renderHook(
			({ props }: { props: TechTreeRowProps }) => useTechTreeRow(props),
			{ initialProps: { props: mockProps } }
		);

		const initialImagePath = result.current.imagePath;
		const initialTranslation = result.current.translatedTechName;

		// Re-render with identical props
		rerender({ props: { ...mockProps } });

		// Image paths and translation should remain the same (memoized)
		expect(result.current.imagePath).toBe(initialImagePath);
		expect(result.current.translatedTechName).toBe(initialTranslation);
	});

	it("should update image paths when techImage dependency changes", () => {
		const { rerender, result } = renderHook(
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
		const { result } = renderHook(() => useTechTreeRow(mockProps));

		expect(result.current.checkedModulesCount).toBe(1);
		expect(result.current.moduleCount).toBe(0); // No modules in the mocked tech group
	});

	it("should handle case when tech is not in tech store", () => {
		(useTechStore as unknown as Mock).mockImplementation(
			(
				selector: (state: {
					checkedModules: { [key: string]: string[] };
					maxBonus: { [key: string]: number };
					solvedBonus: { [key: string]: number };
					techGroups: { [key: string]: [{ modules: unknown[] }] };
				}) => unknown
			) =>
				selector({
					checkedModules: {},
					maxBonus: {},
					solvedBonus: {},
					techGroups: {}, // No testTech key
				})
		);

		const { result } = renderHook(() => useTechTreeRow(mockProps));

		// Should gracefully handle missing tech
		expect(result.current.checkedModulesCount).toBe(0);
		expect(result.current.moduleCount).toBe(0);
		expect(result.current.modules).toEqual([]);
	});

	it("should expose callbacks from child hooks", () => {
		const { result } = renderHook(() => useTechTreeRow(mockProps));

		// Callbacks should exist
		expect(typeof result.current.handleOptimizeClick).toBe("function");
		expect(typeof result.current.handleReset).toBe("function");
	});
});
