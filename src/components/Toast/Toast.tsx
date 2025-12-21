import type { ReactNode } from "react";
import { CheckCircledIcon, ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import * as Toast from "@radix-ui/react-toast";

import "./Toast.scss";

import { Button, Separator } from "@radix-ui/themes";

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
		<Toast.Root
			duration={duration}
			className="Toast"
			open={open}
			onOpenChange={onOpenChange}
			onClick={() => onOpenChange(false)}
			onTouchEnd={() => onOpenChange(false)}
		>
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
				onClick={() => onOpenChange(false)}
			>
				Dismiss
			</Button>
		</Toast.Root>
	);
};
