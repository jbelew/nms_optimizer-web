/**
 * Visual loading and progress status module.
 *
 * @remarks
 * This module provides the `MessageSpinner` component, which manages the
 * loading state UI, including randomized flavor text to engage users
 * during long-running operations.
 *
 * @see {@link MessageSpinner}
 *
 * @category Components
 */

import "./messageSpinner.scss";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Progress, Spinner, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

/**
 * Props for the `MessageSpinner` component.
 */
interface MessageSpinnerProps {
	/** The primary message to display below the spinner. */
	initialMessage?: string;
	/** If `true`, the spinner is absolutely positioned to cover its parent container. Defaults to `true`. */
	isInlay?: boolean;
	/** Whether the spinner and overlay are visible. */
	isVisible: boolean;
	/** The current progress value (0-100). */
	progressPercent?: number;
	/** Whether to display the progress bar alongside the spinner. */
	showProgress?: boolean;
}

/**
 * A comprehensive loading overlay component.
 *
 * @remarks
 * It features a spinning icon, a localized primary message, and an optional
 * progress bar. While visible, it cycles through a set of "random flavored"
 * status messages (e.g., "Adjusting warp coils...") to improve perceived performance.
 *
 * @param {MessageSpinnerProps} props - Component properties.
 *
 * @returns {JSX.Element | null} The rendered loading UI, or `null` if not visible.
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <MessageSpinner isVisible={solving} progressPercent={45} showProgress={true} initialMessage="Optimizing..." />
 * // renders loading overlay with progress bar
 * ```
 */
export const MessageSpinner: React.FC<MessageSpinnerProps> = ({
	initialMessage,
	isInlay = true,
	isVisible,
	progressPercent,
	showProgress,
}) => {
	const [currentRandomMessage, setCurrentRandomMessage] = useState<string>("");
	const [showRandomMessage, setShowRandomMessage] = useState<boolean>(false);
	const { t } = useTranslation();

	const i18nRandomMessages = t("messageSpinner.randomMessages", {
		returnObjects: true,
	}) as string[];

	const randomMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	/**
	 * Selects and fades in a new random flavor message.
	 */
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
	}, [isVisible, setRandomMessage]);

	if (!isVisible) {
		return null;
	}

	const containerClasses = `flex flex-col items-center justify-center z-10 ${
		isInlay ? "absolute inset-0" : ""
	}`;

	const hasMessage = initialMessage != null;

	return (
		<div aria-live="polite" className={containerClasses.trim()} role="status">
			<Spinner className="messageSpinner__spinner" />

			{hasMessage && (
				<>
					<Text className="heading-styled pt-4 pb-2 text-center text-xl sm:text-2xl">
						{initialMessage}
					</Text>

					<div className="w-3/4 sm:w-1/2">
						{progressPercent !== undefined && showProgress ? (
							<div className="mb-10 lg:mb-18">
								<Progress
									aria-label={
										initialMessage || t("messageSpinner.loadingProgress")
									}
									value={Math.min(
										isNaN(progressPercent) ? 0 : progressPercent,
										100
									)}
									variant="soft"
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
};
