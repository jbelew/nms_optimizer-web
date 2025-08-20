// src/components/MessageSpinner/MessageSpinner.tsx
import "./MessageSpinner.css";

import React, { useEffect, useState } from "react";
import { Spinner, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

interface MessageSpinnerProps {
	isVisible: boolean;
	isInset?: boolean;
	useNMSFont?: boolean;
	initialMessage?: string;
	showRandomMessages?: boolean;
	color?: string;
}

/**
 * MessageSpinner component displays a loading spinner overlay with an initial message.
 * It can optionally show random messages after a delay for longer operations.
 *
 * @param {MessageSpinnerProps} props - The props for the MessageSpinner component.
 * @param {boolean} props.isVisible - Controls the visibility of the spinner.
 * @param {boolean} [props.isInset=true] - If true, the spinner will be absolutely positioned and cover its parent.
 * @param {string} props.initialMessage - The message to display immediately with the spinner.
 * @param {boolean} [props.showRandomMessages=false] - If true, random messages will appear after a delay.
 * @returns {JSX.Element | null} The rendered MessageSpinner component, or null if not visible.
 */
const MessageSpinner: React.FC<MessageSpinnerProps> = ({
	isInset = true,
	isVisible,
	initialMessage,
	useNMSFont,
	showRandomMessages = false,
}) => {
	const [showAdditionalMessage, setShowAdditionalMessage] = useState(false);
	const [currentRandomMessage, setCurrentRandomMessage] = useState<string>("");
	const { t } = useTranslation(); // Destructure useNMSFont from props

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
				<Text
					className={`messageSpinner__header${useNMSFont ? "--nms" : ""} pt-4 text-center text-xl sm:text-2xl`}
				>
					{initialMessage}
				</Text>
			)}

			{showRandomMessages && (
				<Text
					className={`sm:text-normal messageSpinner__random text-center text-sm font-semibold shadow-sm ${
						displayRandomMessage
							? "messageSpinner__random--visible"
							: "messageSpinner__random--hidden"
					}`}
				>
					{currentRandomMessage}
				</Text>
			)}
		</div>
	);
};

export default MessageSpinner;
