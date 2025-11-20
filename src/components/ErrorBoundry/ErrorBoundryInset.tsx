import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Link, ScrollArea } from "@radix-ui/themes";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
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
 * Content and styling matches ErrorPage exactly, including stack trace display.
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
					Something went wrong! Try <strong>reloading the page</strong> to see if that
					resolves the issue. If the problem continues, please consider{" "}
					<Link
						href="https://github.com/jbelew/nms_optimizer-web/issues"
						target="_blank"
						rel="noopener noreferrer"
						underline="always"
					>
						filing a bug report
					</Link>
					.
				</h2>
				<div
					className="w-full text-left font-mono text-xs lg:text-base"
					style={{
						whiteSpace: "pre-wrap",
						overflowWrap: "break-word",
						wordBreak: "break-word",
						maxHeight: "200px",
					}}
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
		</ScrollArea>
	) : (
		<div className="mt-8">
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
					Something went wrong! Try <strong>reloading the page</strong> to see if that
					resolves the issue. If the problem continues, please consider{" "}
					<Link
						href="https://github.com/jbelew/nms_optimizer-web/issues"
						target="_blank"
						rel="noopener noreferrer"
						underline="always"
					>
						filing a bug report
					</Link>
					.
				</h2>
				<div
					className="w-full overflow-x-auto overflow-y-auto text-left font-mono text-xs lg:text-base"
					style={{
						whiteSpace: "pre-wrap",
						overflowWrap: "break-word",
						wordBreak: "break-word",
						maxHeight: "200px",
					}}
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
