// src/components/MessageSpinner/MessageSpinner.tsx
import "./MessageSpinner.scss";

import React from "react";
import { Progress, Spinner, Text } from "@radix-ui/themes";

interface MessageSpinnerProps {
	isVisible: boolean;
	isInset?: boolean;
	useNMSFont?: boolean;
	initialMessage?: string;
	progressPercent?: number;
	status?: string;
}

/**
 * MessageSpinner component displays a loading spinner overlay with an optional message and progress bar.
 *
 * @param {MessageSpinnerProps} props - The props for the MessageSpinner component.
 * @returns {JSX.Element | null} The rendered MessageSpinner component, or null if not visible.
 */
const MessageSpinner: React.FC<MessageSpinnerProps> = ({
	isInset = true,
	isVisible,
	initialMessage,
	useNMSFont,
	progressPercent,
	status,
}) => {
	if (!isVisible) {
		return null;
	}

	const containerClasses = `flex flex-col items-center justify-center z-10 ${
		isInset ? "absolute inset-0" : ""
	}`;

	const hasMessage = initialMessage != null;

	return (
		<div className={containerClasses.trim()}>
			<Spinner className="messageSpinner__spinner" />

			{hasMessage && (
				<>
					<Text
						className={`messageSpinner__header${
							useNMSFont ? "--nms" : ""
						} pt-4 pb-2 text-center text-xl sm:text-2xl`}
					>
						{initialMessage}
					</Text>

					<div className="w-1/2 sm:w-1/3">
						{progressPercent !== undefined && useNMSFont === false ? (
							<div className="mb-10 lg:mb-18">
								<Progress value={Math.min(progressPercent, 100)} variant="soft" />
								<div className="flex justify-center pt-3 font-medium">
									<Text className="text-sm">{status || "\u00A0"}</Text>
								</div>
							</div>
						) : (
							<div className="h-1.5" />
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default MessageSpinner;
