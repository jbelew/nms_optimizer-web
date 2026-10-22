import type { ReactNode } from "react";
import { cloneElement, isValidElement } from "react";
import { Theme } from "@radix-ui/themes";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import type { DialogContextType } from "@/utils/system/dialogUtils";
import { DialogContext } from "@/utils/system/dialogUtils";

import WelcomeDialog from "./WelcomeDialog";

const mockSendEvent = vi.fn();
vi.mock("@/hooks/useAnalytics/useAnalytics", () => ({
	useAnalytics: () => ({
		sendDeferredEvent: vi.fn(),
		sendEvent: mockSendEvent,
	}),
}));

vi.mock("@/components/AppDialog/Base/AppDialog", () => ({
	default: ({
		content,
		footer,
		isOpen,
		titleKey,
	}: {
		content?: ReactNode;
		footer?: ReactNode;
		isOpen?: boolean;
		titleKey?: string;
	}) =>
		isOpen ?
			<div
				data-testid="app-dialog"
				role="dialog"
			>
				<h2>{titleKey}</h2>
				<div>{content}</div>
				<div>{footer}</div>
			</div>
		:	null,
}));

interface TransProps {
	children?: ReactNode;
	components?: ReactNode[] | Record<string, ReactNode>;
	i18nKey: string;
}

vi.mock("react-i18next", () => ({
	Trans: ({ children, components, i18nKey }: TransProps) => {
		if (components) {
			const comp =
				Array.isArray(components) ?
					components[0]
				:	(components as Record<string, ReactNode>)[1]
					|| (components as Record<string, ReactNode>).link;

			if (comp && isValidElement(comp)) {
				return (
					<span data-testid={i18nKey}>
						{i18nKey} {cloneElement(comp, undefined, "see the complete instructions")}
					</span>
				);
			}
		}

		return <span data-testid={i18nKey}>{i18nKey || children}</span>;
	},
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

const mockDialogContext: DialogContextType = {
	activeDialog: null,
	closeDialog: vi.fn(),
	markTutorialFinished: vi.fn(),
	markUserVisited: vi.fn(),
	openDialog: vi.fn(),
	sectionToScrollTo: undefined,
	shareUrl: "",
	tutorialFinished: false,
	userVisited: false,
};

describe("WelcomeDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("does not render or dispatch analytics when closed", () => {
		const onClose = vi.fn();
		render(
			<DialogContext.Provider value={mockDialogContext}>
				<Theme>
					<WelcomeDialog
						isOpen={false}
						onClose={onClose}
					/>
				</Theme>
			</DialogContext.Provider>,
		);

		expect(screen.queryByTestId("app-dialog")).not.toBeInTheDocument();
		expect(mockSendEvent).not.toHaveBeenCalled();
	});

	it("dispatches page view analytics with standardized title when open", () => {
		const onClose = vi.fn();
		render(
			<DialogContext.Provider value={mockDialogContext}>
				<Theme>
					<WelcomeDialog
						isOpen={true}
						onClose={onClose}
					/>
				</Theme>
			</DialogContext.Provider>,
		);

		expect(mockSendEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "page_view",
				category: "engagement",
				page_title: "dialogs.titles.welcome | appName",
			}),
		);
	});

	it("renders correctly with feature list and footer button", async () => {
		const onClose = vi.fn();
		render(
			<DialogContext.Provider value={mockDialogContext}>
				<Theme>
					<WelcomeDialog
						isOpen={true}
						onClose={onClose}
					/>
				</Theme>
			</DialogContext.Provider>,
		);

		expect(screen.getByText("dialogs.welcome.description")).toBeInTheDocument();
		const list = screen.getByRole("list");
		expect(list).toBeInTheDocument();
		expect(list).toHaveClass("list-disc", "pl-6");
		expect(screen.getAllByRole("listitem")).toHaveLength(6);
		expect(screen.getByTestId("dialogs.welcome.viewInstructions")).toBeInTheDocument();

		const getStartedButton = screen.getByRole("button", {
			name: "dialogs.welcome.getStarted",
		});
		await userEvent.click(getStartedButton);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("calls onClose and openDialog when instructions link is clicked", async () => {
		const onClose = vi.fn();
		render(
			<DialogContext.Provider value={mockDialogContext}>
				<Theme>
					<WelcomeDialog
						isOpen={true}
						onClose={onClose}
					/>
				</Theme>
			</DialogContext.Provider>,
		);

		const link = screen.getByRole("link", { name: "see the complete instructions" });
		expect(link).toHaveAttribute("href", "/instructions");
		expect(link).not.toHaveAttribute("aria-label");
		await userEvent.click(link);

		expect(onClose).toHaveBeenCalled();
		expect(mockDialogContext.openDialog).toHaveBeenCalledWith("instructions");
	});
});
