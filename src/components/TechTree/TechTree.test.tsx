import type { TechTree } from "@/hooks/useTechTree/useTechTree";
import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import * as useBreakpointModule from "@/hooks/useBreakpoint/useBreakpoint";
import { useFetchTechTreeSuspense } from "@/hooks/useTechTree/useTechTree";
import { usePlatformStore } from "@/store/app/platformStore";

import { TechTree as TechTreeComponent } from "./TechTree";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock("./TechTreePresetsCard", () => ({
	TechTreePresetsCard: () => <div data-testid="tech-tree-presets-card">Presets Card</div>,
}));

vi.mock("@/components/TechTreeRow/TechTreeRow", () => ({
	TechTreeRow: ({ tech }: { tech: string }) => (
		<div data-testid={`tech-tree-row-${tech}`}>Row: {tech}</div>
	),
}));

vi.mock("@/components/ModuleSelectionDialog/ModuleSelectionDialog", () => ({
	ModuleSelectionDialog: () => <div data-testid="module-selection-dialog" />,
}));

vi.mock("@radix-ui/themes", async (importOriginal) => {
	const actual = await importOriginal<Record<string, unknown>>();

	return {
		...actual,
		Box: ({
			children,
			className,
			style,
		}: {
			children?: React.ReactNode;
			className?: string;
			style?: React.CSSProperties;
		}) => (
			<div className={className} data-testid="box" style={style}>
				{children}
			</div>
		),
		ScrollArea: React.forwardRef<
			HTMLDivElement,
			{
				children?: React.ReactNode;
				className?: string;
				style?: React.CSSProperties;
			}
		>(({ children, className, style }, ref) => (
			<div className={className} data-testid="scroll-area" ref={ref} style={style}>
				{children}
			</div>
		)),
		Separator: () => <div data-testid="separator">Separator</div>,
	};
});

vi.mock("@/hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(() => true),
}));

vi.mock("@/hooks/useTechTree/useTechTree", () => ({
	useFetchTechTreeSuspense: vi.fn(() => ({
		recommended_builds: [],
		Weaponry: [],
	})),
}));

vi.mock("@/store/app/platformStore", () => ({
	usePlatformStore: vi.fn(),
}));

