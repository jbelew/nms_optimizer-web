// src/components/AppDialog/AppDialog.tsx
import "./AppDialog.scss";

import type { ReactNode } from "react";
import React, { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { IconButton, Separator, Theme } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { getDialogIconAndStyle } from "../../utils/dialogIconMapping";

/** List of translation keys for dialogs that represent full routes. */
const ROUTED_DIALOG_TITLE_KEYS = [
	"about",
	"instructions",
	"userStats",
	"changelog",
	"translations",
];

/**
 * Props for the `AppDialog` component.
 */
interface AppDialogProps {
	/** Callback function triggered when the dialog requests to close. **Must be provided.** */
	onClose: () => void;
	/** Fallback static title if `titleKey` is not provided. */
	title?: string;
	/** Translation key for the dialog's localized title. */
	titleKey?: string;
	/** Whether the dialog is currently visible. */
	isOpen: boolean;
	/** The React components or text to render inside the dialog body. */
	content: ReactNode;
	/** Optional CSS class names to apply to the dialog content container. */
	className?: string;
}

/**
 * A reusable modal dialog component built on top of Radix UI.
 *
 * This component provides a consistent look and feel for all application modals,
 * including automated icon selection based on the title, standard scrollable
 * content areas, and keyboard navigation (Escape key support).
 *
 * @param {AppDialogProps} props - Component properties.
 * @returns {JSX.Element} The rendered dialog component.
 *
 * @example
 * <AppDialog
 *   isOpen={true}
 *   onClose={() => setOpen(false)}
 *   titleKey="dialogs.titles.about"
 *   content={<AboutContent />}
 * />
 */
const AppDialog: React.FC<AppDialogProps> = ({
	onClose,
	content,
	isOpen,
	titleKey,
	title = "Information",
	className = "",
}) => {
	/**
	 * Manages the Escape key listener for the dialog.
	 */
	useEffect(() => {
		/**
		 * Closes the dialog if the Escape key is pressed.
		 *
		 * @param {KeyboardEvent} event - The keyboard event.
		 * @example
		 */
		const handleEscapeKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();

		window.addEventListener("keydown", handleEscapeKey);

		return () => window.removeEventListener("keydown", handleEscapeKey);
	}, [onClose]);

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

						<Dialog.Description className="sr-only">
							{titleKey ? t(titleKey) : title}
						</Dialog.Description>

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

						<Dialog.Close asChild>
							<IconButton
								variant="ghost"
								size="1"
								className="dialog-close"
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
