import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

import { ErrorContent } from "./ErrorContent";
import { handleError } from "./errorHandler";

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
		handleError(error, errorInfo);
		this.setState({ errorInfo });
	}

	render() {
		const { hasError, error, errorInfo } = this.state;

		if (hasError) {
			return <ErrorContent error={error} errorInfo={errorInfo} variant="page" />;
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
