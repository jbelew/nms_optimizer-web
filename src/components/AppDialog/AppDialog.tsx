// src/components/InfoDialog/InfoDialog.tsx
import "./AppDialog.scss";

import type { ReactNode } from "react";
import React, { useCallback, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { IconButton, Separator, Theme } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { getDialogIconAndStyle } from "../../utils/dialogIconMapping";

const ROUTED_DIALOG_TITLE_KEYS = [
	"about",
	"instructions",
	"userStats",
	"changelog",
	"translations",
];

/**
 * @interface AppDialogProps
 * @property {() => void} onClose - Callback to be called when the dialog is closed.
 * @property {string} [title] - The title of the dialog.
 * @property {string} [titleKey] - The translation key for the title.
 * @property {boolean} isOpen - Whether the dialog is open.
 * @property {ReactNode} content - The content to be displayed in the dialog.
 */
interface AppDialogProps {
	onClose: () => void;
	title?: string;
	titleKey?: string; // Add a prop for the translation key
	isOpen: boolean;
	content: ReactNode;
	className?: string;
}

/**
 * A reusable dialog component for displaying various types of content.
 *
 * @returns {React.ReactElement} - The rendered dialog component.
 */
const AppDialog: React.FC<AppDialogProps> = ({
	onClose,
	content,
	isOpen,
	titleKey, // Use the new prop
	title = "Information",
	className = "",
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
					<Dialog.Content className={`appDialog__content ${className}`}>
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
							<section
								className={`appDialog__scrollable-content flex-1 overflow-y-auto ${
									ROUTED_DIALOG_TITLE_KEYS.includes(
										(titleKey || "").split(".").pop() || ""
									)
										? "pr-4"
										: "pr-2"
								}`}
							>
								{content}
							</section>
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
