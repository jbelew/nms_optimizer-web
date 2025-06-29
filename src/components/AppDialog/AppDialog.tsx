// src/components/InfoDialog/InfoDialog.tsx
import "./AppDialog.css";

import * as Dialog from "@radix-ui/react-dialog";
import {
	CounterClockwiseClockIcon,
	Cross2Icon,
	ExclamationTriangleIcon,
	GlobeIcon,
	InfoCircledIcon,
	QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import { IconButton, Theme } from "@radix-ui/themes";
import React, { type ReactNode, useCallback, useEffect } from "react";

interface AppDialogProps {
	onClose: () => void;
	title?: string;
	titleKey?: string; // Add a prop for the translation key
	isOpen: boolean;
	content: ReactNode;
}

const iconMap: Record<string, React.ElementType> = {
	"dialogs.titles.instructions": QuestionMarkCircledIcon,
	"dialogs.titles.changelog": CounterClockwiseClockIcon,
	"dialogs.titles.about": InfoCircledIcon,
	"dialogs.titles.serverError": ExclamationTriangleIcon,
	"dialogs.titles.translationRequest": GlobeIcon,
};

const iconStyle: Record<string, { color: string }> = {
	"dialogs.titles.serverError": { color: "var(--red-9)" },
	default: { color: "var(--accent-11)" },
};

/**
 * A Dialog component for displaying information to the user.
 *
 * @param {AppDialogProps} props
 * @prop {() => void} onClose - A callback to be called when the dialog is closed.
 * @prop {string} [title="Information"] - The title of the dialog.
 * @prop {ReactNode} content - The content to be displayed in the dialog.
 *
 * @returns {ReactElement}
 */
const AppDialog: React.FC<AppDialogProps> = ({
	onClose,
	content,
	isOpen,
	titleKey, // Use the new prop
	title = "Information",
}) => {
	/**
	 * Handle the Escape key, closing the dialog if it is pressed.
	 *
	 * @param {KeyboardEvent} event
	 */
	const handleEscapeKey = useCallback(
		(event: KeyboardEvent) => event.key === "Escape" && onClose(),
		[onClose]
	);

	/**
	 * Add a keydown event listener to the window for the Escape key.
	 *
	 * This is done to allow the dialog to be closed with the Escape key, in
	 * addition to the close button.
	 */
	useEffect(() => {
		window.addEventListener("keydown", handleEscapeKey);
		return () => window.removeEventListener("keydown", handleEscapeKey);
	}, [handleEscapeKey]);

	const IconComponent = titleKey ? iconMap[titleKey] : null;
	const style = titleKey ? iconStyle[titleKey] || iconStyle.default : iconStyle.default;

	return (
		<Dialog.Root
			open={isOpen} // Control open state
			onOpenChange={(open) => !open && onClose()}
			modal={true} // Keep it modal
		>
			<Dialog.Portal>
				<Theme appearance="dark">
					<Dialog.Overlay className="appDialog__overlay" />
					<Dialog.Content className="appDialog__content" style={{ paddingTop: "var(--space-3)" }}>
						<Dialog.Title className="flex items-start gap-2 text-xl sm:text-2xl heading-styled">
							{IconComponent && <IconComponent className="w-6 h-6 mt-0 sm:mt-1" style={style} />}
							{title}
						</Dialog.Title>
						<Dialog.Description className="hidden appDialog__description">
							This dialog contains information.
						</Dialog.Description>
						<div className="text-sm appDialog__container">{content}</div>
						<Dialog.Close asChild>
							<IconButton
								variant="soft"
								color="cyan"
								className="appDialog__close"
								aria-label="Close dialog"
							>
								<Cross2Icon />
							</IconButton>
						</Dialog.Close>
					</Dialog.Content>
				</Theme>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default AppDialog;
