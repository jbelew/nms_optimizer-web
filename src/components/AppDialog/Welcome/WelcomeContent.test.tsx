import type { DialogContextType } from "@/utils/system/dialogUtils";
import type { ReactNode } from "react";
import { Theme } from "@radix-ui/themes";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { DialogContext } from "@/utils/system/dialogUtils";

import WelcomeContent from "./WelcomeContent";

vi.mock("../../../hooks/useAnalytics/useAnalytics", () => ({
	useAnalytics: () => ({
		sendDeferredEvent: vi.fn(),
		sendEvent: vi.fn(),
	}),
}));

interface TransProps {
	children?: ReactNode;
	components?: ReactNode[] | Record<string, ReactNode>;
	i18nKey: string;
}

vi.mock("react-i18next", () => ({
	Trans: ({ children, components, i18nKey }: TransProps) => {
		if (components) {
			const comp = Array.isArray(components)
				? components[0]
				: (components as Record<string, ReactNode>)[1] ||
					(components as Record<string, ReactNode>).link;

			if (comp) {
				return (
					<span data-testid={i18nKey}>
						{i18nKey} {comp}
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

describe("WelcomeContent", () => {
	it("renders correctly with BEM classes", () => {
		const onClose = vi.fn();
		const { container } = render(
			<DialogContext.Provider value={mockDialogContext}>
				<Theme>
					<WelcomeContent onClose={onClose} />
				</Theme>
			</DialogContext.Provider>
		);

		expect(screen.getByText("dialogs.welcome.description")).toBeInTheDocument();
		expect(container.querySelector(".welcomeContent__list")).toBeInTheDocument();
		expect(container.querySelectorAll(".welcomeContent__item")).toHaveLength(6);
		expect(screen.getByTestId("dialogs.welcome.viewInstructions")).toBeInTheDocument();
	});

	it("calls onClose and openDialog when instructions link is clicked", async () => {
		const onClose = vi.fn();
		render(
			<DialogContext.Provider value={mockDialogContext}>
				<Theme>
					<WelcomeContent onClose={onClose} />
				</Theme>
			</DialogContext.Provider>
		);

		const link = screen.getByRole("button", { name: "View instructions" });
		await userEvent.click(link);

		expect(onClose).toHaveBeenCalled();
		expect(mockDialogContext.openDialog).toHaveBeenCalledWith("instructions");
	});
});
