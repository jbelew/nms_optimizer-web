import type { ErrorInfo } from "react";

import { hideSplashScreenAndShowBackground } from "../../utils/splashScreen";
import { DefaultErrorMessage, ErrorDisplay } from "./ErrorDisplay";

import "../MainAppContent/MainAppContent.scss";

import { Card, Flex } from "@radix-ui/themes";

interface ErrorPageProps {
	error?: Error;
	errorInfo?: ErrorInfo;
}

export const ErrorPage = ({ error, errorInfo }: ErrorPageProps) => {
	console.log("ErrorBoundary: Rendering fallback UI.");
	hideSplashScreenAndShowBackground();

	return (
		<main className="main-app__container">
			<Card size="3" variant="surface" className="main-app__card">
				<Flex
					direction={{ initial: "column", md: "row" }}
					align={{ initial: "center", md: "start" }}
					className="main-app__content"
				>
					<ErrorDisplay error={error} errorInfo={errorInfo}>
						<DefaultErrorMessage />
					</ErrorDisplay>
				</Flex>
			</Card>
		</main>
	);
};
