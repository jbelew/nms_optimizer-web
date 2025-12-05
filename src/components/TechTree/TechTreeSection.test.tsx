import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { TechTreeSection } from "./TechTreeSection";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock Radix UI
vi.mock("@radix-ui/themes", () => ({
	Separator: () => <div data-testid="separator">Separator</div>,
}));

// Mock TechTreeRow
vi.mock("../TechTreeRow/TechTreeRow", () => ({
	TechTreeRow: ({ tech }: { tech: string; handleOptimize?: unknown }) => (
		<div data-testid={`tech-tree-row-${tech}`}>Row: {tech}</div>
	),
}));

describe("TechTreeSection", () => {
	const mockHandleOptimize = vi.fn();
	const mockTechnologies: Array<{
		key: string;
		label: string;
		color: "red" | "blue";
		image: null;
		modules: [];
		module_count: number;
	}> = [
		{
			key: "weapon1",
			label: "Weapon 1",
			color: "red",
			image: null,
			modules: [],
			module_count: 0,
		},
		{
			key: "weapon2",
			label: "Weapon 2",
			color: "blue",
			image: null,
			modules: [],
			module_count: 0,
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("should render section with correct type", () => {
		render(
			<TechTreeSection
				type="Weaponry"
				technologies={mockTechnologies}
				handleOptimize={mockHandleOptimize}
				solving={false}
				isGridFull={false}
				index={0}
			/>
		);

		// The text gets converted to uppercase
		expect(screen.getByText("TECHTREE.CATEGORIES.WEAPONRY")).toBeInTheDocument();
	});

	test("should render TechTreeRow for each technology", () => {
		render(
			<TechTreeSection
				type="Weaponry"
				technologies={mockTechnologies}
				handleOptimize={mockHandleOptimize}
				solving={false}
				isGridFull={false}
				index={0}
			/>
		);

		expect(screen.getByTestId("tech-tree-row-weapon1")).toBeInTheDocument();
		expect(screen.getByTestId("tech-tree-row-weapon2")).toBeInTheDocument();
	});

	test("should render separator", () => {
		render(
			<TechTreeSection
				type="Weaponry"
				technologies={mockTechnologies}
				handleOptimize={mockHandleOptimize}
				solving={false}
				isGridFull={false}
				index={0}
			/>
		);

		expect(screen.getByTestId("separator")).toBeInTheDocument();
	});

	test("should render section image when available", () => {
		const { container } = render(
			<TechTreeSection
				type="Weaponry"
				technologies={mockTechnologies}
				handleOptimize={mockHandleOptimize}
				solving={false}
				isGridFull={false}
				index={0}
			/>
		);

		const img = container.querySelector('img[src="/assets/img/sidebar/weaponry.webp"]');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute("alt", "Weaponry");
	});

	test("should not render image for unknown types", () => {
		const { container } = render(
			<TechTreeSection
				type="UnknownType"
				technologies={mockTechnologies}
				handleOptimize={mockHandleOptimize}
				solving={false}
				isGridFull={false}
				index={0}
			/>
		);

		const images = container.querySelectorAll("img");
		expect(images.length).toBe(0);
	});

	test("should pass solving prop to TechTreeRow", () => {
		render(
			<TechTreeSection
				type="Weaponry"
				technologies={mockTechnologies}
				handleOptimize={mockHandleOptimize}
				solving={true}
				isGridFull={false}
				index={0}
			/>
		);

		expect(screen.getByTestId("tech-tree-row-weapon1")).toBeInTheDocument();
	});

	test("should pass isGridFull prop to TechTreeRow", () => {
		render(
			<TechTreeSection
				type="Weaponry"
				technologies={mockTechnologies}
				handleOptimize={mockHandleOptimize}
				solving={false}
				isGridFull={true}
				index={0}
			/>
		);

		expect(screen.getByTestId("tech-tree-row-weapon1")).toBeInTheDocument();
	});

	test("should handle different technology types", () => {
		const typeTests = [
			{ type: "Hyperdrive", image: "hyperdrive.webp" },
			{ type: "Mining", image: "mining.webp" },
			{ type: "Scanners", image: "scanners.webp" },
		];

		typeTests.forEach(({ type, image }) => {
			const { container } = render(
				<TechTreeSection
					type={type}
					technologies={mockTechnologies}
					handleOptimize={mockHandleOptimize}
					solving={false}
					isGridFull={false}
					index={0}
				/>
			);

			const img = container.querySelector(`img[src="/assets/img/sidebar/${image}"]`);
			expect(img).toBeInTheDocument();
		});
	});

	test("should render section with correct CSS classes", () => {
		const { container } = render(
			<TechTreeSection
				type="Weaponry"
				technologies={mockTechnologies}
				handleOptimize={mockHandleOptimize}
				solving={false}
				isGridFull={false}
				index={0}
			/>
		);

		const section = container.querySelector(".sidebar__section");
		expect(section).toBeInTheDocument();
		expect(section).toHaveClass("mb-6");
	});

	test("should render heading with correct styling", () => {
		const { container } = render(
			<TechTreeSection
				type="Weaponry"
				technologies={mockTechnologies}
				handleOptimize={mockHandleOptimize}
				solving={false}
				isGridFull={false}
				index={0}
			/>
		);

		const heading = container.querySelector("h2");
		expect(heading).toBeInTheDocument();
		expect(heading).toHaveClass("heading-styled");
		expect(heading).toHaveClass("text-xl");
	});

	test("should handle empty technologies array", () => {
		render(
			<TechTreeSection
				type="Weaponry"
				technologies={[]}
				handleOptimize={mockHandleOptimize}
				solving={false}
				isGridFull={false}
				index={0}
			/>
		);

		expect(screen.getByText("TECHTREE.CATEGORIES.WEAPONRY")).toBeInTheDocument();
		expect(screen.queryByTestId(/tech-tree-row/)).not.toBeInTheDocument();
	});

	test("should memoize component for performance", () => {
		const { rerender } = render(
			<TechTreeSection
				type="Weaponry"
				technologies={mockTechnologies}
				handleOptimize={mockHandleOptimize}
				solving={false}
				isGridFull={false}
				index={0}
			/>
		);

		expect(screen.getByTestId("tech-tree-row-weapon1")).toBeInTheDocument();

		// Rerender with same props
		rerender(
			<TechTreeSection
				type="Weaponry"
				technologies={mockTechnologies}
				handleOptimize={mockHandleOptimize}
				solving={false}
				isGridFull={false}
				index={0}
			/>
		);

		expect(screen.getByTestId("tech-tree-row-weapon1")).toBeInTheDocument();
	});

	test("should have correct display name", () => {
		expect(TechTreeSection.displayName).toBe("TechTreeSection");
	});

	test("should include image srcSet for retina displays", () => {
		const { container } = render(
			<TechTreeSection
				type="Weaponry"
				technologies={mockTechnologies}
				handleOptimize={mockHandleOptimize}
				solving={false}
				isGridFull={false}
				index={0}
			/>
		);

		const img = container.querySelector("img");
		expect(img).toHaveAttribute("srcSet", "/assets/img/sidebar/weaponry@2x.webp 2x");
	});

	test("should apply correct image dimensions", () => {
		const { container } = render(
			<TechTreeSection
				type="Weaponry"
				technologies={mockTechnologies}
				handleOptimize={mockHandleOptimize}
				solving={false}
				isGridFull={false}
				index={0}
			/>
		);

		const img = container.querySelector("img");
		expect(img).toHaveClass("h-[24]");
		expect(img).toHaveClass("w-[36]");
		expect(img).toHaveClass("opacity-35");
	});
});
