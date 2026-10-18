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

import "./MessageSpinner.scss";

import React, { useEffect, useState } from "react";
import { Progress, Spinner, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

/** Delay in milliseconds before fading in the flavor message during a solve. */
export const FLAVOR_MESSAGE_DELAY_MS = 750;

/**
 * Props for the `MessageSpinner` component.
 *
 * @category Components
 */
export interface MessageSpinnerProps {
	/** The primary message to display. */
	initialMessage?: string;
	/** If `true`, the overlay is absolutely positioned to cover its parent container. Defaults to `true`. */
	isInlay?: boolean;
	/** Whether the loading or progress overlay is visible. */
	isVisible: boolean;
	/** The current progress value (0-100). */
	progressPercent?: number;
	/** Whether to display the progress bar instead of the indeterminate spinner. */
	showProgress?: boolean;
}

/**
 * Subcomponent that selects and fades in a single randomized flavor message
 * after a short delay so quick solves complete without visual clutter.
 *
 * @returns The rendered flavor text element.
 */
const DelayedFlavorMessage: React.FC = () => {
	const { t } = useTranslation();
	const [message, setMessage] = useState<string>("");

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			const randomMessages = t("messageSpinner.randomMessages", {
				returnObjects: true,
			});

			if (Array.isArray(randomMessages) && randomMessages.length > 0) {
				const randomIndex = Math.floor(Math.random() * randomMessages.length);
				const selected = randomMessages[randomIndex];

				if (typeof selected === "string") {
					setMessage(selected);
				}
			}
		}, FLAVOR_MESSAGE_DELAY_MS);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [t]);

	return (
		<div className="flex h-12 justify-center pt-3 font-medium">
			<Text
				className={`MessageSpinner__random w-full text-center text-xs sm:text-sm ${
					message ? "MessageSpinner__random--visible" : ""
				}`}
			>
				{message || "\u00A0"}
			</Text>
		</div>
	);
};

/**
 * A loading and optimization progress overlay component.
 *
 * @remarks
 * Renders an indeterminate `<Spinner />` with an optional localized heading when
 * `showProgress` is omitted or `false` (e.g., Suspense skeletons). When `showProgress`
 * is `true` (e.g., during layout optimization), hides the `<Spinner />` and instead
 * displays a determinate `<Progress />` bar accompanied by a delayed flavor message.
 *
 * @param props - Component properties.
 *
 * @returns The rendered loading or progress UI, or `null` if not visible.
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <MessageSpinner
 *   isVisible={solving}
 *   progressPercent={45}
 *   showProgress={true}
 *   initialMessage="Optimizing!"
 * />
 * // renders progress overlay without spinner
 * ```
 */
export const MessageSpinner: React.FC<MessageSpinnerProps> = ({
	initialMessage,
	isInlay = true,
	isVisible,
	progressPercent,
	showProgress = false,
}) => {
	const { t } = useTranslation();

	if (!isVisible) {
		return null;
	}

	const containerClasses = `flex flex-col items-center justify-center z-10 ${
		isInlay ? "absolute inset-0" : ""
	}`;

	const hasMessage = initialMessage != null;
	const hasProgress = showProgress && progressPercent !== undefined;

	return (
		<div
			aria-live="polite"
			className={containerClasses.trim()}
			role="status"
		>
			{!showProgress && <Spinner className="MessageSpinner__spinner" />}

			{hasMessage && (
				<>
					<Text className="heading-styled pt-4 pb-2 text-center text-xl sm:text-2xl">
						{initialMessage}
					</Text>

					{hasProgress && (
						<div className="w-3/4 sm:w-1/2">
							<Progress
								aria-label={initialMessage || t("messageSpinner.loadingProgress")}
								value={Math.min(isNaN(progressPercent) ? 0 : progressPercent, 100)}
								variant="soft"
							/>
							<DelayedFlavorMessage />
						</div>
					)}
				</>
			)}
		</div>
	);
};
