import { type FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes } from "react-router-dom";

import AppDialog from "./components/AppDialog/AppDialog";
import ErrorContent from "./components/AppDialog/ErrorContent";
import { MainAppContent } from "./components/MainAppContent/MainAppContent";
import { DialogProvider } from "./context/DialogContext";
import { useOptimizeStore } from "./store/OptimizeStore";

import "@radix-ui/themes/tokens/colors/amber.css";
import "@radix-ui/themes/tokens/colors/blue.css";
import "@radix-ui/themes/tokens/colors/green.css";
import "@radix-ui/themes/tokens/colors/iris.css";
import "@radix-ui/themes/tokens/colors/jade.css";
import "@radix-ui/themes/tokens/colors/orange.css";
import "@radix-ui/themes/tokens/colors/red.css";
import "@radix-ui/themes/tokens/colors/sky.css";
import "@radix-ui/themes/tokens/colors/teal.css";
import "@radix-ui/themes/tokens/colors/yellow.css";

// Import the new custom hooks
import { useAnalytics } from "./hooks/useAnalytics";
import { useSeoAndTitle } from "./hooks/useSeoAndTitle";
import { useUrlValidation } from "./hooks/useUrlValidation";

/**
 * The main application component. It sets up routing, analytics, internationalization,
 * and global state providers. It also handles dynamic document titles and SEO tags.
 * @returns {JSX.Element} The rendered App component.
 */
const App: FC = () => {
	const { t } = useTranslation();

	const appVersion: string = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "devmode";
	const build: string = (import.meta.env.VITE_BUILD_VERSION as string) ?? "devmode";

	const { showError, setShowError } = useOptimizeStore();

	// Use the new custom hooks
	useAnalytics(appVersion);
	useSeoAndTitle();
	useUrlValidation();

	const errorDialogContent = useMemo(() => <ErrorContent />, []);

	return (
		<>
			<DialogProvider>
				<MainAppContent buildVersion={build} />
			</DialogProvider>

			<Routes>
				<Route path="/" element={null} />
				<Route path="/changelog" element={null} />
				<Route path="/instructions" element={null} />
				<Route path="/about" element={null} />
				<Route path="/translation" element={null} />
			</Routes>

			<AppDialog
				isOpen={showError}
				onClose={() => setShowError(false)}
				content={errorDialogContent}
				titleKey="dialogs.titles.serverError"
				title={t("dialogs.titles.serverError")}
			/>
		</>
	);
};

export default App;
