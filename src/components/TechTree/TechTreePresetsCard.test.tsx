import type { TechTree } from "@/hooks/useTechTree/useTechTree";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

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
						"recommended builds"
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

// Mock RecommendedBuildProvider
vi.mock("@/components/RecommendedBuild/RecommendedBuild", () => ({
	RecommendedBuildProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock useRecommendedBuildContext
const mockHandleApply = vi.fn();
const mockHandleOpenInstructions = vi.fn();
vi.mock("@/components/RecommendedBuild/useRecommendedBuildContext", () => ({
	RecommendedBuildContext: React.createContext(null),
	useRecommendedBuildContext: () => ({
		handleApply: mockHandleApply,
		handleOpenInstructions: mockHandleOpenInstructions,
		isLarge: true,
		techTree: {} as TechTree,
	}),
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

	test("should call handleApply when Apply Build button is clicked", () => {
		render(<TechTreePresetsCard techTree={mockTechTree} />);

		const applyButton = screen.getByRole("button", { name: /Apply Build/i });
		fireEvent.click(applyButton);

		expect(mockHandleApply).toHaveBeenCalledWith(mockBuilds[0]);
	});

	test("should call handleOpenInstructions when recommended builds link is clicked", () => {
		render(<TechTreePresetsCard techTree={mockTechTree} />);

		const link = screen.getByText("recommended builds");
		fireEvent.click(link);

		expect(mockHandleOpenInstructions).toHaveBeenCalled();
	});
});
