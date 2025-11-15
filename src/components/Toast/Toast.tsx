import * as Toast from "@radix-ui/react-toast";

import "./Toast.scss";

type ToastProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
};

export const NmsToast = ({ open, onOpenChange, title, description }: ToastProps) => {
	return (
		<Toast.Root
			duration={10000}
			className="ToastRoot"
			open={open}
			onOpenChange={onOpenChange}
			onClick={() => onOpenChange(false)}
			onTouchEnd={() => onOpenChange(false)}
			style={{
				transform: "translateZ(0)",
				willChange: "transform, opacity",
				backfaceVisibility: "hidden",
			}}
		>
			<Toast.Title className="ToastTitle">{title}</Toast.Title>
			<Toast.Description className="ToastDescription">{description}</Toast.Description>
		</Toast.Root>
	);
};
