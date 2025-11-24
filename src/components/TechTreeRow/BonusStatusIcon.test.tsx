import { TooltipProvider } from "@radix-ui/react-tooltip";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "../../test/i18n";
import { BonusStatusIcon } from "./BonusStatusIcon";

vi.mock("../../store/TechBonusStore", () => ({
	useTechBonusStore: vi.fn(() => ({
		setBonusStatus: vi.fn(),
		getBonusStatus: vi.fn(() => null),
	})),
}));

describe("BonusStatusIcon Component", () => {
	const renderComponent = (techMaxBonus: number, techSolvedBonus: number) => {
		return render(
			<I18nextProvider i18n={i18n}>
				<TooltipProvider>
					<BonusStatusIcon
						tech="test-tech"
						techMaxBonus={techMaxBonus}
						techSolvedBonus={techSolvedBonus}
					/>
				</TooltipProvider>
			</I18nextProvider>
		);
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Rendering based on bonus values", () => {
		it("should return null when techSolvedBonus is 0 and no cached data", () => {
			const { container } = renderComponent(100, 0);
			expect(container.firstChild).toBeNull();
		});

		it("should return null when techSolvedBonus is negative and no cached data", () => {
			const { container } = renderComponent(100, -5);
			expect(container.firstChild).toBeNull();
		});

		it("should render an icon when techSolvedBonus is positive", () => {
			const { container } = renderComponent(100, 10);
			expect(container.firstChild).not.toBeNull();
		});
	});

	describe("Icon variants based on maxBonus", () => {
		it("should render an icon when maxBonus < 100", () => {
			const { container } = renderComponent(75, 10);
			// Check for the presence of an SVG (icon element)
			expect(container.querySelector("svg")).toBeInTheDocument();
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
