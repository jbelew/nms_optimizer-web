/// <reference types="@testing-library/jest-dom" />

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useGridStore } from "../../store/GridStore";
// Import the component after mocks are defined
import GridCell from "./GridCell";
import { useGridCellInteraction } from "./useGridCellInteraction";

let mockCellState = {
	active: false,
	supercharged: false,
	module: "some-module",
	image: "some-image.webp",
	label: "My Module",
	adjacency_bonus: 1,
	tech: "some-tech",
};

// Mock the GridStore and its actions
vi.mock("../../store/GridStore", () => ({
	useGridStore: vi.fn(),
}));

// Mock the useGridCellInteraction hook
vi.mock("./useGridCellInteraction", () => ({
	useGridCellInteraction: vi.fn(),
}));

vi.mock("../../store/ShakeStore", () => ({
	useShakeStore: vi.fn(() => ({
		setShaking: vi.fn(),
	})),
}));

vi.mock("../../store/TechStore", () => ({
	useTechStore: vi.fn((selector) => selector({ getTechColor: vi.fn(() => "blue") })),
}));

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key, options) => options?.defaultValue || key,
	}),
}));

// Explicitly mock the Tooltip component from @radix-ui/themes
vi.mock("@radix-ui/themes", () => ({
	Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, // Render children directly
}));

describe("GridCell", () => {
	const mockToggleCellSupercharged = vi.fn();
	const mockToggleCellActive = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		// Reset mock state for each test
		mockCellState = {
			active: false,
			supercharged: false,
			module: "some-module",
			image: "some-image.webp",
			label: "My Module",
			adjacency_bonus: 1,
			tech: "some-tech",
		};

		// Mock useGridStore to return a specific cell state and actions
		(useGridStore as unknown as vi.Mock).mockImplementation((selector) => {
			const state = {
				grid: { cells: [[mockCellState]] },
				toggleCellSupercharged: mockToggleCellSupercharged,
				toggleCellActive: mockToggleCellActive,
			};
			return selector(state);
		});

		// Mock useGridCellInteraction to return dummy handlers
		(useGridCellInteraction as unknown as vi.Mock).mockImplementation(
			(cell, rowIndex, columnIndex, isSharedGrid) => ({
				isTouching: false,
				handleClick: (event: React.MouseEvent) => {
					if (isSharedGrid) return;
					if (event.ctrlKey) {
						mockToggleCellActive(rowIndex, columnIndex);
					} else if (cell.active) {
						mockToggleCellSupercharged(rowIndex, columnIndex);
					}
				},
				handleContextMenu: vi.fn(),
				handleKeyDown: vi.fn(),
				handleTouchStart: vi.fn(),
				handleTouchEnd: vi.fn(),
			})
		);
	});

	const renderComponent = (cellOverrides = {}, props = {}) => {
		// Mutate mockCellState with overrides before rendering
		Object.assign(mockCellState, cellOverrides);

		return render(<GridCell rowIndex={0} columnIndex={0} isSharedGrid={false} {...props} />);
	};

	it("renders correctly", () => {
		renderComponent();
		expect(screen.getByRole("gridcell")).toBeInTheDocument();
	});

	it("toggles supercharged on click", async () => {
		renderComponent({ active: true });
		const user = userEvent.setup();

		// Mock the handleClick from useGridCellInteraction to call the actual toggle function
		(useGridCellInteraction as unknown as vi.Mock).mockReturnValue({
			isTouching: false,
			handleClick: () => mockToggleCellSupercharged(0, 0),
			handleContextMenu: vi.fn(),
			handleKeyDown: vi.fn(),
			handleTouchStart: vi.fn(),
			handleTouchEnd: vi.fn(),
		});

		await user.click(screen.getByRole("gridcell"));

		expect(mockToggleCellSupercharged).toHaveBeenCalledWith(0, 0);
	});

	it("toggles active on ctrl+click", async () => {
		renderComponent();
		const user = userEvent.setup();

		// Mock the handleClick from useGridCellInteraction to call the actual toggle function
		(useGridCellInteraction as unknown as vi.Mock).mockReturnValue({
			isTouching: false,
			handleClick: (event: React.MouseEvent) => {
				if (event.ctrlKey) {
					mockToggleCellActive(0, 0);
				}
			},
			handleContextMenu: vi.fn(),
			handleKeyDown: vi.fn(),
			handleTouchStart: vi.fn(),
			handleTouchEnd: vi.fn(),
		});

		await user.keyboard("{Control>}");
		await user.click(screen.getByRole("gridcell"));
		await user.keyboard("{/Control}");

		expect(mockToggleCellActive).toHaveBeenCalledWith(0, 0);
	});

	it("does not toggle when grid is shared", async () => {
		renderComponent({}, { isSharedGrid: true });
		const user = userEvent.setup();

		// Mock the handleClick from useGridCellInteraction to do nothing
		(useGridCellInteraction as unknown as vi.Mock).mockReturnValue({
			isTouching: false,
			handleClick: vi.fn(),
			handleContextMenu: vi.fn(),
			handleKeyDown: vi.fn(),
			handleTouchStart: vi.fn(),
			handleTouchEnd: vi.fn(),
		});

		await user.click(screen.getByRole("gridcell"));

		expect(mockToggleCellActive).not.toHaveBeenCalled();
		expect(mockToggleCellSupercharged).not.toHaveBeenCalled();
	});

	it("renders upgrade priority label when applicable", () => {
		renderComponent({ label: "Upgrade sigma" });
		expect(screen.getByText("3")).toBeInTheDocument();
	});

	it("renders corner elements when not supercharged", () => {
		renderComponent({ supercharged: false });
		const cellElement = screen.getByRole("gridcell");
		expect(cellElement.querySelector(".corner.top-left")).toBeInTheDocument();
	});

	it("does not render corner elements when supercharged", () => {
		renderComponent({ supercharged: true });
		const cellElement = screen.getByRole("gridcell");
		expect(cellElement.querySelector(".corner.top-left")).not.toBeInTheDocument();
	});
});
