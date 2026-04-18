/**
 * Component for rendering technical error details and stack traces.
 *
 * @remarks
 * This module provides the `ErrorDisplay` component, which formats complex
 * error information for developer and power-user debugging.
 *
 * @see {@link ErrorDisplay}
 * @see {@link ./ErrorDisplay.test.tsx Unit Tests}
 *
 * @category Components
 */

import type { ErrorInfo, ReactNode } from "react";

import "./ErrorBoundary.scss";

import { Code } from "@radix-ui/themes";

/**
 * Props for the `ErrorDisplay` component.
 */
interface ErrorDisplayProps {
	/** The caught exception object. */
	error?: Error;
	/** React-specific error metadata, including component stack. */
	errorInfo?: ErrorInfo;
	/** Optional descriptive text to show above the stack trace. */
	children?: ReactNode;
	/** Optional CSS class names. */
	className?: string;
	/** Optional inline styles for the container. */
	containerStyle?: React.CSSProperties;
}

/**
 * A reusable component for rendering technical error details.
 *
 * @remarks
 * It formats the error message and stack trace (both JS and React component stack)
 * in a readable, monospace layout. It is primarily used within the `ErrorContent`
 * component to provide debugging information.
 *
 * @param {ErrorDisplayProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered error details view.
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ErrorDisplay error={myError} errorInfo={stackInfo}>Something failed!</ErrorDisplay>
 * // renders formatted stack trace
 * ```
 */
export const ErrorDisplay = ({
	error,
	errorInfo,
	children,
	className = "",
	containerStyle,
}: ErrorDisplayProps) => {
	const hasStackTrace = error?.stack || errorInfo?.componentStack;

	return (
		<div className={`flex flex-col items-center gap-4 ${className}`} style={containerStyle}>
			{children && <p className="text-sm sm:text-base">{children}</p>}
			<div
				className="mt-2 mb-2 w-full text-left font-mono text-sm sm:text-base"
				style={{
					whiteSpace: "pre-wrap",
					overflowWrap: "break-word",
					wordBreak: "break-word",
				}}
			>
				{error?.message && (
					<Code color="red" className="block">
						<strong>Error:</strong> {error.message}
					</Code>
				)}
				{hasStackTrace && (
					<Code color="red" className="block">
						<strong>Stack Trace:</strong>
					</Code>
				)}
				{error?.stack && <Code color="red">{error.stack}</Code>}
				{errorInfo?.componentStack && <Code color="red">{errorInfo.componentStack}</Code>}
			</div>
		</div>
	);
};
