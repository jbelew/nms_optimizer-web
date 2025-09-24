import { renderHook } from "@testing-library/react";
import { Mock, describe, expect, it, vi } from "vitest";

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
	})),
}));

vi.mock("./useTechOptimization", () => ({
	useTechOptimization: vi.fn(() => ({
		handleOptimizeClick: vi.fn(),
		handleReset: vi.fn(),
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
	selectedShipType: "hauler",
	techColor: "blue",
};

import { useGridStore } from "@/store/GridStore";
import { useTechStore } from "@/store/TechStore";

describe("useTechTreeRow", () => {
	beforeEach(() => {
		(useGridStore as unknown as Mock).mockReturnValue(vi.fn());
		(useTechStore as unknown as Mock).mockReturnValue({
			techGroups: { testTech: [{ modules: [] }] },
			activeGroups: {},
			setActiveGroup: vi.fn(),
			max_bonus: {},
			solved_bonus: {},
			checkedModules: {},
			setCheckedModules: vi.fn(),
		});
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
		expect(result.current.imagePath).toBe("/assets/img/tech/test.webp");
		expect(result.current.imagePath2x).toBe("/assets/img/tech/test@2x.webp");
	});

	it("should use fallback image when techImage is null", () => {
		const { result } = renderHook(() =>
			useTechTreeRow({ ...mockProps, techImage: null })
		);
		expect(result.current.imagePath).toBe("/assets/img/tech/infra.webp");
		expect(result.current.imagePath2x).toBe("/assets/img/tech/infra@2x.webp");
	});
});
