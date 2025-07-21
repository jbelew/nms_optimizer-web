// src/components/InfoDialog/InfoDialog.tsx
import "./AppDialog.css";

import type { ReactNode } from "react";
import React, { useCallback, useEffect } from "react";
import {
	CounterClockwiseClockIcon,
	Cross2Icon,
	ExclamationTriangleIcon,
	GlobeIcon,
	InfoCircledIcon,
	QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import { Dialog, IconButton, Separator } from "@radix-ui/themes";

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
		>
			<Dialog.Content className="appDialog__content--markdown flex max-h-[70vh] w-[512px] max-w-[72vw] flex-col">
				<Dialog.Title className="pr-4">
					<span className="flex items-center gap-2 text-xl heading-styled sm:text-2xl">
						{IconComponent && <IconComponent className="inline w-6 h-6" style={style} />}
						{title}
					</span>
					<Separator mt="2" size="4" orientation="horizontal" decorative />
				</Dialog.Title>

				<Dialog.Description className="flex-1 pr-4 mt-4 overflow-y-auto">
					{content}
				</Dialog.Description>

				<Dialog.Close>
					<IconButton
						variant="soft"
						color="cyan"
						size="1"
						className="mt-4 appDialog__close"
						aria-label="Close dialog"
					>
						<Cross2Icon />
					</IconButton>
				</Dialog.Close>
			</Dialog.Content>
		</Dialog.Root>
	);
};

export default AppDialog;
