import type { ReactNode } from "react";
import { CheckCircledIcon, ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import * as Toast from "@radix-ui/react-toast";

import "./Toast.scss";

import { Button, Separator } from "@radix-ui/themes";

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
 * It provides standardized success, error, and info variants with matching
 * icons and CSS class modifiers. It includes a progress-tracked auto-close
 * and a manual "Dismiss" button.
 *
 * @param {ToastProps} props - Component properties.
 * @returns {JSX.Element} The rendered toast notification.
 *
 * @example
 * <NmsToast open={true} onOpenChange={setOpen} title="Error" description="Failed to save" variant="error" />
 */
export const NmsToast = ({
	open,
	onOpenChange,
	title,
	description,
	variant,
	duration = 5000,
}: ToastProps) => {
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
		<Toast.Root duration={duration} className="Toast" open={open} onOpenChange={onOpenChange}>
			<div className="Toast__title-container">
				{icon}
				<Toast.Title className={`${titleClassName} heading-styled mb-1`}>
					{title}
				</Toast.Title>
			</div>
			<Separator size="4" mb="1" />
			<Toast.Description className="Toast__description">{description}</Toast.Description>
			<Button
				className="Toast__close"
				aria-label="Dismiss"
				variant="soft"
				size="2"
				mb="1"
				onClick={() => onOpenChange(false)}
			>
				Dismiss
			</Button>
		</Toast.Root>
	);
};
