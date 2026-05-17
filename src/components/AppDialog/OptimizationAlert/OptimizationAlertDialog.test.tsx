import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import OptimizationAlertDialog from "./OptimizationAlertDialog";

// Mock react-i18next
vi.mock("react-i18next", () => ({
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
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock AppDialog component to simplify testing
vi.mock("@/components/AppDialog/Base/AppDialog", () => ({
	default: ({
		content,
		footer,
		isOpen,
		onClose,
		titleKey,
	}: {
		content?: React.ReactNode;
		footer?: React.ReactNode;
		isOpen?: boolean;
		onClose?: () => void;
		titleKey?: string;
	}) => {
		if (!isOpen) return null;

		return (
			<div data-testid="app-dialog" role="dialog">
				<h2>{titleKey}</h2>
				<div>{content}</div>
				<div>{footer}</div>
				<button onClick={onClose}>Close</button>
			</div>
		);
	},
}));

// Mock OptimizationAlertContent to verify it's being passed correctly
vi.mock("./OptimizationAlertContent", () => ({
	OptimizationAlertContent: ({ technologyName }: { technologyName?: string }) => (
		<div data-testid="optimization-alert-content">
			<span>{technologyName}</span>
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
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
				technologyName={null}
			/>
		);

		// Component should not render when technologyName is null
		expect(screen.queryByTestId("app-dialog")).not.toBeInTheDocument();
	});

	test("should render when isOpen is true and technologyName is provided", async () => {
		render(
			<OptimizationAlertDialog
				isOpen={true}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
				technologyName={testTechName}
			/>
		);

		expect(await screen.findByTestId("app-dialog")).toBeInTheDocument();
	});

	test("should not render when isOpen is false", () => {
		render(
			<OptimizationAlertDialog
				isOpen={false}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
				technologyName={testTechName}
			/>
		);

		// AppDialog won't render content when isOpen is false
		expect(screen.queryByTestId("app-dialog")).not.toBeInTheDocument();
	});

	test("should render with correct title key", async () => {
		render(
			<OptimizationAlertDialog
				isOpen={true}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
				technologyName={testTechName}
			/>
		);

		expect(await screen.findByText("dialogs.titles.optimizationAlert")).toBeInTheDocument();
	});

	test("should pass technologyName to OptimizationAlertContent", async () => {
		render(
			<OptimizationAlertDialog
				isOpen={true}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
				technologyName={testTechName}
			/>
		);

		expect(await screen.findByText(testTechName)).toBeInTheDocument();
	});

	test("should pass onClose callback to AppDialog", async () => {
		render(
			<OptimizationAlertDialog
				isOpen={true}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
				technologyName={testTechName}
			/>
		);

		const closeButton = await screen.findByText("Close");
		closeButton.click();

		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	test("should pass onForceOptimize callback to OptimizationAlertContent", async () => {
		render(
			<OptimizationAlertDialog
				isOpen={true}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
				technologyName={testTechName}
			/>
		);

		const forceOptimizeButton = await screen.findByText(
			"dialogs.optimizationAlert.forceOptimizeButton"
		);
		forceOptimizeButton.click();

		await waitFor(() => {
			expect(mockOnForceOptimize).toHaveBeenCalledTimes(1);
		});
	});

	test("should handle different technology names", async () => {
		const { rerender } = render(
			<OptimizationAlertDialog
				isOpen={true}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
				technologyName="TechA"
			/>
		);

		expect(await screen.findByText("TechA")).toBeInTheDocument();

		rerender(
			<OptimizationAlertDialog
				isOpen={true}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
				technologyName="TechB"
			/>
		);

		expect(await screen.findByText("TechB")).toBeInTheDocument();
	});

	test("should properly use translation for title and fallback", async () => {
		render(
			<OptimizationAlertDialog
				isOpen={true}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
				technologyName={testTechName}
			/>
		);

		// Both titleKey and title are passed to AppDialog
		// In real implementation, titleKey is used for i18n translation
		expect(await screen.findByText("dialogs.titles.optimizationAlert")).toBeInTheDocument();
	});

	test("should handle async onForceOptimize", async () => {
		const asyncMockOnForceOptimize = vi.fn(
			() => new Promise<void>((resolve) => setTimeout(resolve, 100))
		);

		render(
			<OptimizationAlertDialog
				isOpen={true}
				onClose={mockOnClose}
				onForceOptimize={asyncMockOnForceOptimize}
				technologyName={testTechName}
			/>
		);

		const forceOptimizeButton = await screen.findByText(
			"dialogs.optimizationAlert.forceOptimizeButton"
		);
		forceOptimizeButton.click();

		await waitFor(() => {
			expect(asyncMockOnForceOptimize).toHaveBeenCalledTimes(1);
		});
	});
});
