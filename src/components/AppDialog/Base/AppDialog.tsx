import "./AppDialog.scss";

import type { ReactNode } from "react";
import React, { useEffect } from "react";
import {
	Close as DialogClose,
	Content as DialogContent,
	Description as DialogDescription,
	Overlay as DialogOverlay,
	Portal as DialogPortal,
	Root as DialogRoot,
	Title as DialogTitle,
} from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { IconButton, Separator, Theme } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { getDialogIconAndStyle } from "../../../utils/icons/iconRegistry";

/**
 * List of dialog title keys that require extra padding.
 *
 * @remarks
 * These keys correspond to full routed pages that render longer, page-like content.
 * Applying additional padding (`pr-4`) to the scrollable content area ensures
 * that the scrollbar does not overlap the text on smaller viewports.
 *
 * @category Components
 */
const ROUTED_DIALOG_TITLE_KEYS = [
	"about",
	"instructions",
	"userStats",
	"changelog",
	"translations",
];

/**
 * Properties for the `AppDialog` component.
 *
 * @remarks
 * Defines the configuration for the modal dialog, including visibility state,
 * title localization, and content to be rendered.
 *
 * @see {@link AppDialog}
 *
 * @category Components
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
	/**
	 * The visual size of the dialog.
	 * - `default`: Standard width (520px max).
	 * - `wide`: Increased width (840px max) for charts/large content.
	 * - `full`: Maximum width (1200px max).
	 *
	 * @default "default"
	 */
	size?: "default" | "wide" | "full";
	/** Optional custom avatar or element to render before the title. */
	headerIcon?: ReactNode;
	/** Optional footer content (e.g., action buttons) rendered below the scrollable area. */
	footer?: ReactNode;
}

/**
 * A reusable modal dialog component built on top of Radix UI.
 *
 * @remarks
 * This component provides a consistent look and feel for all application modals,
 * including automated icon selection based on the title, standard scrollable
 * content areas, and keyboard navigation (Escape key support).
 *
 * @param {AppDialogProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered dialog component.
 *
 * @see {@link AppDialogProps}
 * @see {@link getDialogIconAndStyle}
 * @see {@link ./AppDialog.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <AppDialog
 *   isOpen={true}
 *   onClose={() => setOpen(false)}
 *   titleKey="dialogs.titles.about"
 *   content={<AboutContent />}
 * />
 * // mounts a modal dialog with the "about" icon and translated title
 * ```
 */
const AppDialog: React.FC<AppDialogProps> = ({
	onClose,
	content,
	isOpen,
	titleKey,
	title = "Information",
	className = "",
	size = "default",
	headerIcon,
	footer,
}) => {
	/**
	 * Manages the Escape key listener for the dialog.
	 */
	useEffect(() => {
		/**
		 * Closes the dialog if the Escape key is pressed.
		 *
		 * @param {KeyboardEvent} event - The keyboard event.
		 *
		 * @returns {void}
		 *
		 * @example Interaction handler
		 * ```typescript
		 * handleEscapeKey(event);
		 * ```
		 */
		const handleEscapeKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();

		window.addEventListener("keydown", handleEscapeKey);

		return () => window.removeEventListener("keydown", handleEscapeKey);
	}, [onClose]);

	const { t } = useTranslation();

	const { IconComponent, style } = getDialogIconAndStyle(titleKey);

	return (
		<DialogRoot open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogPortal>
				<Theme>
					<DialogOverlay className="appDialog__overlay" />
					<DialogContent
						className={`appDialog__content ${
							size !== "default" ? `appDialog__content--${size}` : ""
						} ${className}`}
					>
						<DialogTitle className="mr-2">
							<span className="heading-styled flex items-start gap-2 text-xl sm:text-2xl">
								{(headerIcon || IconComponent) && (
									<div className="mt-px shrink-0 sm:mt-[4px]">
										{headerIcon ||
											(IconComponent && (
												<IconComponent className="h-6 w-6" style={style} />
											))}
									</div>
								)}
								<span className={headerIcon || IconComponent ? "mr-6" : ""}>
									{titleKey ? t(titleKey) : title}
								</span>
							</span>
							<Separator mt="2" size="4" orientation="horizontal" decorative />
						</DialogTitle>

						<DialogDescription className="sr-only">
							{titleKey ? t(titleKey) : title}
						</DialogDescription>

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

						{footer && <div className="appDialog__footer">{footer}</div>}

						<DialogClose asChild>
							<IconButton
								variant="ghost"
								size="1"
								className="dialog-close"
								aria-label={t("common.closeDialog") ?? ""}
							>
								<Cross2Icon />
							</IconButton>
						</DialogClose>
					</DialogContent>
				</Theme>
			</DialogPortal>
		</DialogRoot>
	);
};

export default AppDialog;
