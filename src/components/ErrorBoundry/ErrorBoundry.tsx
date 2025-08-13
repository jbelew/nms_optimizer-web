import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import ReactGA from "react-ga4";
import { hideSplashScreen } from "vite-plugin-splash-screen/runtime";

// src/components/ErrorBoundary/ErrorBoundary.tsx

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorInfo?: ErrorInfo;
}

/**
 * ErrorBoundary component catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * It also attempts to clear localStorage and sends a Google Analytics event on error.
 */
class ErrorBoundary extends Component<Props, State> {
	/**
	 * Creates an instance of ErrorBoundary.
	 * @param {Props} props - The props for the ErrorBoundary component.
	 */
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	/**
	 * Static method to update state when an error is caught.
	 * @param {Error} error - The error that was thrown.
	 * @returns {{ hasError: boolean; error: Error }} An object to update the state.
	 */
	static getDerivedStateFromError(error: Error) {
		console.log("ErrorBoundary: Caught error, updating state.");
		return { hasError: true, error };
	}

	/**
	 * Lifecycle method to catch errors and log them.
	 * @param {Error} error - The error that was thrown.
	 * @param {ErrorInfo} errorInfo - Information about the component stack where the error occurred.
	 */
	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Uncaught error:", error, errorInfo);

		try {
			localStorage.clear();
			console.log("ErrorBoundary: Cleared localStorage.");
		} catch (e) {
			console.error("ErrorBoundary: Failed to clear localStorage.", e);
		}

		ReactGA.event(error.name, {
			category: "Error",
			action: "ErrorBoundary Catch",
			label: error.message,
			nonInteraction: true,
			componentStack:
				errorInfo.componentStack?.replace(/\n/g, " ").substring(0, 100) || "N/A",
			stackTrace: error.stack?.replace(/\n/g, " ").substring(0, 500) || "N/A",
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
							<h2 className="pb-4 font-semibold">
								Something went wrong. Please try reloading the page.
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
