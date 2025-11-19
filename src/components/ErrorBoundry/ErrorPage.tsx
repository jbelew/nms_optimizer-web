import { ErrorInfo } from "react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { hideSplashScreenAndShowBackground } from "../../utils/splashScreen";

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
				<div className="flex h-full flex-col items-center justify-center p-8 text-center text-gray-50">
					<ExclamationTriangleIcon
						className="h-16 w-16 shadow-md"
						style={{ color: "var(--red-track)" }}
					/>
					<h1
						className="errorContent__title block text-center text-2xl font-semibold tracking-widest"
						style={{ color: "var(--amber-track)", fontFamily: "GeosansLight" }}
					>
						-kzzkt- Error! -kzzkt-
					</h1>
					<h2 className="pb-4 text-sm sm:text-base">
						Something went wrong. You may be viewing an{" "}
						<strong>outdated version</strong> of this page. Please{" "}
						<strong>reload</strong> to get the latest updates.
					</h2>
					<div
						className="w-full text-left font-mono text-xs lg:text-base"
						style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}
					>
						{error?.message && (
							<p>
								<strong>Error:</strong> {error.message}
							</p>
						)}
						{error?.stack && (
							<>
								<p className="mt-2">
									<strong>Stack Trace:</strong>
								</p>
								{error.stack}
							</>
						)}
						{errorInfo?.componentStack && (
							<>
								<p className="mt-2">
									<strong>Component Stack:</strong>
								</p>
								{errorInfo.componentStack}
							</>
						)}
					</div>
				</div>
			</section>
		</main>
	);
};
