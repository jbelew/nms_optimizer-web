import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import OptimizationAlertDialog from "./OptimizationAlertDialog";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
	Trans: ({ i18nKey, values }: { i18nKey?: string; values?: Record<string, unknown> }) => {
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

// Mock AppDialog component to simplify testing
vi.mock("./AppDialog", () => ({
	default: ({
		isOpen,
		onClose,
		titleKey,
		content,
	}: {
		isOpen?: boolean;
		onClose?: () => void;
		titleKey?: string;
		content?: React.ReactNode;
	}) => {
		if (!isOpen) return null;

		return (
			<div data-testid="app-dialog" role="dialog">
				<h2>{titleKey}</h2>
				<div>{content}</div>
				<button onClick={onClose}>Close</button>
			</div>
		);
	},
}));

// Mock OptimizationAlertContent to verify it's being passed correctly
vi.mock("./OptimizationAlertContent", () => ({
	OptimizationAlertContent: ({
		technologyName,
		onClose,
		onForceOptimize,
	}: {
		technologyName?: string;
		onClose?: () => void;
		onForceOptimize?: () => void;
	}) => (
		<div data-testid="optimization-alert-content">
			<span>{technologyName}</span>
			<button onClick={onClose}>Cancel</button>
			<button onClick={onForceOptimize}>Force Optimize</button>
		</div>
	),
}));

describe("OptimizationAlertDialog", () => {
	const mockOnClose = vi.fn();
	const mockOnForceOptimize = vi.fn().mockResolvedValue(undefined);
	const testTechName = "TestTech";

	beforeEach(() => {
		vi.clearAllMocks();
		mockOnForceOptimize.mockResolvedValue(undefined);
	});

	test("should not render when technologyName is null", () => {
		render(
			<OptimizationAlertDialog
				isOpen={true}
				technologyName={null}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);

		// Component should not render when technologyName is null
		expect(screen.queryByTestId("app-dialog")).not.toBeInTheDocument();
	});

	test("should render when isOpen is true and technologyName is provided", () => {
		render(
			<OptimizationAlertDialog
				isOpen={true}
				technologyName={testTechName}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);

		expect(screen.getByTestId("app-dialog")).toBeInTheDocument();
	});

	test("should not render when isOpen is false", () => {
		render(
			<OptimizationAlertDialog
				isOpen={false}
				technologyName={testTechName}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);

		// AppDialog won't render content when isOpen is false
		expect(screen.queryByTestId("app-dialog")).not.toBeInTheDocument();
	});

	test("should render with correct title key", () => {
		render(
			<OptimizationAlertDialog
				isOpen={true}
				technologyName={testTechName}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);

		expect(screen.getByText("dialogs.titles.optimizationAlert")).toBeInTheDocument();
	});

	test("should pass technologyName to OptimizationAlertContent", () => {
		render(
			<OptimizationAlertDialog
				isOpen={true}
				technologyName={testTechName}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);

		expect(screen.getByText(testTechName)).toBeInTheDocument();
	});

	test("should pass onClose callback to AppDialog", () => {
		render(
			<OptimizationAlertDialog
				isOpen={true}
				technologyName={testTechName}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);

		const closeButton = screen.getByText("Close");
		closeButton.click();

		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	test("should pass onForceOptimize callback to OptimizationAlertContent", async () => {
		render(
			<OptimizationAlertDialog
				isOpen={true}
				technologyName={testTechName}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);

		const forceOptimizeButton = screen.getByText("Force Optimize");
		forceOptimizeButton.click();

		await waitFor(() => {
			expect(mockOnForceOptimize).toHaveBeenCalledTimes(1);
		});
	});

	test("should handle different technology names", () => {
		const { rerender } = render(
			<OptimizationAlertDialog
				isOpen={true}
				technologyName="TechA"
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);

		expect(screen.getByText("TechA")).toBeInTheDocument();

		rerender(
			<OptimizationAlertDialog
				isOpen={true}
				technologyName="TechB"
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);

		expect(screen.getByText("TechB")).toBeInTheDocument();
	});

	test("should properly use translation for title and fallback", () => {
		render(
			<OptimizationAlertDialog
				isOpen={true}
				technologyName={testTechName}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
			/>
		);

		// Both titleKey and title are passed to AppDialog
		// In real implementation, titleKey is used for i18n translation
		expect(screen.getByText("dialogs.titles.optimizationAlert")).toBeInTheDocument();
	});

	test("should handle async onForceOptimize", async () => {
		const asyncMockOnForceOptimize = vi.fn(
			() => new Promise<void>((resolve) => setTimeout(resolve, 100))
		);

		render(
			<OptimizationAlertDialog
				isOpen={true}
				technologyName={testTechName}
				onClose={mockOnClose}
				onForceOptimize={asyncMockOnForceOptimize}
			/>
		);

		const forceOptimizeButton = screen.getByText("Force Optimize");
		forceOptimizeButton.click();

		await waitFor(() => {
			expect(asyncMockOnForceOptimize).toHaveBeenCalledTimes(1);
		});
	});
});
