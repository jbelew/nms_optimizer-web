import React, { useEffect } from "react";
import { Link, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import { ErrorDisplay } from "@/components/ErrorBoundary/ErrorDisplay";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useOptimizeStore } from "@/store/ui/uiStore";

import "./ErrorContent.scss";

/**
 * A component for displaying detailed error information within a dialog.
 *
 * @remarks
 * It retrieves the active error state from `OptimizeStore`, renders a user-friendly
 * disruption message, and provides links for reporting the issue on GitHub.
 * It also handles automated analytics reporting of the error and stack trace.
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
 * <ErrorContent />
 * // mounts error details with GitHub issue links and automated error analytics
 * ```
 */
const ErrorContent: React.FC = () => {
	const { t } = useTranslation();
	const { sendEvent } = useAnalytics();
	const error = useOptimizeStore((state) =>
		state.status.type === "error" ? state.status.details : null
	);

	/**
	 * Manages the error-boundary CSS class and sends analytics events on mount.
	 */
	useEffect(() => {
		document.body.classList.add("error-boundary-visible");

		if (error) {
			sendEvent({
				action: error.name || "HandledError",
				category: "error",
				label: error.message,
				nonInteraction: true,
				stackTrace: error.stack?.replace(/\n/g, " ").substring(0, 500) || "N/A",
			});
		}

		return () => {
			document.body.classList.remove("error-boundary-visible");
		};
	}, [error, sendEvent]);

	return (
		<div className="errorContent">
			<span className="errorContent__title block pb-2 text-center text-xl font-semibold tracking-widest">
				{t("errorContent.signalDisruption")}
			</span>
			<Text as="p" mb="2" size={{ initial: "2", sm: "3" }}>
				<Trans
					components={{
						1: (
							<Link
								href="https://github.com/jbelew/nms_optimizer-web/issues"
								rel="noopener noreferrer"
								target="_blank"
								underline="always"
								weight="medium"
							/>
						),
					}}
					i18nKey="errorContent.serverErrorDetails"
				/>
			</Text>

			{error && (
				<div className="mt-4">
					<ErrorDisplay error={error} />
				</div>
			)}
		</div>
	);
};

export default ErrorContent;
