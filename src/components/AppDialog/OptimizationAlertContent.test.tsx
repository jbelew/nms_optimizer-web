import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { OptimizationAlertContent } from "./OptimizationAlertContent";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
	Trans: ({ i18nKey, values }: { i18nKey: string; values?: Record<string, unknown> }) => {
		// Simple mock that renders with values
		if ((values as Record<string, string> | undefined)?.technologyName) {
			return (
				<span>
					{i18nKey} [{(values as Record<string, string>).technologyName}]
				</span>
			);
		}
		return <span>{i18nKey}</span>;
	},
}));

// Helper to render component within Dialog context
const renderWithDialog = (component: React.ReactElement) => {
	return render(
		<Dialog.Root open={true}>
			<Dialog.Content>{component}</Dialog.Content>
		</Dialog.Root>
	);
};

describe("OptimizationAlertContent", () => {
	const mockOnClose = vi.fn();
	const mockOnForceOptimize = vi.fn().mockResolvedValue(undefined);
	const testTechName = "TestTech";

	beforeEach(() => {
		vi.clearAllMocks();
		mockOnForceOptimize.mockResolvedValue(undefined);
	});

	test("should render warning title", () => {
		renderWithDialog(
			<OptimizationAlertContent
				technologyName={testTechName}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);
		expect(screen.getByText("dialogs.optimizationAlert.warning")).toBeInTheDocument();
	});

	test("should render insufficient space message with technology name", () => {
		renderWithDialog(
			<OptimizationAlertContent
				technologyName={testTechName}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);
		expect(
			screen.getByText(/dialogs\.optimizationAlert\.insufficientSpace \[TestTech\]/)
		).toBeInTheDocument();
	});

	test("should render force optimize suggestion", () => {
		renderWithDialog(
			<OptimizationAlertContent
				technologyName={testTechName}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);
		expect(
			screen.getByText("dialogs.optimizationAlert.forceOptimizeSuggestion")
		).toBeInTheDocument();
	});

	test("should render cancel button with correct label", () => {
		renderWithDialog(
			<OptimizationAlertContent
				technologyName={testTechName}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);
		const buttons = screen.getAllByRole("button");
		const cancelButton = buttons.find(
			(btn) => btn.textContent === "dialogs.optimizationAlert.cancelButton"
		);
		expect(cancelButton).toBeInTheDocument();
	});

	test("should render force optimize button with correct label", () => {
		renderWithDialog(
			<OptimizationAlertContent
				technologyName={testTechName}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);
		const buttons = screen.getAllByRole("button");
		const forceButton = buttons.find(
			(btn) => btn.textContent === "dialogs.optimizationAlert.forceOptimizeButton"
		);
		expect(forceButton).toBeInTheDocument();
	});

	test("should call onClose when cancel button is clicked", () => {
		renderWithDialog(
			<OptimizationAlertContent
				technologyName={testTechName}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);
		const buttons = screen.getAllByRole("button");
		const cancelButton = buttons.find(
			(btn) => btn.textContent === "dialogs.optimizationAlert.cancelButton"
		);
		fireEvent.click(cancelButton!);
		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	test("should call onForceOptimize when force optimize button is clicked", async () => {
		renderWithDialog(
			<OptimizationAlertContent
				technologyName={testTechName}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);
		const buttons = screen.getAllByRole("button");
		const forceButton = buttons.find(
			(btn) => btn.textContent === "dialogs.optimizationAlert.forceOptimizeButton"
		);
		fireEvent.click(forceButton!);

		await waitFor(() => {
			expect(mockOnForceOptimize).toHaveBeenCalledTimes(1);
		});
	});

	test("should handle different technology names", () => {
		const techNames = ["DriveSystem", "Weapon", "Engine"];

		techNames.forEach((techName) => {
			const { unmount } = renderWithDialog(
				<OptimizationAlertContent
					technologyName={techName}
					onClose={mockOnClose}
					onForceOptimize={mockOnForceOptimize}
				/>
			);

			expect(screen.getByText(new RegExp(techName))).toBeInTheDocument();
			unmount();
		});
	});

	test("should render both cancel and force optimize buttons", () => {
		renderWithDialog(
			<OptimizationAlertContent
				technologyName={testTechName}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);

		const buttons = screen.getAllByRole("button");
		expect(buttons.length).toBeGreaterThanOrEqual(2);
	});

	test("should render title with correct styling", () => {
		const { container } = renderWithDialog(
			<OptimizationAlertContent
				technologyName={testTechName}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);

		// Check for title element with correct classes
		const titleElement = container.querySelector(".errorContent__title");
		expect(titleElement).toBeInTheDocument();
		expect(titleElement).toHaveClass("text-xl", "font-semibold");
	});
});
