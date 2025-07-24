// src/components/MessageSpinner/MessageSpinner.tsx
import "./MessageSpinner.css";

import { Spinner, Text } from "@radix-ui/themes";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface MessageSpinnerProps {
	isVisible: boolean;
	isInset?: boolean;
	initialMessage: string;
	showRandomMessages?: boolean;
	color?: string;
}

/**
 * MessageSpinner component that displays a loading spinner overlay.
 * Can optionally show random messages after a delay for longer operations.
 */
const MessageSpinner: React.FC<MessageSpinnerProps> = ({
	isInset = true,
	isVisible,
	initialMessage,
	showRandomMessages = false,
}) => {
	const [showAdditionalMessage, setShowAdditionalMessage] = useState(false);
	const [currentRandomMessage, setCurrentRandomMessage] = useState<string>("");
	const { t } = useTranslation();

	useEffect(() => {
		let timer: NodeJS.Timeout | null = null;
		// Only run the random message logic if showRandomMessages is true and the spinner is visible
		if (showRandomMessages && isVisible) {
			// Fetch random messages from i18n. Ensure it's an array.
			const i18nRandomMessages = t("messageSpinner.randomMessages", {
				returnObjects: true,
			}) as string[];
			setShowAdditionalMessage(false); // Reset visibility when conditions change
			setCurrentRandomMessage(""); // Clear previous message

			timer = setTimeout(() => {
				const randomIndex = Math.floor(Math.random() * i18nRandomMessages.length);
				setCurrentRandomMessage(i18nRandomMessages[randomIndex]);
				setShowAdditionalMessage(true); // Set to show after delay
			}, 2500);

			// Cleanup function
			return () => {
				if (timer) clearTimeout(timer);
			};
		} else {
			// Ensure state is reset if conditions aren't met
			setShowAdditionalMessage(false);
			setCurrentRandomMessage("");
			return;
		}
		// Depend on both isVisible and showRandomMessages
	}, [isVisible, showRandomMessages, t]);

	// Use the isVisible prop to control rendering of the entire component
	if (!isVisible) return null;

	// Determine if the random message should be displayed based on state and props
	const displayRandomMessage = showRandomMessages && showAdditionalMessage;

	// Conditionally add classes based on isInset
	const containerClasses = `
    flex flex-col items-center justify-center bg-opacity-50
    ${isInset ? "absolute inset-0" : ""}
  `;

	return (
		<div className={containerClasses.trim()}>
			<Spinner className="messageSpinner__spinner" />

			{initialMessage && (
				<Text className="pt-4 text-xl text-center sm:text-2xl messageSpinner__header">
					{initialMessage}
				</Text>
			)}
			<Text
				className={`text-sm font-semibold text-center shadow-sm sm:text-normal messageSpinner__random ${
					displayRandomMessage
						? "messageSpinner__random--visible"
						: "messageSpinner__random--hidden"
				}`}
			>
				{displayRandomMessage ? currentRandomMessage : "\u00A0"}
			</Text>
		</div>
	);
};

export default MessageSpinner;
