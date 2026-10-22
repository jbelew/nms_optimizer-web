import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";

import BuildNameDialog from "./BuildNameDialog";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock("@/components/AppDialog/Base/AppDialog", () => ({
	default: ({
		className,
		content,
		footer,
		isOpen,
		onClose,
		titleKey,
	}: {
		className?: string;
		content?: ReactNode;
		footer?: ReactNode;
		isOpen?: boolean;
		onClose?: () => void;
		titleKey?: string;
	}) =>
		isOpen ?
			<div
				className={className}
				data-testid="app-dialog"
				role="dialog"
			>
				<h2>{titleKey}</h2>
				<div data-testid="dialog-body">{content}</div>
				<div data-testid="dialog-footer">{footer}</div>
				<button onClick={onClose}>CloseDialog</button>
			</div>
		:	null,
}));

describe("BuildNameDialog", () => {
	const mockOnCancel = vi.fn();
	const mockOnConfirm = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		usePlatformStore.setState({ selectedPlatform: "standard" });
		useGridStore.setState({ buildName: "Saved Falcon" });
	});

	it("renders via AppDialog with standardized label and footer buttons", () => {
		render(
			<BuildNameDialog
				isOpen={true}
				onCancel={mockOnCancel}
				onConfirm={mockOnConfirm}
			/>,
		);

		expect(screen.getByTestId("app-dialog")).toBeInTheDocument();
		expect(screen.getByText("dialog.buildName.title")).toBeInTheDocument();

		const label = screen.getByText("dialog.buildName.description");
		expect(label.tagName).toBe("LABEL");
		expect(label).not.toHaveClass("rt-r-size-2");

		const input = screen.getByRole("textbox");
		expect(input).toHaveValue("Saved Falcon");
	});

	it("submits trimmed build name when Save button is clicked or Enter is pressed", () => {
		render(
			<BuildNameDialog
				isOpen={true}
				onCancel={mockOnCancel}
				onConfirm={mockOnConfirm}
			/>,
		);

		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "  Custom Build  " } });
		fireEvent.click(screen.getByRole("button", { name: "buttons.save" }));

		expect(mockOnConfirm).toHaveBeenCalledWith("Custom Build");
	});

	it("generates a new build name when generate button is clicked", () => {
		render(
			<BuildNameDialog
				isOpen={true}
				onCancel={mockOnCancel}
				onConfirm={mockOnConfirm}
			/>,
		);

		const input = screen.getByRole<HTMLInputElement>("textbox");
		fireEvent.change(input, { target: { value: "Initial Name" } });
		fireEvent.click(screen.getByRole("button", { name: "buttons.generateName" }));

		expect(input.value).not.toBe("Initial Name");
		expect(input.value.length).toBeGreaterThan(0);
	});

	it("blocks confirmation when build name is empty and calls onCancel on Escape", () => {
		render(
			<BuildNameDialog
				isOpen={true}
				onCancel={mockOnCancel}
				onConfirm={mockOnConfirm}
			/>,
		);

		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "   " } });
		fireEvent.keyDown(input, { key: "Enter" });

		expect(mockOnConfirm).not.toHaveBeenCalled();

		fireEvent.keyDown(input, { key: "Escape" });
		expect(mockOnCancel).toHaveBeenCalledTimes(1);
	});
});
