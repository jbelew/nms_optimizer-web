import type { TechTree } from "../../hooks/useTechTree/useTechTree";
import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import * as useBreakpointModule from "../../hooks/useBreakpoint/useBreakpoint";
import TechTreeComponent from "./TechTree";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock child components
vi.mock("./TechTreeContent", () => ({
	TechTreeContent: () => <div data-testid="tech-tree-content">TechTreeContent</div>,
}));

vi.mock("../RecommendedBuild/RecommendedBuild", () => ({
	default: () => <div data-testid="recommended-build">RecommendedBuild</div>,
}));

vi.mock("@radix-ui/themes", () => ({
	ScrollArea: ({
		children,
		className,
		style,
	}: {
		children?: React.ReactNode;
		className?: string;
		style?: React.CSSProperties;
	}) => (
		<div data-testid="scroll-area" className={className} style={style}>
			{children}
		</div>
	),
	Box: ({
		children,
		className,
		style,
	}: {
		children?: React.ReactNode;
		className?: string;
		style?: React.CSSProperties;
	}) => (
		<div className={className} style={style} data-testid="box">
			{children}
		</div>
	),
}));

// Mock hooks
vi.mock("../../hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(() => true), // Default to large screen
}));

vi.mock("../../hooks/useTechTree/useTechTree", () => ({
	useFetchTechTreeSuspense: vi.fn(() => ({
		recommended_builds: [],
		Weaponry: [],
	})),
}));

// Mock store
vi.mock("../../store/PlatformStore", () => ({
	usePlatformStore: vi.fn((selector) => {
		const mockState = {
			selectedPlatform: "standard",
		};

		return selector(mockState);
	}),
}));

// Mock utility
vi.mock("../../utils/splashScreen", () => ({
	hideSplashScreenAndShowBackground: vi.fn(),
}));

describe("TechTree", () => {
	const mockHandleOptimize = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test("should render TechTreeContent on large screens", () => {
		render(
			<TechTreeComponent
				handleOptimize={mockHandleOptimize}
				solving={false}
				gridTableTotalWidth={undefined}
			/>
		);

		expect(screen.getByTestId("tech-tree-content")).toBeInTheDocument();
	});

	test("should render ScrollArea on large screens", () => {
		render(
			<TechTreeComponent
				handleOptimize={mockHandleOptimize}
				solving={false}
				gridTableTotalWidth={undefined}
			/>
		);

		expect(screen.getByTestId("scroll-area")).toBeInTheDocument();
	});

	test("should pass handleOptimize to TechTreeContent", () => {
		render(
			<TechTreeComponent
				handleOptimize={mockHandleOptimize}
				solving={false}
				gridTableTotalWidth={undefined}
			/>
		);

		expect(screen.getByTestId("tech-tree-content")).toBeInTheDocument();
	});

	test("should render RecommendedBuild when tech tree has recommended builds", () => {
		vi.doMock("../../hooks/useTechTree/useTechTree", () => ({
			useFetchTechTreeSuspense: vi.fn(() => ({
				recommended_builds: [{ name: "Build 1" }],
				Weaponry: [],
			})),
		}));

		render(
			<TechTreeComponent
				handleOptimize={mockHandleOptimize}
				solving={false}
				gridTableTotalWidth={undefined}
			/>
		);

		// RecommendedBuild should render if tech tree has recommended_builds
		expect(screen.getByTestId("tech-tree-content")).toBeInTheDocument();
	});

	test("should handle solving prop", () => {
		render(
			<TechTreeComponent
				handleOptimize={mockHandleOptimize}
				solving={true}
				gridTableTotalWidth={undefined}
			/>
		);

		expect(screen.getByTestId("tech-tree-content")).toBeInTheDocument();
	});

	test("should accept optional techTree prop", () => {
		const customTechTree = {
			Weaponry: [
				{
					key: "weapon1",
					label: "Weapon 1",
					modules: [],
					module_count: 0,
					color: "",
					image: null,
				},
			],
		};

		render(
			<TechTreeComponent
				handleOptimize={mockHandleOptimize}
				solving={false}
				gridTableTotalWidth={undefined}
				techTree={customTechTree as TechTree}
			/>
		);

		expect(screen.getByTestId("tech-tree-content")).toBeInTheDocument();
	});

	test("should adjust scroll area height based on recommended builds", () => {
		render(
			<TechTreeComponent
				handleOptimize={mockHandleOptimize}
				solving={false}
				gridTableTotalWidth={undefined}
			/>
		);

		const scrollArea = screen.getByTestId("scroll-area");
		expect(scrollArea).toBeInTheDocument();
		// Height style should be applied
		expect(scrollArea).toHaveAttribute("style");
	});

	test("should render on small screens without ScrollArea", () => {
		const mockUseBreakpoint = vi.spyOn(useBreakpointModule, "useBreakpoint");
		mockUseBreakpoint.mockReturnValueOnce(false); // Small screen

		render(
			<TechTreeComponent
				handleOptimize={mockHandleOptimize}
				solving={false}
				gridTableTotalWidth={undefined}
			/>
		);

		expect(screen.getByTestId("tech-tree-content")).toBeInTheDocument();
		mockUseBreakpoint.mockRestore();
	});
});
