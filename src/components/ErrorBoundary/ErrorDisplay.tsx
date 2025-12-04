import type { ErrorInfo, ReactNode } from "react";

import "./ErrorBoundary.scss";

interface ErrorDisplayProps {
	error?: Error;
	errorInfo?: ErrorInfo;
	children?: ReactNode;
	className?: string;
	containerStyle?: React.CSSProperties;
}

/**
 * Reusable error display component that shows error details in a consistent format.
 * Used by ErrorContent for displaying error information.
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
				className="w-full text-left font-mono text-xs"
				style={{
					whiteSpace: "pre-wrap",
					overflowWrap: "break-word",
					wordBreak: "break-word",
				}}
			>
				{error?.message && (
					<p>
						<strong>Error:</strong> {error.message}
					</p>
				)}
				{hasStackTrace && (
					<p className="mt-2">
						<strong>Stack Trace:</strong>
					</p>
				)}
				{error?.stack && <p>{error.stack}</p>}
				{errorInfo?.componentStack && <p>{errorInfo.componentStack}</p>}
			</div>
		</div>
	);
};
