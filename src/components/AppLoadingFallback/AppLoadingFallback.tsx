// src/components/AppLoadingFallback/AppLoadingFallback.tsx

import React from "react";
import { useTranslation } from "react-i18next";

import MessageSpinner from "../MessageSpinner/MessageSpinner";

/**
 * Fallback UI shown during initial application load or when main content suspends.
 */
const AppLoadingFallback: React.FC = () => {
	const { t } = useTranslation();

	return (
		<main className="flex flex-col items-center justify-center lg:min-h-screen">
			<MessageSpinner
				isVisible={true}
				isInset={true}
				initialMessage={t("loadingMessage")}
				showRandomMessages={false}
			/>
		</main>
	);
};

export default AppLoadingFallback;
