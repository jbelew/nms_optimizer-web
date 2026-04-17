import React, { useEffect } from "react";
import { Close as DialogClose } from "@radix-ui/react-dialog";
import { Button, Flex, Link, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import { useAnalytics } from "../../../hooks/useAnalytics/useAnalytics";
import { useOptimizeStore } from "../../../store/app/optimizeStore";
import { ErrorDisplay } from "../../ErrorBoundary/ErrorDisplay";

import "./ErrorContent.scss";

/**
 * Props for the `ErrorContent` component.
 *
 * @category Components
 */
interface ErrorContentProps {
	/** Callback function triggered when the error UI is dismissed. */
	onClose: () => void;
}

/**
 * A component for displaying detailed error information within a dialog.
 *
 * @remarks
 * It retrieves the active error state from `OptimizeStore`, renders a user-friendly
 * disruption message, and provides links for reporting the issue on GitHub.
 * It also handles automated analytics reporting of the error and stack trace.
 *
 * @param {ErrorContentProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered error content.
 *
 * @see {@link useAnalytics}
 * @see {@link useOptimizeStore}
 * @see {@link ErrorDisplay}
 * @see {@link ./ErrorContent.test.tsx Unit Tests}
 * @see {@link ./ErrorContent.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ErrorContent onClose={() => setDialogOpen(false)} />
 * // mounts error details with GitHub issue links and automated error analytics
 * ```
 */
const ErrorContent: React.FC<ErrorContentProps> = ({ onClose }) => {
	const { t } = useTranslation();
	const { sendEvent } = useAnalytics();
	const errorType = useOptimizeStore((state) => state.errorType);
	const error = useOptimizeStore((state) => state.error);

	/**
	 * Manages the error-boundary CSS class and sends analytics events on mount.
	 */
	useEffect(() => {
		document.body.classList.add("error-boundary-visible");

		if (error) {
			sendEvent({
				category: "error",
				action: error.name || "HandledError",
				label: error.message,
				nonInteraction: true,
				stackTrace: error.stack?.replace(/\n/g, " ").substring(0, 500) || "N/A",
			});
		}

		return () => {
			document.body.classList.remove("error-boundary-visible");
		};
	}, [error, sendEvent]);

	/**
	 * Reloads the browser page to attempt recovery from a fatal error.
	 *
	 * @returns {void}
	 *
	 * @example Interaction handler
	 * ```typescript
	 * handleRetry();
	 * ```
	 */
	const handleRetry = () => {
		window.location.reload();
	};

	return (
		<>
			<span className="errorContent__title block pb-2 text-center text-xl font-semibold tracking-widest">
				{t("errorContent.signalDisruption")}
			</span>
			<Text size={{ initial: "2", sm: "3" }} as="p" mb="2">
				<Trans
					i18nKey="errorContent.serverErrorDetails"
					components={{
						1: (
							<Link
								href="https://github.com/jbelew/nms_optimizer-web/issues"
								target="_blank"
								rel="noopener noreferrer"
								underline="always"
								weight="medium"
							/>
						),
					}}
				/>
			</Text>

			{error && (
				<div>
					<ErrorDisplay error={error} />
				</div>
			)}

			<Flex gap="2" mt="6" mb="2" justify="end">
				{errorType === "fatal" ? (
					<Button onClick={handleRetry}>Retry</Button>
				) : (
					<DialogClose asChild>
						<Button onClick={onClose}>{t("dialogs.userStats.closeButton")}</Button>
					</DialogClose>
				)}
			</Flex>
		</>
	);
};

export default ErrorContent;
