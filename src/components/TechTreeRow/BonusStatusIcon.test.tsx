import type { BonusStatusData } from "@/store/tech/techBonusStore";
import type { Mock } from "vitest";
import { Theme } from "@radix-ui/themes";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTechBonusStore } from "@/store/tech/techBonusStore";
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

// Mock the store properly with a mocked function for useTechBonusStore
vi.mock("@/store/tech/techBonusStore", () => ({
	useTechBonusStore: vi.fn(),
}));

vi.mock("@/components/ConditionalTooltip/ConditionalTooltip", () => ({
	ConditionalTooltip: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="conditional-tooltip">{children}</div>
	),
}));

describe("BonusStatusIcon Component", () => {
	const mockGetBonusStatus = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(isTouchDevice as Mock).mockReturnValue(false);
		(useTechBonusStore as unknown as Mock).mockReturnValue({
			getBonusStatus: mockGetBonusStatus,
		});
	});

	const renderComponent = (techSolvedBonus: number, status: BonusStatusData | null = null) => {
		mockGetBonusStatus.mockReturnValue(status);

		return render(
			<I18nextProvider i18n={i18n}>
				<Theme>
					<BonusStatusIcon tech="test-tech" techSolvedBonus={techSolvedBonus} />
				</Theme>
			</I18nextProvider>
		);
	};

	describe("Rendering based on device type", () => {
		it("should render with ConditionalTooltip on non-touch devices", () => {
			const status: BonusStatusData = { icon: "check", percent: 0 };
			const { getByTestId, queryByTestId } = renderComponent(10, status);
			expect(getByTestId("conditional-tooltip")).toBeInTheDocument();
			expect(queryByTestId("popover-root")).not.toBeInTheDocument();
		});

		it("should render with Popover on touch devices", () => {
			(isTouchDevice as Mock).mockReturnValue(true);
			const status: BonusStatusData = { icon: "check", percent: 0 };

			const { getByTestId, queryByTestId } = renderComponent(10, status);
			expect(getByTestId("popover-root")).toBeInTheDocument();
			expect(getByTestId("popover-trigger")).toBeInTheDocument();
			expect(getByTestId("popover-content")).toBeInTheDocument();
			expect(queryByTestId("conditional-tooltip")).not.toBeInTheDocument();
		});
	});

	describe("Rendering based on bonus values", () => {
		it("should return null when techSolvedBonus is 0 and no cached data", () => {
			const { container } = renderComponent(0, null);
			// Theme wrapper renders a div, so check if it has any children
			expect(container.querySelector(".radix-themes")?.childNodes.length).toBe(0);
		});

		it("should return null when techSolvedBonus is negative and no cached data", () => {
			const { container } = renderComponent(-5, null);
			expect(container.querySelector(".radix-themes")?.childNodes.length).toBe(0);
		});

		it("should render an icon when techSolvedBonus is positive and status exists", () => {
			const status: BonusStatusData = { icon: "check", percent: 0 };
			const { container } = renderComponent(10, status);
			expect(container.querySelector("svg")).not.toBeNull();
		});
	});

	describe("Icon variants based on status", () => {
		it("should render an icon wrapped in a button when status is warning", () => {
			const status: BonusStatusData = { icon: "warning", percent: 25 };
			const { container } = renderComponent(10, status);
			const button = container.querySelector("button");
			expect(button).toBeInTheDocument();
			expect(button?.querySelector("svg")).toBeInTheDocument();
		});

		it("should render an icon when status is check", () => {
			const status: BonusStatusData = { icon: "check", percent: 0 };
			const { container } = renderComponent(10, status);
			expect(container.querySelector("svg")).toBeInTheDocument();
		});

		it("should render an icon when status is lightning", () => {
			const status: BonusStatusData = { icon: "lightning", percent: 25 };
			const { container } = renderComponent(10, status);
			expect(container.querySelector("svg")).toBeInTheDocument();
		});
	});
});
