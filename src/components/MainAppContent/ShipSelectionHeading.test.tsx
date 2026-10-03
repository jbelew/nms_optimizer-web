import React from "react";
import { Theme } from "@radix-ui/themes";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useGridStore } from "@/store/grid/gridStore";

import { ShipSelectionHeading } from "./ShipSelectionHeading";
import * as useMainAppContext from "./useMainAppContext";

// Mock the contexts
vi.mock("./useMainAppContext", () => ({
	useMainAppGlobal: vi.fn(),
	useMainAppLayout: vi.fn(),
	useMainAppOptimization: vi.fn(),
}));

// Mock ShipSelection composite components to avoid unnecessary DOM dependencies
vi.mock("@/components/ShipSelection/ShipSelection", () => ({
	ShipSelectionContent: () => <div data-testid="ship-selection-content" />,
	ShipSelectionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ShipSelectionRoot: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ShipSelectionSkeleton: () => <div data-testid="ship-selection-skeleton" />,
	ShipSelectionTrigger: () => <div data-testid="ship-selection-trigger" />,
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, defaultOrOptions?: unknown) => {
			if (typeof defaultOrOptions === "string") {
				return defaultOrOptions;
			}

			if (key === "platformLabel") {
				return "Platform:";
			}

			if (key.startsWith("platforms.")) {
				return key.replace("platforms.", "");
			}

			if (key.startsWith("classes.")) {
				const tier = key.replace("classes.", "").toUpperCase();

				return `Class ${tier}`;
			}

			return key;
		},
	}),
}));

