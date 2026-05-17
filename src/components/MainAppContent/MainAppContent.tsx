// src/components/MainAppContent/MainAppContent.tsx
import "./MainAppContent.scss";

import { lazy, Suspense } from "react";
import { Flex } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { MessageSpinner } from "@/components/MessageSpinner/messageSpinner";

import { MainAppProvider } from "./MainAppContext";
import {
	BuildNameUtility,
	FilePickerUtility,
	MainAppBackgroundServices,
	MainAppFooter,
	MainAppGridSection,
	MainAppHeader,
	MainAppMobileToolbar,
	MainAppSidebarSection,
	OptimizationAlertUtility,
	ShipTypesLoader,
} from "./MainAppLayout";
import { useMainAppOptimization } from "./useMainAppContext";

const ErrorMessageRenderer = lazy(() =>
	import("@/components/ErrorMessageRenderer/ErrorMessageRenderer").then((m) => ({
		default: m.ErrorMessageRenderer,
	}))
);
const InstallPrompt = lazy(() =>
	import("@/components/InstallPrompt/InstallPrompt").then((m) => ({ default: m.InstallPrompt }))
);
const ToastRenderer = lazy(() =>
	import("@/components/Toast/ToastRenderer").then((m) => ({ default: m.ToastRenderer }))
);

/**
 * Component that renders the application layout structure.
 */
const MainAppLayoutContent = () => {
	const { t } = useTranslation();
	const { gridContainerRef } = useMainAppOptimization();

	return (
		<>
			<MainAppMobileToolbar />

			<a
				className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded focus:bg-(--accent-9) focus:px-4 focus:py-2 focus:text-white"
				href="#main-content"
			>
				Skip to main content
			</a>
			<main className="main-app__container" id="main-content">
				<div className="main-app__card lg:shadow-lg">
					<div className="main-app__background-wrapper">
						<MainAppHeader />

						<Suspense
							fallback={
								<Flex
									align="center"
									className="main-app__content"
									justify="center"
									style={{ minHeight: "400px", width: "100%" }}
								>
									<MessageSpinner
										initialMessage={t("techTree.loading")}
										isVisible={true}
									/>
								</Flex>
							}
						>
							<ShipTypesLoader />
							<Flex
								align={{ initial: "center", md: "start" }}
								className="main-app__content"
								direction={{ initial: "column", md: "row" }}
								ref={gridContainerRef}
							>
								<MainAppGridSection />
								<MainAppSidebarSection />
							</Flex>
						</Suspense>
					</div>

					<MainAppFooter position="bottom-mobile" />
				</div>

				<MainAppFooter position="bottom-desktop" />

				<MainAppBackgroundServices>
					<InstallPrompt />
					<OptimizationAlertUtility />
					<BuildNameUtility />
					<FilePickerUtility />
					<ErrorMessageRenderer />
					<ToastRenderer />
				</MainAppBackgroundServices>
			</main>
		</>
	);
};

/**
 * The primary layout component for the application's main functional area.
 */
export const MainAppContent = () => {
	return (
		<MainAppProvider>
			<MainAppLayoutContent />
		</MainAppProvider>
	);
};
