import type { ReactNode } from "react";
import * as Toast from "@radix-ui/react-toast";

import "./Toast.scss";

type ToastProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string | ReactNode;
	variant?: "success" | "error";
	duration?: number;
};

export const NmsToast = ({
	open,
	onOpenChange,
	title,
	description,
	variant,
	duration = 8000,
}: ToastProps) => {
	const titleClassName =
		variant === "error"
			? "ToastTitle ToastTitle--error"
			: variant === "success"
				? "ToastTitle ToastTitle--success"
				: "ToastTitle";

	return (
		<Toast.Root
			duration={duration}
			className="ToastRoot"
			open={open}
			onOpenChange={onOpenChange}
			onClick={() => onOpenChange(false)}
			onTouchEnd={() => onOpenChange(false)}
		>
			<Toast.Title className={`${titleClassName} mb-1`}>{title}</Toast.Title>
			<Toast.Description className="ToastDescription">{description}</Toast.Description>
		</Toast.Root>
	);
};
