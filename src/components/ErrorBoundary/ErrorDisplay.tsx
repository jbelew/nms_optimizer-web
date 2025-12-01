import type { ErrorInfo, ReactNode } from "react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Link } from "@radix-ui/themes";

interface ErrorDisplayProps {
	error?: Error;
	errorInfo?: ErrorInfo;
	children?: ReactNode;
	className?: string;
	containerStyle?: React.CSSProperties;
}

/**
 * Reusable error display component that shows error details in a consistent format.
 * Used by both ErrorPage and ErrorBoundaryInset for displaying error information.
 */
export const ErrorDisplay = ({
	error,
	errorInfo,
	children,
	className = "",
	containerStyle,
}: ErrorDisplayProps) => {
	return (
		<div
			className={`flex h-full flex-col items-center justify-center p-8 text-center text-gray-50 ${className}`}
			style={containerStyle}
		>
			<ExclamationTriangleIcon className="h-16 w-16" style={{ color: "var(--red-track)" }} />
			<h1
				className="errorContent__title block text-center text-2xl font-semibold tracking-widest"
				style={{ color: "var(--amber-track)", fontFamily: "GeosansLight" }}
			>
				-kzzkt- Error! -kzzkt-
			</h1>
			<h2 className="pb-4 text-sm sm:text-base">{children}</h2>
			<div
				className="w-full text-left font-mono text-xs lg:text-base"
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
	);
};

/**
 * Default error message for full-page errors
 */
export const DefaultErrorMessage = () => (
	<>
		Something went wrong! This page may be <strong>out of date</strong>. Try{" "}
		<strong>reloading the page</strong> to get the latest updates. If the problem continues,
		please consider{" "}
		<Link
			href="https://github.com/jbelew/nms_optimizer-web/issues"
			target="_blank"
			rel="noopener noreferrer"
			underline="always"
		>
			filing a bug report
		</Link>
		.
	</>
);

/**
 * Alternative error message for inset errors
 */
export const InsetErrorMessage = () => (
	<>
		Something went wrong! Try <strong>reloading the page</strong> to see if that resolves the
		issue. If the problem continues, please consider{" "}
		<Link
			href="https://github.com/jbelew/nms_optimizer-web/issues"
			target="_blank"
			rel="noopener noreferrer"
			underline="always"
		>
			filing a bug report
		</Link>
		.
	</>
);
