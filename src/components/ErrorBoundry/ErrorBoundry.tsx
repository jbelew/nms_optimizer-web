// src/components/ErrorBoundary/ErrorBoundary.tsx
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Component, type ErrorInfo, type ReactNode } from "react";
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

	/**
	 * React lifecycle method that gets called when there is an error in the component
	 * or any of its children. This method updates the state so that the next render
	 * will show the error fallback UI.
	 *
	 * @param error - The error that was thrown
	 */
	static getDerivedStateFromError(error: Error) {
		console.log(
			"ErrorBoundary getDerivedStateFromError: Error caught. Returning { hasError: true, error }"
		);
		// Update state so the next render will show the fallback UI.
		return { hasError: true, error };
	}

	/**
	 * React lifecycle method that gets called after a component has thrown an error.
	 * This method can be used to log the error to an error reporting service.
	 *
	 * @param error - The error that was thrown
	 * @param errorInfo - An object with componentStack property containing information about which component threw the error
	 */
	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Uncaught error:", error, errorInfo);

		// Clear localStorage if an error is caught by the main boundary
		try {
			localStorage.clear();
			console.log("ErrorBoundary: localStorage cleared due to an unhandled error.");
		} catch (e) {
			console.error("ErrorBoundary: Failed to clear localStorage.", e);
		}

		ReactGA.event({
			category: "Error",
			action: "ErrorBoundary Catch",
			label: `${error.name}: ${error.message} - ComponentStack: ${errorInfo.componentStack?.split("\n")[1]?.trim() || "N/A"}`,
			nonInteraction: true,
		});
		this.setState({ errorInfo }); // Store errorInfo for display
	}

	/**
	 * Render method of the ErrorBoundary component. If there is an error, the method
	 * renders the error fallback UI. Otherwise, it renders the children.
	 */
	render() {
		// console.log("ErrorBoundary render. State:", JSON.parse(JSON.stringify(this.state)));
		if (this.state.hasError) {
			console.log("ErrorBoundary render: hasError is true. Rendering fallback UI.");
			hideSplashScreen();
			return (
				<main className="flex flex-col items-center justify-center lg:min-h-screen">
					<section className="relative mx-auto border rounded-none shadow-lg app lg:rounded-xl lg:shadow-xl backdrop-blur-xl bg-white/5">
						<div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-50">
							<ExclamationTriangleIcon
								className="w-16 h-16 shadow-md"
								style={{ color: "#C44A34" }}
							/>
							<h1
								className="pt-2 text-2xl font-semibold tracking-widest"
								style={{ color: "#e6c133", fontFamily: "GeosansLight" }}
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
								{this.state.error?.message && (
									<p>
										<strong>Error:</strong> {this.state.error.message}
									</p>
								)}
								{this.state.error?.stack && (
									<>
										<p className="mt-2">
											<strong>Stack Trace:</strong>
										</p>
										<pre>{this.state.error.stack}</pre>
									</>
								)}
								{this.state.errorInfo?.componentStack && (
									<>
										<p className="mt-2">
											<strong>Component Stack:</strong>
										</p>
										<pre>{this.state.errorInfo.componentStack}</pre>
									</>
								)}
							</div>
						</div>
					</section>
				</main>
			);
		}

		// Render the children if there is no error
		// console.log("ErrorBoundary render: No error. Rendering children.");
		return this.props.children;
	}
}

export default ErrorBoundary;
