// src/components/MessageSpinner/MessageSpinner.tsx
import "./MessageSpinner.scss";

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Progress, Spinner, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

interface MessageSpinnerProps {
	isVisible: boolean;
	isInlay?: boolean;
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
const MessageSpinner: React.FC<MessageSpinnerProps> = memo(
	({ isInlay = true, isVisible, initialMessage, useNMSFont, progressPercent }) => {
		const [currentRandomMessage, setCurrentRandomMessage] = useState<string>("");
		const [showRandomMessage, setShowRandomMessage] = useState<boolean>(false);
		const { t } = useTranslation();

		const i18nRandomMessages = useMemo(
			() =>
				t("messageSpinner.randomMessages", {
					returnObjects: true,
				}) as string[],
			[t]
		);

		const randomMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

		const setRandomMessage = useCallback(() => {
			setShowRandomMessage(false); // Fade out
			randomMessageTimeoutRef.current = setTimeout(() => {
				const randomIndex = Math.floor(Math.random() * i18nRandomMessages.length);
				setCurrentRandomMessage(i18nRandomMessages[randomIndex]);
				setShowRandomMessage(true); // Fade in
			}, 500); // Corresponds to the transition duration
		}, [i18nRandomMessages]);

		useEffect(() => {
			let messageTimeout: NodeJS.Timeout | null = null;

			if (isVisible) {
				// Set the first message after a delay
				messageTimeout = setTimeout(setRandomMessage, 500); // Fade in after 500ms
			}

			// Cleanup function
			return () => {
				if (messageTimeout) {
					clearTimeout(messageTimeout);
				}
			};
		}, [isVisible, setRandomMessage]);

		useEffect(() => {
			if (!isVisible) {
				if (randomMessageTimeoutRef.current) {
					clearTimeout(randomMessageTimeoutRef.current);
					randomMessageTimeoutRef.current = null;
				}

				// Track this timeout to avoid memory leaks on unmount
				const resetTimeout = setTimeout(() => {
					setCurrentRandomMessage("");
					setShowRandomMessage(false);
				}, 0);

				return () => {
					clearTimeout(resetTimeout);
				};
			}
		}, [isVisible]);

		if (!isVisible) {
			return null;
		}

		const containerClasses = `flex flex-col items-center justify-center z-10 ${
			isInlay ? "absolute inset-0" : ""
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

						<div className="w-3/4 sm:w-1/2">
							{progressPercent !== undefined && useNMSFont === false ? (
								<div className="mb-10 lg:mb-18">
									<Progress
										value={Math.min(progressPercent, 100)}
										variant="soft"
										aria-label={
											initialMessage || t("messageSpinner.loadingProgress")
										}
									/>
									<div className="flex h-12 justify-center pt-3 font-medium">
										<Text
											className={`messageSpinner__random w-full text-center text-xs sm:text-sm ${
												showRandomMessage
													? "messageSpinner__random--visible"
													: ""
											}`}
										>
											{currentRandomMessage || "\u00A0"}
										</Text>
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
	}
);

export default MessageSpinner;
