/// <reference types="@testing-library/jest-dom" />

import type { Cell } from "@/store/grid/gridStore";
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createEmptyCell, createGrid } from "@/store/grid/gridFactories";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";

import GridCell from "./GridCell";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: Record<string, unknown>) => {
			switch (key) {
				case "gridTable.cellAriaLabel":
					return `Row ${options?.row}, Column ${options?.col}: ${options?.content}`;
				case "gridTable.disabledSlot":
					return "Disabled Slot";
				case "gridTable.disabledSuperchargedSlot":
					return "Disabled Slot (Supercharged)";
				case "gridTable.emptySlot":
					return "Empty Slot";
				case "gridTable.superchargedSlot":
					return "Empty Slot (Supercharged)";
				case "gridTable.superchargedWithContent":
					return `${options?.content} (Supercharged)`;
				default:
					return (options?.defaultValue as string) ?? key;
			}
		},
	}),
}));

vi.mock("@radix-ui/themes", () => ({
	Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("GridCell", () => {
	const setCellState = (rowIndex: number, columnIndex: number, overrides: Partial<Cell>) => {
		act(() => {
			useGridStore.setState((state) => {
				Object.assign(state.grid.cells[rowIndex][columnIndex], overrides);
			});
		});
	};

	beforeEach(() => {
		vi.clearAllMocks();
		act(() => {
			useGridStore.getState().resetGrid();
			useGridStore.setState({
				grid: createGrid(10, 6),
				gridFixed: false,
				isSharedGrid: false,
				result: null,
				superchargedFixed: false,
			});
			useTechStore.setState({
				techColors: {},
			});
		});
	});

	it("should be wrapped in React.memo for performance", () => {
		expect(GridCell).toHaveProperty("$$typeof", Symbol.for("react.memo"));
	});

	describe("WAI-ARIA labels and slot states", () => {
		it("renders descriptive aria-label and id for an active empty slot", () => {
			setCellState(0, 0, { active: true, label: "", module: null, supercharged: false });
			render(<GridCell columnIndex={0} rowIndex={0} />);

			const cellElement = screen.getByRole("gridcell");
			expect(cellElement).toHaveAttribute("id", "grid-cell-0-0");
			expect(cellElement).toHaveAttribute("aria-colindex", "1");
			expect(cellElement).toHaveAttribute("aria-label", "Row 1, Column 1: Empty Slot");
		});

		it("renders descriptive aria-label for an active supercharged empty slot", () => {
			setCellState(1, 2, { active: true, label: "", module: null, supercharged: true });
			render(<GridCell columnIndex={2} rowIndex={1} />);

			expect(screen.getByRole("gridcell")).toHaveAttribute(
				"aria-label",
				"Row 2, Column 3: Empty Slot (Supercharged)"
			);
		});

		it("renders descriptive aria-label for an active module slot", () => {
			setCellState(0, 4, {
				active: true,
				label: "Deflector Shield",
				module: "shield-1",
				supercharged: false,
			});
			render(<GridCell columnIndex={4} rowIndex={0} />);

			expect(screen.getByRole("gridcell")).toHaveAttribute(
				"aria-label",
				"Row 1, Column 5: Deflector Shield"
			);
		});

		it("strips bracketed metadata from module label and appends supercharged tag", () => {
			setCellState(2, 3, {
				active: true,
				label: "Photon Cannon [Sigma] (Tech)",
				module: "photon-1",
				supercharged: true,
			});
			render(<GridCell columnIndex={3} rowIndex={2} />);

			expect(screen.getByRole("gridcell")).toHaveAttribute(
				"aria-label",
				"Row 3, Column 4: Photon Cannon (Supercharged)"
			);
		});

		it("announces disabled slot in aria-label when cell is inactive", () => {
			setCellState(4, 1, { active: false, label: "", module: null, supercharged: false });
			render(<GridCell columnIndex={1} rowIndex={4} />);

			const cellElement = screen.getByRole("gridcell");
			expect(cellElement).not.toHaveAttribute("aria-disabled");
			expect(cellElement).toHaveAttribute("aria-label", "Row 5, Column 2: Disabled Slot");
		});

		it("announces disabled supercharged slot in aria-label when inactive and supercharged", () => {
			setCellState(5, 9, { active: false, label: "", module: null, supercharged: true });
			render(<GridCell columnIndex={9} rowIndex={5} />);

			expect(screen.getByRole("gridcell")).toHaveAttribute(
				"aria-label",
				"Row 6, Column 10: Disabled Slot (Supercharged)"
			);
		});
	});

	describe("Module Rank Order badge rendering", () => {
		it.each([
			["Salvaged Theta Module", "S1"],
			["Salvaged Tau Module", "S2"],
			["Salvaged Sigma Module", "S3"],
			["Forbidden Theta Module", "F1"],
			["Forbidden Tau Module", "F2"],
			["Forbidden Sigma Module", "F3"],
			["Reactor Theta Module", "R1"],
			["Reactor Tau Module", "R2"],
			["Reactor Sigma Module", "R3"],
			["Theta Booster", "C1"],
			["Tau Array", "C2"],
			["Sigma Ion Barrier", "C3"],
			["Theta Upgrade", "1"],
			["Tau Upgrade", "2"],
			["Sigma Upgrade", "3"],
			["salvaged theta", "S1"],
			["SALVAGED THETA", "S1"],
			["Salvaged Forbidden Reactor Theta", "S1"],
			["Forbidden Reactor Tau", "F2"],
		])("renders %s with Module Rank Order badge '%s'", (label, expectedBadge) => {
			setCellState(0, 0, {
				active: true,
				image: "module.webp",
				label,
				module: "mod-1",
			});
			render(<GridCell columnIndex={0} rowIndex={0} />);

			const badge = screen.getByText(expectedBadge);
			expect(badge).toBeInTheDocument();

			if (expectedBadge.length > 1) {
				expect(badge).toHaveClass("gridCell__label--corvette");
			}
		});

		it.each([["Pulse Drive"], ["Hazard Protection"], ["Regular Theta Module"], [""]])(
			"does not render a Module Rank Order badge for '%s'",
			(label) => {
				setCellState(0, 0, {
					active: true,
					image: "module.webp",
					label,
					module: "mod-1",
				});
				render(<GridCell columnIndex={0} rowIndex={0} />);

				expect(
					screen.getByRole("gridcell").querySelector(".gridCell__label")
				).not.toBeInTheDocument();
			}
		);
	});

	describe("Visual styling, corners, and tech accent colors", () => {
		it("renders corner elements when not supercharged and no image is present", () => {
			setCellState(0, 0, { active: false, image: null, supercharged: false });
			render(<GridCell columnIndex={0} rowIndex={0} />);

			const cellElement = screen.getByRole("gridcell");
			expect(cellElement.querySelector(".corner.top-left")).toBeInTheDocument();
		});

		it("does not render corner elements when an image is present or cell is supercharged", () => {
			setCellState(0, 0, { active: false, image: "some-image.webp", supercharged: false });
			const { rerender } = render(<GridCell columnIndex={0} rowIndex={0} />);
			expect(
				screen.getByRole("gridcell").querySelector(".corner.top-left")
			).not.toBeInTheDocument();

			setCellState(0, 0, { active: false, image: null, supercharged: true });
			rerender(<GridCell columnIndex={0} rowIndex={0} />);
			expect(
				screen.getByRole("gridcell").querySelector(".corner.top-left")
			).not.toBeInTheDocument();
		});

		it("applies tech accent color from useTechStore or falls back to purple when supercharged", () => {
			setCellState(0, 0, {
				active: true,
				image: "hyper.webp",
				module: "hyper-1",
				supercharged: true,
				tech: "hyperdrive",
			});
			const { rerender } = render(<GridCell columnIndex={0} rowIndex={0} />);
			expect(screen.getByRole("gridcell")).toHaveAttribute("data-accent-color", "purple");
			expect(screen.getByRole("gridcell")).toHaveClass(
				"gridCell--supercharged",
				"gridCell--glow"
			);

			act(() => {
				useTechStore.setState({ techColors: { hyperdrive: "blue" } });
			});
			rerender(<GridCell columnIndex={0} rowIndex={0} />);
			expect(screen.getByRole("gridcell")).toHaveAttribute("data-accent-color", "blue");

			setCellState(0, 0, {
				active: true,
				adjacency_bonus: 0,
				group_adjacent: false,
				image: "hyper.webp",
				module: "hyper-1",
				supercharged: false,
			});
			rerender(<GridCell columnIndex={0} rowIndex={0} />);
			expect(screen.getByRole("gridcell")).toHaveClass("gridCell--black");
		});
	});

	describe("Mouse, touch, and keyboard slot interactions", () => {
		it("toggles cell supercharged state on normal click, active state on Ctrl+Click, and prevents context menu", () => {
			setCellState(0, 0, {
				...createEmptyCell(false, true),
			});
			render(<GridCell columnIndex={0} rowIndex={0} />);
			const cellElement = screen.getByRole("gridcell");

			expect(fireEvent.contextMenu(cellElement)).toBe(false);

			fireEvent.click(cellElement);
			expect(useGridStore.getState().grid.cells[0][0].supercharged).toBe(true);

			fireEvent.click(cellElement, { ctrlKey: true });
			expect(useGridStore.getState().grid.cells[0][0].active).toBe(false);
			expect(useGridStore.getState().grid.cells[0][0].supercharged).toBe(false);
		});

		it("toggles active state on Space/Enter and supercharged state on s/S/Shift+Enter", () => {
			setCellState(0, 0, createEmptyCell(false, false));
			render(<GridCell columnIndex={0} rowIndex={0} />);
			const cellElement = screen.getByRole("gridcell");

			fireEvent.keyDown(cellElement, { key: " " });
			expect(useGridStore.getState().grid.cells[0][0].active).toBe(true);

			fireEvent.keyDown(cellElement, { key: "s" });
			expect(useGridStore.getState().grid.cells[0][0].supercharged).toBe(true);

			fireEvent.keyDown(cellElement, { key: "S", shiftKey: true });
			expect(useGridStore.getState().grid.cells[0][0].supercharged).toBe(false);

			fireEvent.keyDown(cellElement, { key: "Enter", shiftKey: true });
			expect(useGridStore.getState().grid.cells[0][0].supercharged).toBe(true);

			fireEvent.keyDown(cellElement, { key: "Enter" });
			expect(useGridStore.getState().grid.cells[0][0].active).toBe(false);
		});

		it("does not hijack browser shortcuts like Ctrl+S or Cmd+S", () => {
			setCellState(0, 0, createEmptyCell(false, true));
			render(<GridCell columnIndex={0} rowIndex={0} />);
			const cellElement = screen.getByRole("gridcell");

			const notCancelled = fireEvent.keyDown(cellElement, { ctrlKey: true, key: "s" });
			expect(notCancelled).toBe(true);
			expect(useGridStore.getState().grid.cells[0][0].supercharged).toBe(false);
		});

		it("handles touch tap vs scroll or multi-touch gesture and updates gridCell--touched class", () => {
			setCellState(0, 0, createEmptyCell(false, false));
			render(<GridCell columnIndex={0} rowIndex={0} />);
			const cellElement = screen.getByRole("gridcell");

			fireEvent.touchStart(cellElement, { touches: [{ clientX: 10, clientY: 10 }] });
			expect(cellElement).toHaveClass("gridCell--touched");

			fireEvent.touchCancel(cellElement);
			expect(cellElement).not.toHaveClass("gridCell--touched");

			// Multi-touch pinch/zoom gesture (>1 touch) should be ignored
			fireEvent.touchStart(cellElement, {
				touches: [
					{ clientX: 0, clientY: 0 },
					{ clientX: 10, clientY: 10 },
				],
			});
			fireEvent.touchEnd(cellElement);
			expect(useGridStore.getState().grid.cells[0][0].active).toBe(false);

			// Scroll gesture (>10px) should be ignored
			fireEvent.touchStart(cellElement, { touches: [{ clientX: 0, clientY: 0 }] });
			fireEvent.touchMove(cellElement, { touches: [{ clientX: 25, clientY: 25 }] });
			fireEvent.touchEnd(cellElement);
			expect(useGridStore.getState().grid.cells[0][0].active).toBe(false);

			// Single tap (<10px) toggles active state; double tap toggles supercharged
			const spyNow = vi.spyOn(Date, "now").mockReturnValue(1000);
			fireEvent.touchStart(cellElement, { touches: [{ clientX: 5, clientY: 5 }] });
			fireEvent.touchEnd(cellElement);
			expect(useGridStore.getState().grid.cells[0][0].active).toBe(true);
			expect(useGridStore.getState().grid.cells[0][0].supercharged).toBe(false);

			spyNow.mockReturnValue(1100);
			fireEvent.touchStart(cellElement, { touches: [{ clientX: 5, clientY: 5 }] });
			fireEvent.touchEnd(cellElement);
			expect(useGridStore.getState().grid.cells[0][0].supercharged).toBe(true);
			spyNow.mockRestore();
		});

		it("blocks mouse, touch, and keyboard mutations when in Shared Grid read-only mode", () => {
			useGridStore.setState({ isSharedGrid: true });
			setCellState(0, 0, createEmptyCell(false, true));
			render(<GridCell columnIndex={0} rowIndex={0} />);
			const cellElement = screen.getByRole("gridcell");

			fireEvent.click(cellElement);
			fireEvent.keyDown(cellElement, { key: " " });
			fireEvent.keyDown(cellElement, { key: "s" });
			fireEvent.touchStart(cellElement, { touches: [{ clientX: 0, clientY: 0 }] });
			fireEvent.touchEnd(cellElement);

			expect(useGridStore.getState().grid.cells[0][0].supercharged).toBe(false);
			expect(useGridStore.getState().grid.cells[0][0].active).toBe(true);
		});
	});

	describe("Roving tabIndex and WAI-ARIA grid navigation", () => {
		it("moves roving tabIndex and DOM focus across cells with Arrow, Home, and End keys", () => {
			render(
				<div>
					<GridCell columnIndex={0} rowIndex={0} />
					<GridCell columnIndex={1} rowIndex={0} />
					<GridCell columnIndex={9} rowIndex={0} />
					<GridCell columnIndex={0} rowIndex={1} />
					<GridCell columnIndex={9} rowIndex={5} />
				</div>
			);

			const cell00 = document.getElementById("grid-cell-0-0")!;
			const cell01 = document.getElementById("grid-cell-0-1")!;
			const cell09 = document.getElementById("grid-cell-0-9")!;
			const cell10 = document.getElementById("grid-cell-1-0")!;
			const cell59 = document.getElementById("grid-cell-5-9")!;

			fireEvent.focus(cell00);
			expect(cell00).toHaveAttribute("tabindex", "0");
			expect(cell01).toHaveAttribute("tabindex", "-1");

			fireEvent.keyDown(cell00, { key: "ArrowRight" });
			expect(cell01).toHaveAttribute("tabindex", "0");
			expect(cell00).toHaveAttribute("tabindex", "-1");
			expect(document.activeElement).toBe(cell01);

			fireEvent.keyDown(cell01, { key: "End" });
			expect(cell09).toHaveAttribute("tabindex", "0");
			expect(document.activeElement).toBe(cell09);

			fireEvent.keyDown(cell09, { key: "Home" });
			expect(cell00).toHaveAttribute("tabindex", "0");
			expect(document.activeElement).toBe(cell00);

			fireEvent.keyDown(cell00, { key: "ArrowDown" });
			expect(cell10).toHaveAttribute("tabindex", "0");
			expect(document.activeElement).toBe(cell10);

			fireEvent.keyDown(cell10, { ctrlKey: true, key: "End" });
			expect(cell59).toHaveAttribute("tabindex", "0");
			expect(document.activeElement).toBe(cell59);

			fireEvent.keyDown(cell59, { ctrlKey: true, key: "Home" });
			expect(cell00).toHaveAttribute("tabindex", "0");
			expect(document.activeElement).toBe(cell00);
		});
	});
});
