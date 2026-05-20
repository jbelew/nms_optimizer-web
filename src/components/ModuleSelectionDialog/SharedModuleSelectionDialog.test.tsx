import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { useTechTree } from "@/components/TechTree/useTechTreeContext";
import { useTechModuleManagement } from "@/components/TechTreeRow/useTechModuleManagement";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { useModuleSelectionDialogStore } from "@/store/ui/uiStore";

import { SharedModuleSelectionDialog } from "./SharedModuleSelectionDialog";

// Mock i18next
vi.mock("react-i18next", () => ({
	Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock stores and hooks
vi.mock("@/store/ui/uiStore");
vi.mock("@/store/tech/techStore");
vi.mock("@/store/grid/gridStore");
vi.mock("@/components/TechTree/useTechTreeContext");
vi.mock("@/components/TechTreeRow/useTechModuleManagement");
vi.mock("@/hooks/useAnalytics/useAnalytics");

interface MockPresentationalProps {
	handleOptimizeClick: () => void;
	isOpen: boolean;
	onClose: () => void;
	tech: string;
}

// Mock presentation component
vi.mock("./ModuleSelectionDialog", () => ({
	ModuleSelectionDialog: ({
		handleOptimizeClick,
		isOpen,
		onClose,
		tech,
	}: MockPresentationalProps) => (
		<div data-testid="mock-presentational-dialog">
			<span>IsOpen: {isOpen ? "yes" : "no"}</span>
			<span>Tech: {tech}</span>
			<button onClick={handleOptimizeClick}>Optimize Button</button>
			<button onClick={onClose}>Cancel Button</button>
		</div>
	),
}));

describe("SharedModuleSelectionDialog", () => {
	const mockCloseDialog = vi.fn();
	const mockHandleOptimize = vi.fn();
	const mockHandleAllCheckboxesChange = vi.fn();
	const mockHandleSelectAllChange = vi.fn();
	const mockHandleValueChange = vi.fn();
	const mockSendDeferredEvent = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		// Default store mocks
		vi.mocked(useModuleSelectionDialogStore).mockReturnValue({
			closeDialog: mockCloseDialog,
			isOpen: false,
			selectedTechData: null,
		} as unknown as ReturnType<typeof useModuleSelectionDialogStore>);

		vi.mocked(useTechStore).mockReturnValue({
			techGroup: [],
		} as unknown as ReturnType<typeof useTechStore>);

		vi.mocked(useGridStore).mockReturnValue({
			activeTechs: new Set(["hyperdrive"]),
		} as unknown as ReturnType<typeof useGridStore>);

		vi.mocked(useTechTree).mockReturnValue({
			handleOptimize: mockHandleOptimize,
			isGridFull: false,
		} as unknown as ReturnType<typeof useTechTree>);

		vi.mocked(useAnalytics).mockReturnValue({
			sendDeferredEvent: mockSendDeferredEvent,
		} as unknown as ReturnType<typeof useAnalytics>);

		vi.mocked(useTechModuleManagement).mockReturnValue({
			allModulesSelected: true,
			currentCheckedModules: ["module-1"],
			groupedModules: {} as unknown as ReturnType<
				typeof useTechModuleManagement
			>["groupedModules"],
			handleAllCheckboxesChange: mockHandleAllCheckboxesChange,
			handleSelectAllChange: mockHandleSelectAllChange,
			handleValueChange: mockHandleValueChange,
			isIndeterminate: false,
		});
	});

	test("renders null when selectedTechData is null", () => {
		const { container } = render(<SharedModuleSelectionDialog />);
		expect(container.firstChild).toBeNull();
	});

	test("renders presentational ModuleSelectionDialog when selectedTechData is provided", () => {
		vi.mocked(useModuleSelectionDialogStore).mockReturnValue({
			closeDialog: mockCloseDialog,
			isOpen: true,
			selectedTechData: {
				tech: "hyperdrive",
				techColor: "blue",
				techImage: "hyperdrive.webp",
			},
		} as unknown as ReturnType<typeof useModuleSelectionDialogStore>);

		render(<SharedModuleSelectionDialog />);

		const dialog = screen.getByTestId("mock-presentational-dialog");
		expect(dialog).toBeInTheDocument();
		expect(screen.getByText("Tech: hyperdrive")).toBeInTheDocument();
		expect(screen.getByText("IsOpen: yes")).toBeInTheDocument();
	});

	test("sends page view analytics when dialog is opened", () => {
		vi.mocked(useModuleSelectionDialogStore).mockReturnValue({
			closeDialog: mockCloseDialog,
			isOpen: true,
			selectedTechData: {
				tech: "hyperdrive",
				techColor: "blue",
				techImage: "hyperdrive.webp",
			},
		} as unknown as ReturnType<typeof useModuleSelectionDialogStore>);

		render(<SharedModuleSelectionDialog />);

		expect(mockSendDeferredEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "page_view",
				category: "engagement",
			})
		);
	});

	test("calls handleOptimize and closeDialog when optimize button is clicked", async () => {
		vi.mocked(useModuleSelectionDialogStore).mockReturnValue({
			closeDialog: mockCloseDialog,
			isOpen: true,
			selectedTechData: {
				tech: "hyperdrive",
				techColor: "blue",
				techImage: "hyperdrive.webp",
			},
		} as unknown as ReturnType<typeof useModuleSelectionDialogStore>);

		render(<SharedModuleSelectionDialog />);

		fireEvent.click(screen.getByText("Optimize Button"));

		expect(mockHandleOptimize).toHaveBeenCalledWith("hyperdrive");
		await waitFor(() => {
			expect(mockCloseDialog).toHaveBeenCalled();
		});
	});

	test("reverts checkboxes to initial modules and closes on cancel", () => {
		vi.mocked(useModuleSelectionDialogStore).mockReturnValue({
			closeDialog: mockCloseDialog,
			isOpen: true,
			selectedTechData: {
				tech: "hyperdrive",
				techColor: "blue",
				techImage: "hyperdrive.webp",
			},
		} as unknown as ReturnType<typeof useModuleSelectionDialogStore>);

		render(<SharedModuleSelectionDialog />);

		fireEvent.click(screen.getByText("Cancel Button"));

		// Reverts modules and closes the dialog
		expect(mockHandleAllCheckboxesChange).toHaveBeenCalled();
		expect(mockCloseDialog).toHaveBeenCalled();
	});
});
