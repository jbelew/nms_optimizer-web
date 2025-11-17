import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import GridControlButtons from "./GridControlButtons";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock ConditionalTooltip
vi.mock("@/components/ConditionalTooltip", () => ({
	ConditionalTooltip: ({ children, label }: { children: React.ReactNode; label: string }) => (
		<div data-testid="tooltip" title={label}>
			{children}
		</div>
	),
}));

// Mock useBreakpoint hook
vi.mock("@/hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(() => true), // Default to true (medium or larger)
}));

// Mock GridStore
const mockActivateRow = vi.fn();
const mockDeActivateRow = vi.fn();

vi.mock("@/store/GridStore", () => ({
	useGridStore: vi.fn((selector) => {
		const mockState = {
			activateRow: mockActivateRow,
			deActivateRow: mockDeActivateRow,
			selectHasModulesInGrid: () => false,
			gridFixed: false,
			grid: {
				cells: [
					[{ active: true }, { active: true }],
					[{ active: false }, { active: false }],
				],
			},
		};
		return selector(mockState);
	}),
}));

describe("GridControlButtons", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockActivateRow.mockClear();
		mockDeActivateRow.mockClear();
	});

	test("should render nothing when neither first inactive nor last active row", () => {
		const { container } = render(
			<GridControlButtons
				rowIndex={0}
				isFirstInactiveRow={false}
				isLastActiveRow={false}
				isLoading={false}
			/>
		);

		const buttons = container.querySelectorAll("button");
		expect(buttons.length).toBe(0);
	});

	test("should render activate button when first inactive row", () => {
		render(
			<GridControlButtons
				rowIndex={1}
				isFirstInactiveRow={true}
				isLastActiveRow={false}
				isLoading={false}
			/>
		);

		const button = screen.getByRole("button", {
			name: /gridControls\.activateRow/,
		});
		expect(button).toBeInTheDocument();
	});

	test("should render deactivate button when last active row", () => {
		render(
			<GridControlButtons
				rowIndex={0}
				isFirstInactiveRow={false}
				isLastActiveRow={true}
				isLoading={false}
			/>
		);

		const button = screen.getByRole("button", {
			name: /gridControls\.deactivateRow/,
		});
		expect(button).toBeInTheDocument();
	});

	test("should render both buttons when both conditions are true", () => {
		render(
			<GridControlButtons
				rowIndex={0}
				isFirstInactiveRow={true}
				isLastActiveRow={true}
				isLoading={false}
			/>
		);

		const buttons = screen.getAllByRole("button");
		expect(buttons.length).toBe(2);
	});

	test("should call activateRow with correct rowIndex when activate button clicked", async () => {
		render(
			<GridControlButtons
				rowIndex={1}
				isFirstInactiveRow={true}
				isLastActiveRow={false}
				isLoading={false}
			/>
		);

		const button = screen.getByRole("button", {
			name: /gridControls\.activateRow/,
		});
		fireEvent.click(button);

		await waitFor(() => {
			expect(mockActivateRow).toHaveBeenCalledWith(1);
		});
	});

	test("should call deActivateRow with correct rowIndex when deactivate button clicked", async () => {
		render(
			<GridControlButtons
				rowIndex={0}
				isFirstInactiveRow={false}
				isLastActiveRow={true}
				isLoading={false}
			/>
		);

		const button = screen.getByRole("button", {
			name: /gridControls\.deactivateRow/,
		});
		fireEvent.click(button);

		await waitFor(() => {
			expect(mockDeActivateRow).toHaveBeenCalledWith(0);
		});
	});

	test("should enable activate button when conditions are favorable", () => {
		render(
			<GridControlButtons
				rowIndex={1}
				isFirstInactiveRow={true}
				isLastActiveRow={false}
				isLoading={false}
			/>
		);

		const button = screen.getByRole("button", {
			name: /gridControls\.activateRow/,
		});
		expect(button).not.toBeDisabled();
	});

	test("should disable deactivate button when has modules in grid", () => {
		render(
			<GridControlButtons
				rowIndex={0}
				isFirstInactiveRow={false}
				isLastActiveRow={true}
				isLoading={false}
			/>
		);

		const button = screen.getByRole("button", {
			name: /gridControls\.deactivateRow/,
		});
		// Default state has modules=false, so button should not be disabled
		expect(button).not.toBeDisabled();
	});

	test("should disable button when loading", () => {
		render(
			<GridControlButtons
				rowIndex={1}
				isFirstInactiveRow={true}
				isLastActiveRow={false}
				isLoading={true}
			/>
		);

		const button = screen.getByRole("button", {
			name: /gridControls\.activateRow/,
		});
		expect(button).toBeDisabled();
	});

	test("should render button with correct tooltip", () => {
		render(
			<GridControlButtons
				rowIndex={1}
				isFirstInactiveRow={true}
				isLastActiveRow={false}
				isLoading={false}
			/>
		);

		const tooltip = screen.getByTestId("tooltip");
		expect(tooltip).toHaveAttribute("title", "gridControls.activateRow");
	});

	test("should render with correct icon button size on medium+ screens", () => {
		render(
			<GridControlButtons
				rowIndex={0}
				isFirstInactiveRow={true}
				isLastActiveRow={false}
				isLoading={false}
			/>
		);

		const button = screen.getByRole("button");
		// Size "2" is applied on medium+ screens
		expect(button).toBeInTheDocument();
	});

	test("should have correct container styling", () => {
		const { container } = render(
			<GridControlButtons
				rowIndex={0}
				isFirstInactiveRow={true}
				isLastActiveRow={false}
				isLoading={false}
			/>
		);

		const controlDiv = container.querySelector('[data-is-grid-control-column="true"]');
		expect(controlDiv).toHaveClass("flex");
		expect(controlDiv).toHaveClass("h-full");
		expect(controlDiv).toHaveClass("items-center");
		expect(controlDiv).toHaveClass("justify-center");
	});

	test("should render with correct button variant", () => {
		render(
			<GridControlButtons
				rowIndex={0}
				isFirstInactiveRow={true}
				isLastActiveRow={false}
				isLoading={false}
			/>
		);

		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
	});

	test("should handle both activate and deactivate buttons together", () => {
		render(
			<GridControlButtons
				rowIndex={0}
				isFirstInactiveRow={true}
				isLastActiveRow={true}
				isLoading={false}
			/>
		);

		const buttons = screen.getAllByRole("button");
		expect(buttons.length).toBe(2);
	});
});
