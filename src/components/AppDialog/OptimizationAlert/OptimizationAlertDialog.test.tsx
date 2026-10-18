import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { useTechStore } from "@/store/tech/techStore";

import OptimizationAlertDialog from "./OptimizationAlertDialog";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	Trans: ({
		i18nKey,
		values,
	}: {
		i18nKey?: string;
		values?: { height?: number; technologyName?: string; width?: number };
	}) => {
		if (i18nKey === "dialogs.optimizationAlert.insufficientSpaceWithWindow") {
			return (
				<span>
					There&apos;s not a large enough window (requires {values?.width}×
					{values?.height}) to effectively place the selected modules for{" "}
					<span>{values?.technologyName}</span>.
				</span>
			);
		}

		if (i18nKey === "dialogs.optimizationAlert.insufficientSpace") {
			return (
				<span>
					There&apos;s not a large enough window to effectively place the selected modules
					for <span>{values?.technologyName}</span>.
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
			<div
				data-testid="app-dialog"
				role="dialog"
			>
				<h2>{titleKey}</h2>
				<div>{content}</div>
				<div>{footer}</div>
				<button onClick={onClose}>Close</button>
			</div>
		);
	},
}));

describe("OptimizationAlertDialog", () => {
	const mockOnClose = vi.fn();
	const mockOnForceOptimize = vi.fn().mockResolvedValue(undefined);
	const testTechName = "TestTech";

	beforeEach(() => {
		vi.clearAllMocks();
		mockOnForceOptimize.mockResolvedValue(undefined);
		useTechStore.setState({
			activeGroups: {},
			checkedModules: {},
			techGroups: {},
		});
	});

	test("should not render when technologyName is null", () => {
		render(
			<OptimizationAlertDialog
				isOpen={true}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
				technologyName={null}
			/>,
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
			/>,
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
			/>,
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
			/>,
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
			/>,
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
			/>,
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
			/>,
		);

		const forceOptimizeButton = await screen.findByText(
			"dialogs.optimizationAlert.forceOptimizeButton",
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
			/>,
		);

		expect(await screen.findByText("TechA")).toBeInTheDocument();

		rerender(
			<OptimizationAlertDialog
				isOpen={true}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
				technologyName="TechB"
			/>,
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
			/>,
		);

		// Both titleKey and title are passed to AppDialog
		// In real implementation, titleKey is used for i18n translation
		expect(await screen.findByText("dialogs.titles.optimizationAlert")).toBeInTheDocument();
	});

	test("should handle async onForceOptimize", async () => {
		const asyncMockOnForceOptimize = vi.fn(
			() => new Promise<void>((resolve) => setTimeout(resolve, 100)),
		);

		render(
			<OptimizationAlertDialog
				isOpen={true}
				onClose={mockOnClose}
				onForceOptimize={asyncMockOnForceOptimize}
				technologyName={testTechName}
			/>,
		);

		const forceOptimizeButton = await screen.findByText(
			"dialogs.optimizationAlert.forceOptimizeButton",
		);
		forceOptimizeButton.click();

		await waitFor(() => {
			expect(asyncMockOnForceOptimize).toHaveBeenCalledTimes(1);
		});
	});

	test("renders required Solver Window dimensions derived from the failed Technology Category and its Module Selection count", async () => {
		useTechStore.setState({
			activeGroups: { pulse: "normal" },
			checkedModules: {
				pulse: ["PE", "PC", "PU1", "PU2", "PU3"],
			},
			techGroups: {
				pulse: [
					{
						color: "blue",
						image: "pulse.webp",
						key: "pulse",
						label: "Pulse Engine",
						module_count: 5,
						modules: [],
						type: "normal",
						window_rules: {
							"1": [1, 1],
							"2": [2, 1],
							"4": [2, 2],
							"6": [3, 2],
							default: [4, 4],
						},
					},
				],
			},
		});

		render(
			<OptimizationAlertDialog
				isOpen={true}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
				technologyName="pulse"
			/>,
		);

		expect(
			await screen.findByText(
				/There's not a large enough window \(requires 3×2\) to effectively place the selected modules for/i,
			),
		).toBeInTheDocument();
		expect(screen.getByText("pulse")).toBeInTheDocument();
	});

	test("respects custom window_rules on the active Technology Category variant", async () => {
		useTechStore.setState({
			activeGroups: { trails: "max" },
			checkedModules: {
				trails: ["T1", "T2", "T3", "T4", "T5"],
			},
			techGroups: {
				trails: [
					{
						color: "amber",
						image: "trails.webp",
						key: "trails",
						label: "Starship Trails",
						module_count: 5,
						modules: [],
						type: "normal",
						window_rules: {
							"6": [3, 2],
							default: [4, 4],
						},
					},
					{
						color: "amber",
						image: "trails.webp",
						key: "trails",
						label: "Starship Trails",
						module_count: 5,
						modules: [],
						type: "max",
						window_rules: {
							"5": [3, 3],
							default: [4, 3],
						},
					},
				],
			},
		});

		render(
			<OptimizationAlertDialog
				isOpen={true}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
				technologyName="trails"
			/>,
		);

		expect(
			await screen.findByText(
				/There's not a large enough window \(requires 3×3\) to effectively place the selected modules for/i,
			),
		).toBeInTheDocument();
		expect(screen.getByText("trails")).toBeInTheDocument();
	});

	test("falls back to generic space warning text when Solver Window dimensions are unavailable", async () => {
		render(
			<OptimizationAlertDialog
				isOpen={true}
				onClose={mockOnClose}
				onForceOptimize={mockOnForceOptimize}
				technologyName="unknown-tech"
			/>,
		);

		expect(
			await screen.findByText(
				/There's not a large enough window to effectively place the selected modules for/i,
			),
		).toBeInTheDocument();
		expect(screen.queryByText(/requires/i)).not.toBeInTheDocument();
		expect(screen.getByText("unknown-tech")).toBeInTheDocument();
	});
});
