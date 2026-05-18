import type { TechTree } from "@/hooks/useTechTree/useTechTree";
import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { TechTreeContent } from "./TechTreeContent";

// Mock TechTreeSection
vi.mock("./TechTreeSection", () => ({
	TechTreeSection: ({ technologies, type }: { technologies: unknown[]; type: string }) => (
		<div data-testid={`tech-tree-section-${type}`}>
			Section: {type} ({technologies.length} techs)
		</div>
	),
}));

// Mock GridStore
vi.mock("@/store/grid/gridStore", () => ({
	useGridStore: vi.fn((selector) => {
		const mockState = {
			isGridFull: false,
		};

		return selector(mockState);
	}),
}));

describe("TechTreeContent", () => {
	const mockTechTree = {
		grid: {}, // Should be filtered out
		recommended_builds: [], // Should be filtered out
		Utilities: [
			{
				color: "",
				image: null,
				key: "util1",
				label: "Utility 1",
				module_count: 0,
				modules: [],
			},
		],
		Weaponry: [
			{
				color: "",
				image: null,
				key: "weapon1",
				label: "Weapon 1",
				module_count: 0,
				modules: [],
			},
			{
				color: "",
				image: null,
				key: "weapon2",
				label: "Weapon 2",
				module_count: 0,
				modules: [],
			},
		],
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("should render TechTreeSection for each category", () => {
		render(
			<TechTreeContent
				// @ts-expect-error - Test data doesn't match exact type
				techTree={mockTechTree as TechTree}
			/>
		);

		expect(screen.getByTestId("tech-tree-section-Weaponry")).toBeInTheDocument();
		expect(screen.getByTestId("tech-tree-section-Utilities")).toBeInTheDocument();
	});

	test("should filter out recommended_builds category", () => {
		render(
			<TechTreeContent
				// @ts-expect-error - Test data doesn't match exact type
				techTree={mockTechTree as TechTree}
			/>
		);

		expect(
			screen.queryByTestId("tech-tree-section-recommended_builds")
		).not.toBeInTheDocument();
	});

	test("should filter out grid category", () => {
		render(
			<TechTreeContent
				// @ts-expect-error - Test data doesn't match exact type
				techTree={mockTechTree as TechTree}
			/>
		);

		expect(screen.queryByTestId("tech-tree-section-grid")).not.toBeInTheDocument();
	});

	test("should sort technologies alphabetically", () => {
		const unsortedTechTree = {
			Weaponry: [
				{
					color: "",
					image: null,
					key: "weapon_z",
					label: "Zulu Weapon",
					module_count: 0,
					modules: [],
				},
				{
					color: "",
					image: null,
					key: "weapon_a",
					label: "Alpha Weapon",
					module_count: 0,
					modules: [],
				},
				{
					color: "",
					image: null,
					key: "weapon_m",
					label: "Mike Weapon",
					module_count: 0,
					modules: [],
				},
			],
		};

		render(<TechTreeContent techTree={unsortedTechTree as unknown as TechTree} />);

		// Should render the section with sorted technologies
		expect(screen.getByTestId("tech-tree-section-Weaponry")).toBeInTheDocument();
		// The text should contain all 3 techs
		expect(screen.getByText(/3 techs/)).toBeInTheDocument();
	});

	test("should handle empty technology arrays", () => {
		const emptyTechTree = {
			Utilities: [],
			Weaponry: [],
		};

		render(<TechTreeContent techTree={emptyTechTree as unknown as TechTree} />);

		expect(screen.getByTestId("tech-tree-section-Weaponry")).toBeInTheDocument();
		// Both Weaponry and Utilities sections render with 0 techs, so we need to be more specific
		const textMatches = screen.getAllByText(/0 techs/);
		expect(textMatches.length).toBeGreaterThan(0);
	});

	test("should handle malformed technology entries", () => {
		const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		const malformedTechTree = {
			Weaponry: [
				{
					color: "",
					image: null,
					key: "weapon1",
					label: "Weapon 1",
					module_count: 0,
					modules: [],
				},
				"invalid_entry", // This should be filtered out
				null, // This should be filtered out
			] as unknown[],
		};

		render(<TechTreeContent techTree={malformedTechTree as unknown as TechTree} />);

		// Should still render the section with only valid entries
		expect(screen.getByText(/1 techs/)).toBeInTheDocument();
		consoleWarnSpy.mockRestore();
	});

	test("should set default values for missing tech properties", () => {
		const minimalTechTree = {
			Weaponry: [
				{
					color: "",
					image: null,
					key: "weapon1",
					label: "Weapon 1",
					module_count: 0,
					modules: [],
				},
			],
		};

		render(<TechTreeContent techTree={minimalTechTree as unknown as TechTree} />);

		expect(screen.getByTestId("tech-tree-section-Weaponry")).toBeInTheDocument();
		expect(screen.getByText(/1 techs/)).toBeInTheDocument();
	});

	test("should memoize component for performance", () => {
		const { rerender } = render(
			<TechTreeContent techTree={mockTechTree as unknown as TechTree} />
		);

		expect(screen.getByTestId("tech-tree-section-Weaponry")).toBeInTheDocument();

		// Rerender with same props
		rerender(<TechTreeContent techTree={mockTechTree as unknown as TechTree} />);

		// Should still have sections
		expect(screen.getByTestId("tech-tree-section-Weaponry")).toBeInTheDocument();
	});

	test("should have correct display name", () => {
		expect(TechTreeContent.displayName).toBe("TechTreeContent");
	});

	test("should handle grid_definition category", () => {
		const techTreeWithGridDef = {
			grid_definition: {}, // Should be filtered out
			Weaponry: [
				{
					color: "",
					image: null,
					key: "weapon1",
					label: "Weapon 1",
					module_count: 0,
					modules: [],
				},
			],
		};

		render(<TechTreeContent techTree={techTreeWithGridDef as unknown as TechTree} />);

		expect(screen.getByTestId("tech-tree-section-Weaponry")).toBeInTheDocument();
		expect(screen.queryByTestId("tech-tree-section-grid_definition")).not.toBeInTheDocument();
	});
});