describe("ShipSelectionHeading", () => {
	let mockGlobalContext = {
		isSharedGrid: false,
		selectedShipType: "standard",
	};

	let mockLayoutContext = {
		gridTableTotalWidth: 800,
	};

	let mockOptimizationContext = {
		solving: false,
	};

	beforeEach(() => {
		mockGlobalContext = {
			isSharedGrid: false,
			selectedShipType: "standard",
		};
		mockLayoutContext = {
			gridTableTotalWidth: 800,
		};
		mockOptimizationContext = {
			solving: false,
		};

		vi.mocked(useMainAppContext.useMainAppGlobal).mockReturnValue(
			mockGlobalContext as unknown as ReturnType<typeof useMainAppContext.useMainAppGlobal>
		);
		vi.mocked(useMainAppContext.useMainAppLayout).mockReturnValue(
			mockLayoutContext as unknown as ReturnType<typeof useMainAppContext.useMainAppLayout>
		);
		vi.mocked(useMainAppContext.useMainAppOptimization).mockReturnValue(
			mockOptimizationContext as unknown as ReturnType<
				typeof useMainAppContext.useMainAppOptimization
			>
		);

		useGridStore.setState({ totalSuperchargedCells: 0 });
	});

	const renderComponent = () => {
		return render(
			<Theme>
				<ShipSelectionHeading />
			</Theme>
		);
	};

	describe("Dynamic Class Icon Rendering", () => {
		it("renders empty container with reserved space when totalSuperchargedCells is 0", () => {
			useGridStore.setState({ totalSuperchargedCells: 0 });
			renderComponent();

			const container = screen.getByTestId("class-badge-container");
			expect(container).toBeInTheDocument();
			expect(container).toHaveAttribute("aria-hidden", "true");
			expect(screen.queryByRole("img")).toBeNull();
		});

		it("renders Class C icon inside container when totalSuperchargedCells is 1", () => {
			useGridStore.setState({ totalSuperchargedCells: 1 });
			renderComponent();

			const container = screen.getByTestId("class-badge-container");
			expect(container).toBeInTheDocument();
			expect(container).toHaveAttribute("aria-hidden", "false");

			const img = screen.getByRole("img", { name: "Class C" });
			expect(img).toBeInTheDocument();
			expect(img).toHaveAttribute(
				"src",
				`/assets/img/class_icons/class-c.webp?v=${__APP_VERSION__}`
			);
			expect(img).toHaveAttribute(
				"srcSet",
				`/assets/img/class_icons/class-c@2x.webp?v=${__APP_VERSION__} 2x`
			);
		});

		it("renders Class B icon when totalSuperchargedCells is 2", () => {
			useGridStore.setState({ totalSuperchargedCells: 2 });
			renderComponent();

			const img = screen.getByRole("img", { name: "Class B" });
			expect(img).toBeInTheDocument();
			expect(img).toHaveAttribute(
				"src",
				`/assets/img/class_icons/class-b.webp?v=${__APP_VERSION__}`
			);
			expect(img).toHaveAttribute(
				"srcSet",
				`/assets/img/class_icons/class-b@2x.webp?v=${__APP_VERSION__} 2x`
			);
		});

		it("renders Class A icon when totalSuperchargedCells is 3", () => {
			useGridStore.setState({ totalSuperchargedCells: 3 });
			renderComponent();

			const img = screen.getByRole("img", { name: "Class A" });
			expect(img).toBeInTheDocument();
			expect(img).toHaveAttribute(
				"src",
				`/assets/img/class_icons/class-a.webp?v=${__APP_VERSION__}`
			);
			expect(img).toHaveAttribute(
				"srcSet",
				`/assets/img/class_icons/class-a@2x.webp?v=${__APP_VERSION__} 2x`
			);
		});

		it("renders Class S icon when totalSuperchargedCells is 4", () => {
			useGridStore.setState({ totalSuperchargedCells: 4 });
			renderComponent();

			const img = screen.getByRole("img", { name: "Class S" });
			expect(img).toBeInTheDocument();
			expect(img).toHaveAttribute(
				"src",
				`/assets/img/class_icons/class-s.webp?v=${__APP_VERSION__}`
			);
			expect(img).toHaveAttribute(
				"srcSet",
				`/assets/img/class_icons/class-s@2x.webp?v=${__APP_VERSION__} 2x`
			);
		});
	});

	describe("Platform Type Exclusions", () => {
		const excludedPlatformTypes = [
			"exosuit",
			"colossus",
			"minotaur",
			"nautilon",
			"nomad",
			"pilgrim",
			"roamer",
		];

		excludedPlatformTypes.forEach((platform) => {
			it(`does not render class icon or container for excluded platform: ${platform} even with 4 supercharged slots`, () => {
				mockGlobalContext.selectedShipType = platform;
				useGridStore.setState({ totalSuperchargedCells: 4 });

				renderComponent();

				expect(screen.queryByTestId("class-badge-container")).toBeNull();
				expect(screen.queryByRole("img")).toBeNull();
			});
		});

		it("renders class icon for other non-starship platform types like multi-tool, freighter, corvette", () => {
			const eligiblePlatforms = ["standard-mt", "atlantid", "freighter", "corvette"];

			eligiblePlatforms.forEach((platform) => {
				mockGlobalContext.selectedShipType = platform;
				useGridStore.setState({ totalSuperchargedCells: 4 });

				const { unmount } = renderComponent();

				const img = screen.getByRole("img", { name: "Class S" });
				expect(img).toBeInTheDocument();
				unmount();
			});
		});
	});

	describe("Solving Opacity", () => {
		it("applies full opacity to class icon when not solving", () => {
			mockOptimizationContext.solving = false;
			useGridStore.setState({ totalSuperchargedCells: 4 });

			renderComponent();

			const img = screen.getByRole("img", { name: "Class S" });
			expect(img).toHaveStyle({ opacity: "1" });
		});

		it("applies dimmed opacity to class icon when solving", () => {
			mockOptimizationContext.solving = true;
			useGridStore.setState({ totalSuperchargedCells: 4 });

			renderComponent();

			const img = screen.getByRole("img", { name: "Class S" });
			expect(img).toHaveStyle({ opacity: "0.365" });
		});
	});
});
