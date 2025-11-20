import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { ScrollArea } from "@radix-ui/themes";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { ErrorDisplay, InsetErrorMessage } from "./ErrorDisplay";
import { handleError } from "./errorHandler";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorInfo?: ErrorInfo;
}

interface ErrorFallbackProps {
	error?: Error;
	errorInfo?: ErrorInfo;
}

/**
 * A fallback component to be displayed when an error is caught by the ErrorBoundaryInset.
 * This is designed to fit within a container (inset) rather than taking up the full page.
 *
 * @returns {JSX.Element} The rendered fallback component.
 */
const ErrorFallback = ({ error, errorInfo }: ErrorFallbackProps) => {
	const isLarge = useBreakpoint("1024px");

	return isLarge ? (
		<ScrollArea
			className="gridContainer__sidebar rounded-md p-4 shadow-md"
			style={{ height: "526px", backgroundColor: "var(--accent-a2)" }}
		>
			<ErrorDisplay error={error} errorInfo={errorInfo}>
				<InsetErrorMessage />
			</ErrorDisplay>
		</ScrollArea>
	) : (
		<div className="mt-8">
			<ErrorDisplay error={error} errorInfo={errorInfo}>
				<InsetErrorMessage />
			</ErrorDisplay>
		</div>
	);
};

/**
 * ErrorBoundaryInset component catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays an inset fallback UI instead of the component tree that crashed.
 * Unlike the standard ErrorBoundary, this is designed to fit within a container rather than
 * taking up the full page.
 */
class ErrorBoundaryInset extends Component<Props, State> {
	/**
	 * Creates an instance of ErrorBoundaryInset.
	 * @param {Props} props - The props for the ErrorBoundaryInset component.
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
		console.log("ErrorBoundaryInset: Caught error, updating state.");
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
			return <ErrorFallback error={error} errorInfo={errorInfo} />;
		}

		return this.props.children;
	}
}

export default ErrorBoundaryInset;
