// src/components/InfoDialog/InfoDialog.tsx
import "./AppDialog.css";

import type { ReactNode } from "react";
import React, { useCallback, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { IconButton, Separator, Theme } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { getDialogIconAndStyle } from "../../utils/dialogIconMapping";

interface AppDialogProps {
	onClose: () => void;
	title?: string;
	titleKey?: string; // Add a prop for the translation key
	isOpen: boolean;
	content: ReactNode;
}

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

	const { t } = useTranslation();

	const { IconComponent, style } = getDialogIconAndStyle(titleKey);

	return (
		<Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<Dialog.Portal>
				<Theme>
					<Dialog.Overlay className="appDialog__overlay" />
					<Dialog.Content className="appDialog__content">
						<Dialog.Title className="mr-2">
							<span className="heading-styled flex items-center gap-2 text-xl sm:text-2xl">
								{IconComponent && (
									<IconComponent className="inline h-6 w-6" style={style} />
								)}
								{titleKey ? t(titleKey) : title}
							</span>
							<Separator mt="2" size="4" orientation="horizontal" decorative />
						</Dialog.Title>

						<Dialog.Description asChild>
							<section className="flex-1 overflow-y-auto pr-4">{content}</section>
						</Dialog.Description>

						<Dialog.Close asChild>
							<IconButton
								variant="soft"
								size="1"
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
