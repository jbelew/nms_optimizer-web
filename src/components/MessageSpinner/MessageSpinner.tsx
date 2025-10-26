// src/components/MessageSpinner/MessageSpinner.tsx
import "./MessageSpinner.scss";

import React, { useEffect, useState } from "react";
import { Progress, Spinner, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

interface MessageSpinnerProps {
	isVisible: boolean;
	isInset?: boolean;
	useNMSFont?: boolean;
	initialMessage?: string;
	showRandomMessages?: boolean;
	color?: string;
	progressPercent?: number;
	status?: string;
}

/**
 * MessageSpinner component displays a loading spinner overlay with an initial message.
 * It can optionally show random messages after a delay for longer operations.
 *
 * @param {MessageSpinnerProps} props - The props for the MessageSpinner component.
 * @returns {JSX.Element | null} The rendered MessageSpinner component, or null if not visible.
 */
const MessageSpinner: React.FC<MessageSpinnerProps> = ({
	isInset = true,
	isVisible,
	initialMessage,
	useNMSFont,
	showRandomMessages = false,
	progressPercent,
	status,
}) => {
	const [, setShowAdditionalMessage] = useState(false);
	const [, setCurrentRandomMessage] = useState<string>("");
	const { t } = useTranslation(); // Destructure useNMSFont from props

	useEffect(() => {
		let timer: NodeJS.Timeout | null = null;

		if (showRandomMessages && isVisible) {
			const i18nRandomMessages = t("messageSpinner.randomMessages", {
				returnObjects: true,
			}) as string[];

			timer = setTimeout(() => {
				const randomIndex = Math.floor(Math.random() * i18nRandomMessages.length);
				setCurrentRandomMessage(i18nRandomMessages[randomIndex]);
				setShowAdditionalMessage(true); // Set to show after delay
			}, 2500);
		}

		// Cleanup function: This runs when the component unmounts OR when dependencies change
		return () => {
			if (timer) clearTimeout(timer);
			// Reset state here, ensuring it happens before the next effect run or unmount
			setShowAdditionalMessage(false);
			setCurrentRandomMessage("");
		};
	}, [isVisible, showRandomMessages, t]);

	// Use the isVisible prop to control rendering of the entire component
	if (!isVisible) return null;

	// Determine if the random message should be displayed based on state and props

	// Conditionally add classes based on isInset
	const containerClasses = `
    flex flex-col items-center justify-center z-10
    ${isInset ? "absolute inset-0" : ""}
  `;

	return (
		<div className={containerClasses.trim()}>
			{initialMessage === undefined || initialMessage === null ? (
				<Spinner className="messageSpinner__spinner" />
			) : (
				<Spinner className="messageSpinner__spinner--accent" />
			)}

			{initialMessage !== undefined && initialMessage !== null && (
				<>
					<Text
						className={`messageSpinner__header${useNMSFont ? "--nms" : ""} pt-4 pb-2 text-center text-xl sm:text-2xl`}
					>
						{initialMessage}
					</Text>

					<div className="w-1/2 sm:w-1/3">
						{isVisible && progressPercent !== undefined ? (
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

			{/* {showRandomMessages && (
				<Text
					className={`sm:text-normal messageSpinner__random text-center text-sm font-semibold shadow-sm ${
						displayRandomMessage
							? "messageSpinner__random--visible"
							: "messageSpinner__random--hidden"
					}`}
				>
					{currentRandomMessage}
				</Text>
			)} */}
		</div>
	);
};

export default MessageSpinner;
