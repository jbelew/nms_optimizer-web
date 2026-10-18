import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { TechTree } from "@/hooks/useTechTree/useTechTree";
import { sessionCoordinator } from "@/store/sessionCoordinator";

import { TechTreePresetsCard } from "./TechTreePresetsCard";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	Trans: ({
		components,
		i18nKey,
	}: {
		components?: Record<string, React.ReactNode>;
		i18nKey?: string;
	}) => {
		if (components && components[5]) {
			return (
				<span>
					Platforms include{" "}
					{React.cloneElement(
						components[5] as React.ReactElement,
						{},
						"recommended builds",
					)}
				</span>
			);
		}

		return <span>{i18nKey}</span>;
	},
	useTranslation: () => ({
		t: (_key: string, fallback?: string) => fallback || _key,
	}),
}));

const mockScrollIntoView = vi.fn();
vi.mock("@/hooks/useScrollGridIntoView/useScrollGridIntoView", () => ({
	useScrollGridIntoView: () => ({
		gridContainerRef: { current: null },
		scrollIntoView: mockScrollIntoView,
	}),
}));

vi.mock("@/hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(() => false),
}));

const mockSendEvent = vi.fn();
vi.mock("@/hooks/useAnalytics/useAnalytics", () => ({
	useAnalytics: () => ({
		sendEvent: mockSendEvent,
	}),
}));

const mockOpenDialog = vi.fn();
vi.mock("@/utils/system/dialogUtils", () => ({
	useDialog: () => ({
		openDialog: mockOpenDialog,
	}),
}));

vi.mock("@/store/app/platformStore", () => ({
	usePlatformStore: (selector: (state: { selectedPlatform: string }) => unknown) =>
		selector({ selectedPlatform: "exosuit" }),
}));

describe("TechTreePresetsCard", () => {
	const mockBuilds = [
		{
			description: "Optimal setup",
			layout: [
				[{ module: "MOD_1" }, { module: "MOD_2" }],
				[{ module: null }, { module: "MOD_3" }],
			],
			title: "Alpha Preset",
		},
	];

	const mockTechTree: TechTree = {
		recommended_builds: mockBuilds,
		Utilities: [],
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("should return null if recommended_builds is empty", () => {
		const emptyTechTree: TechTree = {
			recommended_builds: [],
			Utilities: [],
		};

		const { container } = render(<TechTreePresetsCard techTree={emptyTechTree} />);
		expect(container.firstChild).toBeNull();
	});

	test("should return null if recommended_builds is undefined", () => {
		const undefinedBuildsTechTree: TechTree = {
			Utilities: [],
		};

		const { container } = render(<TechTreePresetsCard techTree={undefinedBuildsTechTree} />);
		expect(container.firstChild).toBeNull();
	});

	test("should render card with title and builds when recommended_builds exist", () => {
		render(<TechTreePresetsCard techTree={mockTechTree} />);

		expect(screen.getByText("Recommended Builds")).toBeInTheDocument();
		expect(screen.getByText("Alpha Preset")).toBeInTheDocument();
		expect(screen.getByText("x3")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Apply Build/i })).toBeInTheDocument();
	});

	test("should apply recommended build via sessionCoordinator, scroll on mobile, and send analytics event when Apply Build button is clicked", async () => {
		const applySpy = vi
			.spyOn(sessionCoordinator, "applyRecommendedBuild")
			.mockReturnValue(true);

		render(<TechTreePresetsCard techTree={mockTechTree} />);

		const applyButton = screen.getByRole("button", { name: /Apply Build/i });
		fireEvent.click(applyButton);

		await waitFor(() => {
			expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
			expect(applySpy).toHaveBeenCalledWith(mockBuilds[0], mockTechTree);
			expect(mockSendEvent).toHaveBeenCalledWith({
				action: "apply_build",
				build: "Alpha Preset",
				category: "build",
				nonInteraction: false,
				platform: "exosuit",
				value: 1,
			});
		});

		applySpy.mockRestore();
	});

	test("should open instructions dialog when recommended builds link is clicked", () => {
		render(<TechTreePresetsCard techTree={mockTechTree} />);

		const link = screen.getByText("recommended builds");
		fireEvent.click(link);

		expect(mockOpenDialog).toHaveBeenCalledWith("instructions", { section: "section-6" });
	});
});
