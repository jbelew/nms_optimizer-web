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
import { getPageByDialogTitleKey, getPageById } from "@shared/page-registry.js";
import { useTranslation } from "react-i18next";

import { getDialogIconAndStyle } from "@/utils/icons/iconRegistry";

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
 * Props for the {@link AppDialogTitle} component.
 */
export interface AppDialogTitleProps {
	children?: ReactNode;
	headerIcon?: ReactNode;
	pageId?: string;
	title?: string;
	titleKey?: string;
}

/**
 * Title component for AppDialog.
 *
 * @remarks
 * Resolves header title text and icon directly from the Page Registry when `pageId` or `titleKey` is provided.
 *
 * @param {AppDialogTitleProps} props - The component props.
 *
 * @returns {JSX.Element} The rendered dialog title.
 *
 * @category Components
 */
export const AppDialogTitle: React.FC<AppDialogTitleProps> = ({
	children,
	headerIcon,
	pageId,
	title,
	titleKey,
}) => {
	const { t } = useTranslation();
	const page = pageId ? getPageById(pageId) : undefined;
	const resolvedTitleKey = titleKey || page?.dialogTitleKey;
	const { IconComponent, style } = getDialogIconAndStyle(resolvedTitleKey);

	const displayTitle = children || (resolvedTitleKey ? t(resolvedTitleKey) : title);

	return (
		<div className="mr-2">
			<DialogTitle asChild>
				<h1 className="heading-styled flex items-start gap-2 text-xl sm:text-2xl">
					{(headerIcon || IconComponent) && (
						<div className="mt-px shrink-0 sm:mt-[4px]">
							{headerIcon ||
								(IconComponent && (
									<IconComponent className="h-6 w-6" style={style} />
								))}
						</div>
					)}
					<span className={headerIcon || IconComponent ? "mr-6" : ""}>
						{displayTitle}
					</span>
				</h1>
			</DialogTitle>
			<Separator color="cyan" decorative mt="2" orientation="horizontal" size="4" />
			<DialogDescription className="sr-only">{displayTitle}</DialogDescription>
		</div>
	);
};

/**
 * Props for the {@link AppDialogBody} component.
 */
export interface AppDialogBodyProps {
	children: ReactNode;
	pageId?: string;
	titleKey?: string;
}

/**
 * Content component for AppDialog.
 *
 * @remarks
 * Encapsulates the scrollable body content of the modal dialog and applies routed dialog padding.
 *
 * @param {AppDialogBodyProps} props - The component props.
 *
 * @returns {JSX.Element} The rendered dialog body section.
 *
 * @category Components
 */
export const AppDialogBody: React.FC<AppDialogBodyProps> = ({ children, pageId, titleKey }) => {
	const page = pageId ? getPageById(pageId) : getPageByDialogTitleKey(titleKey);
	const isRouted = page?.isDialog ?? false;

	return (
		<section
			className={`appDialog__scrollable-content flex-1 overflow-y-auto ${isRouted ? "pr-4" : "pr-2"}`}
		>
			{children}
		</section>
	);
};

/**
 * Props for the {@link AppDialogFooter} component.
 */
export interface AppDialogFooterProps {
	children: ReactNode;
}

/**
 * Footer component for AppDialog.
 *
 * @param {AppDialogFooterProps} props - The component props.
 *
 * @returns {JSX.Element} The rendered dialog footer.
 *
 * @category Components
 */
export const AppDialogFooter: React.FC<AppDialogFooterProps> = ({ children }) => {
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
	pageId?: string;
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
	pageId,
	size,
	title,
	titleKey,
}) => {
	const page = pageId ? getPageById(pageId) : undefined;
	const resolvedTitleKey = titleKey || page?.dialogTitleKey;
	const resolvedSize = size || page?.dialogSize || "default";

	return (
		<AppDialogRoot className={className} isOpen={isOpen} onClose={onClose} size={resolvedSize}>
			<AppDialogTitle
				headerIcon={headerIcon}
				pageId={pageId}
				title={title}
				titleKey={resolvedTitleKey}
			/>
			<AppDialogBody pageId={pageId} titleKey={resolvedTitleKey}>
				{content}
			</AppDialogBody>
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
