/**
 * Application toast notification system module.
 *
 * @remarks
 * This module provides the `NmsToast` component, a themed implementation of
 * Radix UI's toast primitive designed for high-visibility status updates.
 *
 * @see {@link NmsToast}
 * @see {@link ./Toast.stories.tsx Storybook}
 *
 * @category Components
 */

import type { ReactNode } from "react";
import { CheckCircledIcon, ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import {
	Description as ToastDescription,
	Root as ToastRoot,
	Title as ToastTitle,
} from "@radix-ui/react-toast";

import "./Toast.scss";

import { Button, Separator } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { hideSplashScreenAndShowBackground } from "../../utils/system/splashScreen";
import { ErrorDisplay } from "../ErrorBoundary/ErrorDisplay";

/**
 * Props for the `NmsToast` component.
 */
type ToastProps = {
	/** Whether the toast is currently visible on the screen. */
	open: boolean;
	/** Callback function triggered when the open state changes (e.g., auto-close or manual dismiss). */
	onOpenChange: (open: boolean) => void;
	/** The primary text to display at the top of the toast. **Must not be empty.** */
	title: string;
	/** The detailed message. Can be a string or complex React nodes. */
	description: string | ReactNode;
	/** The visual style and icon to use. */
	variant?: "success" | "error";
	/** Time in milliseconds before the toast auto-closes. Defaults to `5000`. */
	duration?: number;
};

/**
 * A customized toast notification component built using Radix UI.
 *
 * @remarks
 * It provides standardized success, error, and info variants with matching
 * icons and CSS class modifiers. It includes a progress-tracked auto-close
 * and a manual "Dismiss" button.
 *
 * @param {ToastProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered toast notification.
 *
 * @see {@link ErrorDisplay}
 * @see {@link hideSplashScreenAndShowBackground}
 * @see {@link ./Toast.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <NmsToast open={true} onOpenChange={setOpen} title="Error" description="Failed to save" variant="error" />
 * // renders error toast
 * ```
 */
export const NmsToast = ({
	open,
	onOpenChange,
	title,
	description,
	variant,
	duration = 5000,
}: ToastProps) => {
	const { t } = useTranslation();
	const titleClassName =
		variant === "error"
			? "Toast__title Toast__title--error"
			: variant === "success"
				? "Toast__title Toast__title--success"
				: "Toast__title";

	const icon =
		variant === "error" ? (
			<ExclamationTriangleIcon className="Toast__icon Toast__icon--error" />
		) : variant === "success" ? (
			<CheckCircledIcon className="Toast__icon Toast__icon--success" />
		) : (
			<InfoCircledIcon className="Toast__icon Toast__icon--info" />
		);

	return (
		<ToastRoot duration={duration} className="Toast" open={open} onOpenChange={onOpenChange}>
			<div className="Toast__title-container">
				{icon}
				<ToastTitle className={`${titleClassName} heading-styled mb-1`}>{title}</ToastTitle>
			</div>
			<Separator size="4" mb="1" />
			<ToastDescription className="Toast__description">{description}</ToastDescription>
			<Button
				className="Toast__close"
				aria-label={t("common.dismiss") ?? ""}
				variant="soft"
				size="2"
				mb="1"
				onClick={() => onOpenChange(false)}
			>
				{t("common.dismiss")}
			</Button>
		</ToastRoot>
	);
};
