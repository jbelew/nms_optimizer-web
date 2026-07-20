import React from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Box, Button, Flex, Text } from "@radix-ui/themes";

interface EmptyStateProps {
	actionLabel?: string;
	className?: string;
	description?: string;
	icon?: React.ReactNode;
	onAction?: () => void;
	title: string;
}

const DEFAULT_ICON = <InfoCircledIcon height="40" width="40" />;

/**
 * A standardized component for displaying empty states across the application.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
	actionLabel,
	className,
	description,
	icon = DEFAULT_ICON,
	onAction,
	title,
}) => {
	return (
		<Flex
			align="center"
			className={`empty-state p-6 ${className ?? ""}`}
			direction="column"
			gap="4"
			justify="center"
			style={{
				backgroundColor: "var(--gray-a2)",
				border: "1px dashed var(--gray-a6)",
				borderRadius: "var(--radius-3)",
				minHeight: "200px",
				textAlign: "center",
			}}
		>
			<Box style={{ color: "var(--gray-9)", opacity: 0.5 }}>{icon}</Box>
			<Flex direction="column" gap="1">
				<Text color="gray" size="4" weight="bold">
					{title}
				</Text>
				{description && (
					<Text color="gray" size="2">
						{description}
					</Text>
				)}
			</Flex>
			{actionLabel && onAction && (
				<Button onClick={onAction} size="2" variant="soft">
					{actionLabel}
				</Button>
			)}
		</Flex>
	);
};
