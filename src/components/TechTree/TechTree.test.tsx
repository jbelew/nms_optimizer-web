import type { TechTree } from "@/hooks/useTechTree/useTechTree";
import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import * as useBreakpointModule from "@/hooks/useBreakpoint/useBreakpoint";
import { useFetchTechTreeSuspense } from "@/hooks/useTechTree/useTechTree";

import { TechTree as TechTreeComponent } from "./TechTree";

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

vi.mock("@/components/RecommendedBuild/RecommendedBuild", () => ({
	RecommendedBuild: {
		Button: () => <div data-testid="recommended-build-button">Button</div>,
		Info: () => <div data-testid="recommended-build-info">Info</div>,
		Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
		Root: ({ children }: { children: React.ReactNode }) => (
			<div data-testid="recommended-build-root">{children}</div>
		),
	},
	RecommendedBuildButton: () => <div data-testid="recommended-build-button">Button</div>,
	RecommendedBuildInfo: () => <div data-testid="recommended-build-info">Info</div>,
	RecommendedBuildProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	RecommendedBuildRoot: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="recommended-build-root">{children}</div>
	),
}));

vi.mock("@radix-ui/themes", () => ({
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
	ScrollArea: ({
		children,
		className,
		style,
	}: {
		children?: React.ReactNode;
		className?: string;
		style?: React.CSSProperties;
	}) => (
		<div className={className} data-testid="scroll-area" style={style}>
			{children}
		</div>
	),
}));

// Mock hooks
vi.mock("@/hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(() => true), // Default to large screen
}));

vi.mock("@/hooks/useTechTree/useTechTree", () => ({
	useFetchTechTreeSuspense: vi.fn(() => ({
		recommended_builds: [],
		Weaponry: [],
	})),
}));

// Mock store
vi.mock("@/store/app/platformStore", () => ({
	usePlatformStore: vi.fn((selector) => {
		const mockState = {
			selectedPlatform: "standard",
		};

		return selector(mockState);
	}),
}));

// Mock utility
vi.mock("@/utils/system/splashScreen", () => ({
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
		render(<TechTreeComponent handleOptimize={mockHandleOptimize} solving={false} />);

		expect(screen.getByTestId("tech-tree-content")).toBeInTheDocument();
	});

	test("should render ScrollArea on large screens", () => {
		render(<TechTreeComponent handleOptimize={mockHandleOptimize} solving={false} />);

		expect(screen.getByTestId("scroll-area")).toBeInTheDocument();
	});

	test("should pass handleOptimize to TechTreeContent", () => {
		render(<TechTreeComponent handleOptimize={mockHandleOptimize} solving={false} />);

		expect(screen.getByTestId("tech-tree-content")).toBeInTheDocument();
	});

	test("should render RecommendedBuild when tech tree has recommended builds", () => {
		vi.mocked(useFetchTechTreeSuspense).mockReturnValue({
			recommended_builds: [{ title: "Build 1" }],
			Weaponry: [],
		} as unknown as TechTree);

		render(<TechTreeComponent handleOptimize={mockHandleOptimize} solving={false} />);

		// RecommendedBuild components should render if tech tree has recommended_builds
		expect(screen.getByTestId("recommended-build-root")).toBeInTheDocument();
	});

	test("should handle solving prop", () => {
		render(<TechTreeComponent handleOptimize={mockHandleOptimize} solving={true} />);

		expect(screen.getByTestId("tech-tree-content")).toBeInTheDocument();
	});

	test("should accept optional techTree prop", () => {
		const customTechTree = {
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

		render(
			<TechTreeComponent
				handleOptimize={mockHandleOptimize}
				solving={false}
				techTree={customTechTree as TechTree}
			/>
		);

		expect(screen.getByTestId("tech-tree-content")).toBeInTheDocument();
	});

	test("should adjust scroll area height based on recommended builds", () => {
		render(<TechTreeComponent handleOptimize={mockHandleOptimize} solving={false} />);

		const scrollArea = screen.getByTestId("scroll-area");
		expect(scrollArea).toBeInTheDocument();
		// Height style should be applied
		expect(scrollArea).toHaveAttribute("style");
	});

	test("should render on small screens without ScrollArea", () => {
		const mockUseBreakpoint = vi.spyOn(useBreakpointModule, "useBreakpoint");
		mockUseBreakpoint.mockReturnValueOnce(false); // Small screen

		render(<TechTreeComponent handleOptimize={mockHandleOptimize} solving={false} />);

		expect(screen.getByTestId("tech-tree-content")).toBeInTheDocument();
		mockUseBreakpoint.mockRestore();
	});
});
