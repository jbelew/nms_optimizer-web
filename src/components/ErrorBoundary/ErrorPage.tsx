import type { ErrorInfo } from "react";

import { hideSplashScreenAndShowBackground } from "../../utils/splashScreen";
import { DefaultErrorMessage, ErrorDisplay } from "./ErrorDisplay";

interface ErrorPageProps {
	error?: Error;
	errorInfo?: ErrorInfo;
}

export const ErrorPage = ({ error, errorInfo }: ErrorPageProps) => {
	console.log("ErrorBoundary: Rendering fallback UI.");
	hideSplashScreenAndShowBackground();

	return (
		<main className="flex flex-col items-center justify-center lg:min-h-screen">
			<section className="app w-auto rounded-none bg-white/5 shadow-none backdrop-blur-xl lg:rounded-xl lg:shadow-xl">
				<ErrorDisplay error={error} errorInfo={errorInfo}>
					<DefaultErrorMessage />
				</ErrorDisplay>
			</section>
		</main>
	);
};
