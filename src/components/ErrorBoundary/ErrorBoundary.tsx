/**
 * Global application error boundary module.
 *
 * @remarks
 * This module provides the `ErrorBoundary` class component, which serves as the
 * top-level safety net for catching unhandled exceptions in the React tree.
 *
 * @see {@link ErrorBoundary}
 * @see {@link ./ErrorBoundary.test.tsx Unit Tests}
 *
 * @category Components
 */

import type { ErrorInfo, ReactNode } from "react";
import { Component, lazy, Suspense } from "react";

import { handleError } from "./errorHandler";

const ErrorContent = lazy(() =>
	import("./ErrorContent").then((module) => ({ default: module.ErrorContent }))
);

/**
 * Props for the `ErrorBoundary` component.
 */
interface Props {
	/** The child component tree that is monitored for runtime errors. */
	children: ReactNode;
	/** Optional React node to render instead of the default error UI if a crash occurs. */
	fallback?: ReactNode;
}

/**
 * Internal state for the `ErrorBoundary` class component.
 */
interface State {
	/** The exception that was caught. */
	error?: Error;
	/** Metadata about the component stack where the error originated. */
	errorInfo?: ErrorInfo;
	/** Whether an error has been detected in the current lifecycle. */
	hasError: boolean;
}

/**
 * A robust class-based component that intercepts JavaScript errors in its subtree.
 *
 * @remarks
 * When an error is caught:
 * 1. It prevents the entire application from crashing.
 * 2. It triggers a global error reporting event (via `handleError`).
 * 3. It displays a user-friendly error UI or the provided `fallback` node.
 * 4. It maintains information about the crash for debugging purposes.
 *
 * @see {@link handleError}
 * @see {@link ErrorContent}
 *
 * @component
 *
 * @category Components
 *
 * @example Component usage
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <FeatureComponent />
 * </ErrorBoundary>
 * // handles crash and renders fallback
 * ```
 */
class ErrorBoundary extends Component<Props, State> {
	/**
	 * Initializes the error boundary with a clean state.
	 *
	 * @param {Props} props - Component properties.
	 *
	 * @example Initialization
	 * ```typescript
	 * new ErrorBoundary(props);
	 * ```
	 */
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	/**
	 * Updates the internal state so the next render will show the fallback UI.
	 *
	 * @param {Error} error - The caught exception.
	 *
	 * @returns {State} The new component state.
	 *
	 * @example State update
	 * ```typescript
	 * ErrorBoundary.getDerivedStateFromError(new Error("test"));
	 * ```
	 */
	static getDerivedStateFromError(error: Error) {
		return { error, hasError: true };
	}

	/**
	 * Executes side effects after an error is caught, such as logging or analytics.
	 *
	 * @param {Error} error - The caught exception.
	 * @param {ErrorInfo} errorInfo - The component stack trace.
	 *
	 * @example Side effects
	 * ```typescript
	 * component.componentDidCatch(new Error("test"), info);
	 * ```
	 */
	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		handleError(error, errorInfo);
		this.setState({ errorInfo });
	}

	/**
	 * Renders children normally, or the error UI if a crash occurred.
	 *
	 * @returns {ReactNode} The rendered component tree or fallback UI.
	 *
	 * @example Lifecycle render
	 * ```tsx
	 * boundary.render();
	 * ```
	 */
	render() {
		const { error, errorInfo, hasError } = this.state;
		const { children, fallback } = this.props;

		if (hasError) {
			if (fallback) {
				return fallback;
			}

			return (
				<Suspense fallback={null}>
					<ErrorContent error={error} errorInfo={errorInfo} variant="page" />
				</Suspense>
			);
		}

		return children;
	}
}

export default ErrorBoundary;