describe("TechTree", () => {
	const mockTechTree = {
		grid: {},
		grid_definition: {},
		recommended_builds: [],
		Utilities: [
			{
				color: "blue",
				image: null,
				key: "util1",
				label: "Utility 1",
				module_count: 0,
				modules: [],
			},
		],
		Weaponry: [
			{
				color: "red",
				image: null,
				key: "weapon2",
				label: "Zulu Weapon",
				module_count: 0,
				modules: [],
			},
			{
				color: "blue",
				image: null,
				key: "weapon1",
				label: "Alpha Weapon",
				module_count: 0,
				modules: [],
			},
		],
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useBreakpointModule.useBreakpoint).mockReturnValue(true);
		vi.mocked(usePlatformStore).mockImplementation((selector) =>
			selector({ selectedPlatform: "standard" } as never)
		);
		vi.mocked(useFetchTechTreeSuspense).mockReturnValue(mockTechTree as unknown as TechTree);
	});

	afterEach(() => {
		vi.resetAllMocks();
		vi.restoreAllMocks();
	});

	test("should render ScrollArea on desktop viewports (>= 1024px)", () => {
		render(<TechTreeComponent />);

		const scrollArea = screen.getByTestId("scroll-area");
		expect(scrollArea).toBeInTheDocument();
		expect(scrollArea).toHaveAttribute("style");
		expect(screen.queryByTestId("box")).not.toBeInTheDocument();
	});

	test("should render Box on mobile viewports (< 1024px) without ScrollArea", () => {
		vi.mocked(useBreakpointModule.useBreakpoint).mockReturnValue(false);

		render(<TechTreeComponent />);

		expect(screen.queryByTestId("scroll-area")).not.toBeInTheDocument();
		expect(screen.getByTestId("box")).toBeInTheDocument();
	});

	test("should reset ScrollArea scroll position to top when selectedPlatform changes on desktop", () => {
		const scrollToSpy = vi
			.spyOn(HTMLElement.prototype, "scrollTo")
			.mockImplementation(() => {});

		let currentPlatform = "standard";
		vi.mocked(usePlatformStore).mockImplementation((selector) =>
			selector({ selectedPlatform: currentPlatform } as never)
		);

		const { rerender } = render(<TechTreeComponent />);

		const scrollArea = screen.getByTestId("scroll-area");
		scrollArea.scrollTop = 250;

		expect(scrollToSpy).not.toHaveBeenCalled();

		currentPlatform = "corvette";
		rerender(<TechTreeComponent />);

		expect(scrollToSpy).toHaveBeenCalledWith({ top: 0 });
		expect(scrollArea.scrollTop).toBe(0);
	});

	test("should not attempt to scroll when selectedPlatform changes on mobile", () => {
		vi.mocked(useBreakpointModule.useBreakpoint).mockReturnValue(false);
		const scrollToSpy = vi
			.spyOn(HTMLElement.prototype, "scrollTo")
			.mockImplementation(() => {});

		let currentPlatform = "standard";
		vi.mocked(usePlatformStore).mockImplementation((selector) =>
			selector({ selectedPlatform: currentPlatform } as never)
		);

		const { rerender } = render(<TechTreeComponent />);

		currentPlatform = "freighter";
		rerender(<TechTreeComponent />);

		expect(scrollToSpy).not.toHaveBeenCalled();
	});

	test("should filter out metadata keys, sort sections and rows alphabetically, and render TechTreePresetsCard", () => {
		render(<TechTreeComponent />);

		expect(screen.getByTestId("tech-tree-presets-card")).toBeInTheDocument();
		expect(screen.getByText("techTree.categories.Utilities")).toBeInTheDocument();
		expect(screen.getByText("techTree.categories.Weaponry")).toBeInTheDocument();
		expect(screen.queryByText("techTree.categories.grid")).not.toBeInTheDocument();
		expect(screen.queryByText("techTree.categories.grid_definition")).not.toBeInTheDocument();
		expect(
			screen.queryByText("techTree.categories.recommended_builds")
		).not.toBeInTheDocument();

		const rows = screen.getAllByTestId(/^tech-tree-row-/);
		expect(rows.map((r) => r.getAttribute("data-testid"))).toEqual([
			"tech-tree-row-util1",
			"tech-tree-row-weapon1",
			"tech-tree-row-weapon2",
		]);
	});

	test("should filter out malformed technology entries and render EmptyState when no valid sections exist", () => {
		const malformedOnly: unknown = {
			grid: {},
			recommended_builds: [],
		};

		render(<TechTreeComponent techTree={malformedOnly as TechTree} />);

		expect(screen.getByText("No Technologies Found")).toBeInTheDocument();
	});

	test("should render valid entries while ignoring malformed items in a section array", () => {
		const mixedTechTree: unknown = {
			Weaponry: [
				{
					color: "red",
					image: null,
					key: "weapon1",
					label: "Weapon 1",
					module_count: 0,
					modules: [],
				},
				"invalid_entry",
				null,
			],
		};

		render(<TechTreeComponent techTree={mixedTechTree as TechTree} />);

		expect(screen.getByTestId("tech-tree-row-weapon1")).toBeInTheDocument();
	});

	test("should render retina section header icons for known sections and omit image for unknown sections", () => {
		const customTree: unknown = {
			Hyperdrive: [],
			UnknownSection: [],
			Weaponry: [],
		};

		const { container } = render(<TechTreeComponent techTree={customTree as TechTree} />);

		const weaponryImg = container.querySelector(
			`img[src="/assets/img/sidebar/weaponry.webp?v=${__APP_VERSION__}"]`
		);
		expect(weaponryImg).toBeInTheDocument();
		expect(weaponryImg).toHaveAttribute("alt", "Weaponry");
		expect(weaponryImg).toHaveAttribute(
			"srcSet",
			`/assets/img/sidebar/weaponry@2x.webp?v=${__APP_VERSION__} 2x`
		);
		expect(weaponryImg).toHaveAttribute("width", "36");
		expect(weaponryImg).toHaveAttribute("height", "24");

		const hyperdriveImg = container.querySelector(
			`img[src="/assets/img/sidebar/hyperdrive.webp?v=${__APP_VERSION__}"]`
		);
		expect(hyperdriveImg).toBeInTheDocument();

		const allImages = container.querySelectorAll("img");
		expect(allImages).toHaveLength(2);
	});

	test("should apply mt-4 lg:mt-0 when recommended_builds is empty and omit when present", () => {
		const { container, rerender } = render(<TechTreeComponent />);

		const contentDiv = container.querySelector(".tech-tree-content");
		expect(contentDiv).toHaveClass("mt-4", "lg:mt-0");

		const withPresets: unknown = {
			...mockTechTree,
			recommended_builds: [{ layout: [], title: "Preset 1" }],
		};
		rerender(<TechTreeComponent techTree={withPresets as TechTree} />);

		expect(container.querySelector(".tech-tree-content")).not.toHaveClass("mt-4");
		expect(container.querySelector(".tech-tree-content")).not.toHaveClass("lg:mt-0");
	});
});
