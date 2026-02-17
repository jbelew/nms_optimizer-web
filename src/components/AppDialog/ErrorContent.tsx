import React, { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button, Flex, Link, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { useOptimizeStore } from "../../store/OptimizeStore";
import { ErrorDisplay } from "../ErrorBoundary/ErrorDisplay";

interface ErrorContentProps {
	onClose: () => void;
}

/**
 * ErrorContent component displays an error message and provides a link to report issues.
 * It is typically used within a dialog.
 *
 * @param {ErrorContentProps} props - The props for the ErrorContent component.
 * @returns {JSX.Element} The rendered ErrorContent component.
 */
const ErrorContent: React.FC<ErrorContentProps> = ({ onClose }) => {
	const { t } = useTranslation();
	const { sendEvent } = useAnalytics();
	const errorType = useOptimizeStore((state) => state.errorType);
	const error = useOptimizeStore((state) => state.error);

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
					<Dialog.Close asChild>
						<Button onClick={onClose}>{t("dialogs.userStats.closeButton")}</Button>
					</Dialog.Close>
				)}
			</Flex>
		</>
	);
};

export default React.memo(ErrorContent);
