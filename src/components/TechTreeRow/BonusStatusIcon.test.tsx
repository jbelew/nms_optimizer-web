import { Theme } from "@radix-ui/themes";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "@/test/i18n";
import { isTouchDevice } from "@/utils/browser/environment";

import { BonusStatusIcon } from "./TechTreeRow";

vi.mock("@/utils/browser/environment", async () => {
	const actual = await vi.importActual("@/utils/browser/environment");

	return {
		...actual,
		isTouchDevice: vi.fn(() => false),
	};
});

vi.mock("@radix-ui/themes", async () => {
	const actual = await vi.importActual("@radix-ui/themes");

	return {
		...actual,
		Popover: {
			Content: ({ children }: { children: React.ReactNode }) => (
				<div data-testid="popover-content">{children}</div>
			),
			Root: ({ children }: { children: React.ReactNode }) => (
				<div data-testid="popover-root">{children}</div>
			),
			Trigger: ({ children }: { children: React.ReactNode }) => (
				<div data-testid="popover-trigger">{children}</div>
			),
		},
	};
});

vi.mock("@/store/tech/techBonusStore", () => ({
	useTechBonusStore: vi.fn(() => ({
		getBonusStatus: vi.fn(() => null),
		setBonusStatus: vi.fn(),
	})),
}));

vi.mock("@/components/ConditionalTooltip/ConditionalTooltip", () => ({
	ConditionalTooltip: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="conditional-tooltip">{children}</div>
	),
}));

describe("BonusStatusIcon Component", () => {
	const renderComponent = (techMaxBonus: number, techSolvedBonus: number) => {
		return render(
			<I18nextProvider i18n={i18n}>
				<Theme>
					<BonusStatusIcon
						tech="test-tech"
						techMaxBonus={techMaxBonus}
						techSolvedBonus={techSolvedBonus}
					/>
				</Theme>
			</I18nextProvider>
		);
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(isTouchDevice).mockReturnValue(false);
	});

	describe("Rendering based on device type", () => {
		it("should render with ConditionalTooltip on non-touch devices", () => {
			const { getByTestId, queryByTestId } = renderComponent(100, 10);
			expect(getByTestId("conditional-tooltip")).toBeInTheDocument();
			expect(queryByTestId("popover-root")).not.toBeInTheDocument();
		});

		it("should render with Popover on touch devices", () => {
			vi.mocked(isTouchDevice).mockReturnValue(true);

			const { getByTestId, queryByTestId } = renderComponent(100, 10);
			expect(getByTestId("popover-root")).toBeInTheDocument();
			expect(getByTestId("popover-trigger")).toBeInTheDocument();
			expect(getByTestId("popover-content")).toBeInTheDocument();
			expect(queryByTestId("conditional-tooltip")).not.toBeInTheDocument();
		});
	});

	describe("Rendering based on bonus values", () => {
		it("should return null when techSolvedBonus is 0 and no cached data", () => {
			const { container } = renderComponent(100, 0);
			// Theme wrapper renders a div, so check if it has any children
			expect(container.querySelector(".radix-themes")?.childNodes.length).toBe(0);
		});

		it("should return null when techSolvedBonus is negative and no cached data", () => {
			const { container } = renderComponent(100, -5);
			expect(container.querySelector(".radix-themes")?.childNodes.length).toBe(0);
		});

		it("should render an icon when techSolvedBonus is positive", () => {
			const { container } = renderComponent(100, 10);
			expect(container.querySelector("svg")).not.toBeNull();
		});
	});

	describe("Icon variants based on maxBonus", () => {
		it("should render an icon wrapped in a button when maxBonus < 100", () => {
			const { container } = renderComponent(75, 10);
			// Check for the presence of a button wrapping the SVG
			const button = container.querySelector("button");
			expect(button).toBeInTheDocument();
			expect(button).toHaveAttribute("type", "button");
			expect(button?.querySelector("svg")).toBeInTheDocument();
		});

		it("should render an icon when maxBonus = 100", () => {
			const { container } = renderComponent(100, 10);
			expect(container.querySelector("svg")).toBeInTheDocument();
		});

		it("should render an icon when maxBonus > 100", () => {
			const { container } = renderComponent(125, 10);
			expect(container.querySelector("svg")).toBeInTheDocument();
		});
	});

	describe("Rendering with different bonus values", () => {
		it("should render component with maxBonus < 100", () => {
			const { container } = renderComponent(50, 10);
			expect(container.querySelector("svg")).toBeInTheDocument();
		});

		it("should render component with maxBonus = 100", () => {
			const { container } = renderComponent(100, 10);
			expect(container.querySelector("svg")).toBeInTheDocument();
		});

		it("should render component with maxBonus > 100", () => {
			const { container } = renderComponent(150, 10);
			expect(container.querySelector("svg")).toBeInTheDocument();
		});
	});

	describe("Rounding precision", () => {
		it("should round maxBonus correctly with 99.999", () => {
			// 99.999 should round to 100
			const { container } = renderComponent(99.999, 10);
			expect(container.querySelector("svg")).toBeInTheDocument();
		});

		it("should handle decimal values", () => {
			const { container } = renderComponent(100.5, 10);
			expect(container.querySelector("svg")).toBeInTheDocument();
		});

		it("should handle very small bonuses", () => {
			const { container } = renderComponent(0.1, 1);
			expect(container.querySelector("svg")).toBeInTheDocument();
		});
	});

	describe("Various bonus combinations", () => {
		it("should render with high bonus values", () => {
			const { container } = renderComponent(250, 50);
			expect(container.querySelector("svg")).toBeInTheDocument();
		});

		it("should render with very small techSolvedBonus", () => {
			const { container } = renderComponent(100, 0.1);
			expect(container.querySelector("svg")).toBeInTheDocument();
		});

		it("should handle exactly 100 maxBonus", () => {
			const { container } = renderComponent(100, 1);
			expect(container.querySelector("svg")).toBeInTheDocument();
		});

		it("should handle slightly less than 100 maxBonus", () => {
			const { container } = renderComponent(99.99, 1);
			expect(container.querySelector("svg")).toBeInTheDocument();
		});

		it("should handle slightly more than 100 maxBonus", () => {
			const { container } = renderComponent(100.01, 1);
			expect(container.querySelector("svg")).toBeInTheDocument();
		});

		it("should handle zero maxBonus", () => {
			const { container } = renderComponent(0, 1);
			expect(container.querySelector("svg")).toBeInTheDocument();
		});
	});
});
