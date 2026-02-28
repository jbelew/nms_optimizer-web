import type { DialogContextType } from "../../context/dialog-utils";
import type { ReactNode } from "react";
import { Theme } from "@radix-ui/themes";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { DialogContext } from "../../context/dialog-utils";
import WelcomeContent from "./WelcomeContent";

interface TransProps {
	i18nKey: string;
	children?: ReactNode;
	components?: Record<string, ReactNode> | ReactNode[];
}

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
	Trans: ({ i18nKey, children, components }: TransProps) => {
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
}));

const mockDialogContext: DialogContextType = {
	activeDialog: null,
	openDialog: vi.fn(),
	closeDialog: vi.fn(),
	tutorialFinished: false,
	markTutorialFinished: vi.fn(),
	userVisited: false,
	markUserVisited: vi.fn(),
	shareUrl: "",
	sectionToScrollTo: undefined,
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
		expect(container.querySelectorAll(".welcomeContent__item")).toHaveLength(5);
		expect(screen.getByTestId("dialogs.welcome.viewInstructions")).toBeInTheDocument();
		expect(screen.getByText("dialogs.welcome.getStarted")).toBeInTheDocument();
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

		const link = screen.getByRole("link");
		await userEvent.click(link);

		expect(onClose).toHaveBeenCalledTimes(1);
		expect(mockDialogContext.openDialog).toHaveBeenCalledWith("instructions");
	});

	it("calls onClose when the get started button is clicked", async () => {
		const onClose = vi.fn();
		render(
			<DialogContext.Provider value={mockDialogContext}>
				<Theme>
					<WelcomeContent onClose={onClose} />
				</Theme>
			</DialogContext.Provider>
		);

		const button = screen.getByText("dialogs.welcome.getStarted");
		await userEvent.click(button);

		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
