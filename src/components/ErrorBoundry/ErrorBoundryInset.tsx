import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { ScrollArea } from "@radix-ui/themes";
import { hideSplashScreen } from "vite-plugin-splash-screen/runtime";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { sendEvent } from "../../utils/analytics";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorInfo?: ErrorInfo;
}

/**
 * A fallback component to be displayed when an error is caught by the ErrorBoundary.
 *
 * @returns {JSX.Element} The rendered fallback component.
 */
const ErrorFallback = () => {
	const isLarge = useBreakpoint("1024px");

	return isLarge ? (
		<ScrollArea
			className="gridContainer__sidebar rounded-md p-4 shadow-md"
			style={{ height: "526px", backgroundColor: "var(--accent-a2)" }}
		>
			<div className="flex h-full flex-col items-center justify-center overflow-auto p-8 text-center text-gray-50">
				<ExclamationTriangleIcon
					className="h-16 w-16 shrink-0 shadow-md"
					style={{ color: "var(--red-track)" }}
				/>
				<h1
					className="errorContent__title block text-center text-2xl font-semibold tracking-widest wrap-break-word"
					style={{ color: "var(--amber-track)", fontFamily: "GeosansLight" }}
				>
					-kzzkt- Error! -kzzkt-
				</h1>
				<h2 className="pb-4 font-semibold">
					Something went wrong. Please try reloading the page.
				</h2>
			</div>
		</ScrollArea>
	) : (
		<div className="mt-8">
			<div className="flex h-full flex-col items-center justify-center overflow-auto p-8 text-center text-gray-50">
				<ExclamationTriangleIcon
					className="h-16 w-16 shrink-0 shadow-md"
					style={{ color: "var(--red-track)" }}
				/>
				<h1
					className="errorContent__title block text-center text-2xl font-semibold tracking-widest wrap-break-word"
					style={{ color: "var(--amber-track)", fontFamily: "GeosansLight" }}
				>
					-kzzkt- Error! -kzzkt-
				</h1>
				<h2 className="pb-4 font-semibold">
					Something went wrong. Please try reloading the page.
				</h2>
			</div>
		</div>
	);
};

/**
 * ErrorBoundary component catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * It also attempts to clear localStorage and sends a Google Analytics event on error.
 */
class ErrorBoundaryInset extends Component<Props, State> {
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

		sendEvent({
			category: "error",
			action: error.name,
			label: error.message,
			nonInteraction: true,
			componentStack:
				errorInfo.componentStack?.replace(/\n/g, " ").substring(0, 100) || "N/A",
			stackTrace: error.stack?.replace(/\n/g, " ").substring(0, 500) || "N/A",
		});

		this.setState({ errorInfo });
	}

	render() {
		const { hasError } = this.state;

		if (hasError) {
			console.log("ErrorBoundary: Rendering fallback UI.");
			hideSplashScreen();

			return <ErrorFallback />;
		}
		return this.props.children;
	}
}

export default ErrorBoundaryInset;
