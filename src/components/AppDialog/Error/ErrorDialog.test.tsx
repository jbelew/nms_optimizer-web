import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { useOptimizeStore } from "@/store/ui/uiStore";

import { ErrorDialog } from "./ErrorDialog";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	Trans: ({
		components,
		i18nKey,
	}: {
		components?: Record<number, React.ReactNode>;
		i18nKey: string;
	}) => {
		if (components?.[1]) {
			const key = typeof i18nKey === "string" ? i18nKey : "";
			const comp1 = components[1];

			return (
				<span>
					{key.substring(0, 1)}
					{comp1}
					{key.substring(1)}
				</span>
			);
		}

		return <span>{i18nKey}</span>;
	},
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock AppDialog component
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

describe("ErrorDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useOptimizeStore.setState({
			status: { type: "idle" },
		});
	});

	test("should not render when status is not error", () => {
		const { container } = render(<ErrorDialog />);
		expect(container.firstChild).toBeNull();
	});

	test("should render when status is error", async () => {
		useOptimizeStore.setState({
			status: { details: null, severity: "recoverable", type: "error" },
		});

		render(<ErrorDialog />);

		expect(await screen.findByTestId("app-dialog")).toBeInTheDocument();
		expect(screen.getByText("errorContent.signalDisruption")).toBeInTheDocument();
	});

	test("should render error details text and link to GitHub issues", async () => {
		useOptimizeStore.setState({
			status: {
				details: new Error("Detailed server failure"),
				severity: "recoverable",
				type: "error",
			},
		});

		render(<ErrorDialog />);

		expect(await screen.findByTestId("app-dialog")).toBeInTheDocument();
		const githubLink = screen.getByRole("link");
		expect(githubLink).toHaveAttribute(
			"href",
			"https://github.com/jbelew/nms_optimizer-web/issues",
		);
		expect(githubLink).toHaveAttribute("target", "_blank");
		expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
		expect(screen.getAllByText(/Detailed server failure/i).length).toBeGreaterThan(0);
	});

	test("should clear error state when dialog is closed", async () => {
		useOptimizeStore.setState({
			status: { details: null, severity: "recoverable", type: "error" },
		});

		render(<ErrorDialog />);

		const closeButton = await screen.findByText("Close");
		fireEvent.click(closeButton);

		expect(useOptimizeStore.getState().status.type).toBe("idle");
	});
});
