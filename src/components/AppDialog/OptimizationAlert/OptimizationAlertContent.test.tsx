import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { render, screen } from "@testing-library/react";
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
	const testTechName = "TestTech";

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("should render warning title", () => {
		renderWithDialog(<OptimizationAlertContent technologyName={testTechName} />);
		expect(screen.getByText("dialogs.optimizationAlert.warning")).toBeInTheDocument();
	});

	test("should render insufficient space message with technology name", () => {
		renderWithDialog(<OptimizationAlertContent technologyName={testTechName} />);
		expect(
			screen.getByText(/dialogs\.optimizationAlert\.insufficientSpace \[TestTech\]/)
		).toBeInTheDocument();
	});

	test("should render force optimize suggestion", () => {
		renderWithDialog(<OptimizationAlertContent technologyName={testTechName} />);
		expect(
			screen.getByText("dialogs.optimizationAlert.forceOptimizeSuggestion")
		).toBeInTheDocument();
	});

	test("should handle different technology names", () => {
		const techNames = ["DriveSystem", "Weapon", "Engine"];

		techNames.forEach((techName) => {
			const { unmount } = renderWithDialog(
				<OptimizationAlertContent technologyName={techName} />
			);

			expect(screen.getByText(new RegExp(techName))).toBeInTheDocument();
			unmount();
		});
	});

	test("should render title with correct styling", () => {
		const { container } = renderWithDialog(
			<OptimizationAlertContent technologyName={testTechName} />
		);

		// Check for title element with correct classes
		const titleElement = container.querySelector(".errorContent__title");
		expect(titleElement).toBeInTheDocument();
		expect(titleElement).toHaveClass("text-xl", "font-semibold");
	});
});
