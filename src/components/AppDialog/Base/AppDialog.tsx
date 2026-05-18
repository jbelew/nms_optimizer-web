import "./AppDialog.scss";

import type { ReactNode } from "react";
import React, { createContext, useEffect, useMemo } from "react";
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

import { getDialogIconAndStyle } from "@/utils/icons/iconRegistry";

/**
 * List of dialog title keys that require extra padding.
 */
const ROUTED_DIALOG_TITLE_KEYS = [
	"about",
	"instructions",
	"userStats",
	"changelog",
	"translations",
];

interface AppDialogContextValue {
	isOpen: boolean;
	onClose: () => void;
	size: "default" | "full" | "wide";
}

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

interface AppDialogProps {
	children: ReactNode;
	className?: string;
	isOpen: boolean;
	onClose: () => void;
	size?: "default" | "full" | "wide";
}

/**
 * A compound dialog component providing layout and context.
 */
export const AppDialogRoot: React.FC<AppDialogProps> = ({
	children,
	className = "",
	isOpen,
	onClose,
	size = "default",
}) => {
	const { t } = useTranslation();
	useEffect(() => {
		const handleEscapeKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
		window.addEventListener("keydown", handleEscapeKey);

		return () => window.removeEventListener("keydown", handleEscapeKey);
	}, [onClose]);

	const contextValue = useMemo(() => ({ isOpen, onClose, size }), [isOpen, onClose, size]);

	return (
		<AppDialogContext.Provider value={contextValue}>
			<DialogRoot onOpenChange={(open) => !open && onClose()} open={isOpen}>
				<DialogPortal>
					<Theme>
						<DialogOverlay className="appDialog__overlay" />
						<DialogContent
							className={`appDialog__content ${
								size !== "default" ? `appDialog__content--${size}` : ""
							} ${className}`}
						>
							{children}

							<DialogClose asChild>
								<IconButton
									aria-label={t("common.closeDialog")}
									className="dialog-close"
									size="1"
									variant="ghost"
								>
									<Cross2Icon />
								</IconButton>
							</DialogClose>
						</DialogContent>
					</Theme>
				</DialogPortal>
			</DialogRoot>
		</AppDialogContext.Provider>
	);
};

/**
 * Title component for AppDialog.
 */
export const AppDialogTitle: React.FC<{
	children?: ReactNode;
	headerIcon?: ReactNode;
	title?: string;
	titleKey?: string;
}> = ({ children, headerIcon, title, titleKey }) => {
	const { t } = useTranslation();
	const { IconComponent, style } = getDialogIconAndStyle(titleKey);

	const displayTitle = children || (titleKey ? t(titleKey) : title);

	return (
		<DialogTitle className="mr-2">
			<span className="heading-styled flex items-start gap-2 text-xl sm:text-2xl">
				{(headerIcon || IconComponent) && (
					<div className="mt-px shrink-0 sm:mt-[4px]">
						{headerIcon ||
							(IconComponent && <IconComponent className="h-6 w-6" style={style} />)}
					</div>
				)}
				<span className={headerIcon || IconComponent ? "mr-6" : ""}>{displayTitle}</span>
			</span>
			<Separator decorative mt="2" orientation="horizontal" size="4" />
			<DialogDescription className="sr-only">{displayTitle}</DialogDescription>
		</DialogTitle>
	);
};

/**
 * Content component for AppDialog.
 */
export const AppDialogBody: React.FC<{ children: ReactNode; titleKey?: string }> = ({
	children,
	titleKey,
}) => {
	const isRouted = ROUTED_DIALOG_TITLE_KEYS.includes((titleKey || "").split(".").pop() || "");

	return (
		<section
			className={`appDialog__scrollable-content flex-1 overflow-y-auto ${isRouted ? "pr-4" : "pr-2"}`}
		>
			{children}
		</section>
	);
};

/**
 * Footer component for AppDialog.
 */
export const AppDialogFooter: React.FC<{ children: ReactNode }> = ({ children }) => {
	return <div className="appDialog__footer">{children}</div>;
};

/**
 * Legacy compatibility component for AppDialog.
 */
interface LegacyAppDialogProps {
	className?: string;
	content: ReactNode;
	footer?: ReactNode;
	headerIcon?: ReactNode;
	isOpen: boolean;
	onClose: () => void;
	size?: "default" | "full" | "wide";
	title?: string;
	titleKey?: string;
}

const LegacyAppDialog: React.FC<LegacyAppDialogProps> = ({
	className,
	content,
	footer,
	headerIcon,
	isOpen,
	onClose,
	size,
	title,
	titleKey,
}) => {
	return (
		<AppDialogRoot className={className} isOpen={isOpen} onClose={onClose} size={size}>
			<AppDialogTitle headerIcon={headerIcon} title={title} titleKey={titleKey} />
			<AppDialogBody titleKey={titleKey}>{content}</AppDialogBody>
			{footer && <AppDialogFooter>{footer}</AppDialogFooter>}
		</AppDialogRoot>
	);
};

const AppDialog = Object.assign(LegacyAppDialog, {
	Body: AppDialogBody,
	Footer: AppDialogFooter,
	Root: AppDialogRoot,
	Title: AppDialogTitle,
});

export default AppDialog;
