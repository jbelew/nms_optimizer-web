// src/components/ErrorBoundary/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from "react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import ReactGA from "react-ga4";
import { hideSplashScreen } from "vite-plugin-splash-screen/runtime";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error) {
		console.log("ErrorBoundary: Caught error, updating state.");
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Uncaught error:", error, errorInfo);

		try {
			localStorage.clear();
			console.log("ErrorBoundary: Cleared localStorage.");
		} catch (e) {
			console.error("ErrorBoundary: Failed to clear localStorage.", e);
		}

		ReactGA.event({
			category: "Error",
			action: "ErrorBoundary Catch",
			label: `${error.name}: ${error.message} - ${errorInfo.componentStack?.split("\n")[1]?.trim() || "N/A"}`,
			nonInteraction: true,
		});

		this.setState({ errorInfo });
	}

	render() {
		const { hasError, error, errorInfo } = this.state;

		if (hasError) {
			console.log("ErrorBoundary: Rendering fallback UI.");
			hideSplashScreen();

			return (
				<main className="flex flex-col items-center justify-center lg:min-h-screen">
					<section className="w-auto rounded-none shadow-none app bg-white/5 backdrop-blur-xl lg:shadow-xl lg:rounded-xl">
						<div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-50">
							<ExclamationTriangleIcon
								className="w-16 h-16 shadow-md"
								style={{ color: "var(--red-track)" }}
							/>
							<h1
								className="block text-2xl font-semibold tracking-widest text-center errorContent__title"
								style={{ color: "var(--amber-track)", fontFamily: "GeosansLight" }}
							>
								-kzzkt- Error! -kzzkt-
							</h1>
							<h2 className="pb-4 font-semibold">
								Something went wrong. Please try reloading the page.
							</h2>
							<div
								className="w-full font-mono text-xs text-left lg:text-base"
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
										<pre>{error.stack}</pre>
									</>
								)}
								{errorInfo?.componentStack && (
									<>
										<p className="mt-2">
											<strong>Component Stack:</strong>
										</p>
										<pre>{errorInfo.componentStack}</pre>
									</>
								)}
							</div>
						</div>
					</section>
				</main>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
