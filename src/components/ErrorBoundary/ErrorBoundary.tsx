/**
 * Global application error boundary and route error handling module.
 *
 * @remarks
 * This module provides:
 * - {@link ErrorBoundary}: Top-level React class boundary for catching unhandled exceptions.
 * - {@link RouteError}: React Router `errorElement` boundary.
 * - {@link ErrorContent}: Full-page and inset crash recovery layout.
 * - {@link ErrorDisplay}: Technical stack trace and error detail renderer.
 *
 * @see {@link ErrorBoundary}
 * @see {@link RouteError}
 * @see {@link ErrorContent}
 * @see {@link ErrorDisplay}
 * @see {@link ./ErrorBoundary.test.tsx Unit Tests}
 *
 * @category Components
 */

import type { CSSProperties, ErrorInfo, ReactNode } from "react";
import { Component, useCallback, useEffect, useState } from "react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Button, Code, Link, ScrollArea, Separator, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";
import { useRouteError } from "react-router-dom";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { buildExceptionEvent, sendEvent } from "@/utils/analytics/tracking";
import { lifecycleCoordinator } from "@/utils/system/lifecycleCoordinator";
import { Logger } from "@/utils/system/monitoring";

import "./ErrorBoundary.scss";

/**
 * Props for the {@link ErrorContent} component.
 *
 * @category Components
 */
interface ErrorContentProps {
	/** Optional custom React nodes to display as the error message. */
	children?: ReactNode;
	/** The exception that was caught by the boundary. */
	error?: Error;
	/** Metadata regarding the React component stack. */
	errorInfo?: ErrorInfo;
	/** Controls the visual layout of the error UI. */
	variant: "inset" | "page";
}

/**
 * Props for the {@link ErrorDisplay} component.
 *
 * @category Components
 */
interface ErrorDisplayProps {
	/** Optional descriptive text to show above the stack trace. */
	children?: ReactNode;
	/** Optional CSS class names. */
	className?: string;
	/** Optional inline styles for the container. */
	containerStyle?: CSSProperties;
	/** The caught exception object. */
	error?: Error;
	/** React-specific error metadata, including component stack. */
	errorInfo?: ErrorInfo;
}

/**
 * Props for the {@link ErrorBoundary} component.
 *
 * @remarks
 * Defines the content and fallback UI for the error monitoring boundary.
 *
 * @category Components
 */
interface Props {
	/** The child component tree that is monitored for runtime errors. */
	children: ReactNode;
	/** Optional React node to render instead of the default error UI if a crash occurs. */
	fallback?: ReactNode;
}

/**
 * Internal state for the {@link ErrorBoundary} class component.
 *
 * @remarks
 * Tracks the error presence and associated metadata for reporting and rendering.
 *
 * @category Components
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
 * Reports an uncaught application error to monitoring and analytics services.
 *
 * @remarks
 * Logs the error to the console, reports it to Sentry with component stack context,
 * and sends a diagnostic event to Google Analytics via {@link sendEvent}.
 *
 * @param error - The caught exception. **Must not be null.**
 * @param [errorInfo] - The React component stack metadata.
 *
 * @returns Side-effects only.
 *
 * @example
 * ```ts
 * handleError(new Error("Fatal Crash"), { componentStack: "..." });
 * ```
 */
const handleError = (error: Error, errorInfo?: ErrorInfo) => {
	Logger.error("Uncaught error:", error, { errorInfo });

	sendEvent(buildExceptionEvent(error, true));
};

/**
 * Static component rendering the default full-page error message.
 *
 * @returns The localized default page error message with GitHub issues link.
 *
 * @example View state
 * ```tsx
 * <DefaultMessage />
 * ```
 */
const DefaultMessage = () => (
	<Trans i18nKey="errorContent.defaultMessage">
		errorContent.defaultMessage
		<Link
			href="https://github.com/jbelew/nms_optimizer-web/issues"
			rel="noopener noreferrer"
			target="_blank"
			underline="always"
			weight="medium"
		/>
	</Trans>
);

/**
 * Static component rendering a compact inset error message.
 *
 * @returns The localized inset error message with GitHub issues link.
 *
 * @example View state
 * ```tsx
 * <InsetMessage />
 * ```
 */
const InsetMessage = () => (
	<Trans i18nKey="errorContent.insetMessage">
		errorContent.insetMessage
		<Link
			href="https://github.com/jbelew/nms_optimizer-web/issues"
			rel="noopener noreferrer"
			target="_blank"
			underline="always"
			weight="medium"
		/>
	</Trans>
);

/**
 * A reusable component for rendering technical error details.
 *
 * @remarks
 * It formats the error message and stack trace (both JS and React component stack)
 * in a readable, monospace layout. It is used within {@link ErrorContent} and
 * `ErrorDialog` to provide debugging information.
 *
 * @see {@link ErrorDisplayProps}
 * @see {@link ./ErrorBoundary.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ErrorDisplay error={myError} errorInfo={stackInfo}>Something failed!</ErrorDisplay>
 * // mounts ErrorDisplay
 * ```
 */
export const ErrorDisplay = ({
	children,
	className = "",
	containerStyle,
	error,
	errorInfo,
}: ErrorDisplayProps) => {
	const { t } = useTranslation();
	const hasStackTrace = error?.stack || errorInfo?.componentStack;

	return (
		<div
			className={`flex flex-col items-center gap-3 text-sm sm:text-base ${className}`}
			style={containerStyle}
		>
			{children && <Text as="p">{children}</Text>}
			<div
				className="w-full text-left font-mono"
				style={{
					overflowWrap: "break-word",
					whiteSpace: "pre-wrap",
					wordBreak: "break-word",
				}}
			>
				{error?.message && (
					<Code
						className="block"
						color="red"
					>
						<strong>{t("errorDisplay.errorLabel")}</strong> {error.message}
					</Code>
				)}
				{hasStackTrace && (
					<Code
						className="block"
						color="red"
					>
						<strong>{t("errorDisplay.stackTraceLabel")}</strong>
					</Code>
				)}
				{error?.stack && <Code color="red">{error.stack}</Code>}
				{errorInfo?.componentStack && <Code color="red">{errorInfo.componentStack}</Code>}
			</div>
		</div>
	);
};

/**
 * A layout component for displaying crash information and recovery steps.
 *
 * @remarks
 * This component is used by both the global {@link ErrorBoundary} and {@link RouteError}.
 * It automatically ensures the splash screen is hidden and adapts its
 * styling based on the `variant` (full page overlay vs. inset card).
 *
 * @see {@link ErrorContentProps}
 * @see {@link ErrorDisplay}
 * @see {@link ./ErrorBoundary.test.tsx Unit Tests}
 * @see {@link ./ErrorContent.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example Component usage
 * ```tsx
 * <ErrorContent variant="page" error={new Error("Crash")} />
 * // mounts ErrorContent
 * ```
 */
export const ErrorContent = ({ children, error, errorInfo, variant }: ErrorContentProps) => {
	const { t } = useTranslation();
	const isLarge = useBreakpoint("1024px");
	const [isResetting, setIsResetting] = useState(false);

	useEffect(() => {
		document.body.classList.add("error-boundary-visible");

		return () => {
			document.body.classList.remove("error-boundary-visible");
		};
	}, []);

	const handleReload = useCallback(() => {
		window.location.reload();
	}, []);

	const handleClearAndReload = useCallback(async () => {
		setIsResetting(true);

		try {
			if ("serviceWorker" in navigator) {
				const regs = await navigator.serviceWorker.getRegistrations();
				await Promise.all(regs.map((r) => r.unregister()));
			}

			if ("caches" in window) {
				const keys = await caches.keys();
				await Promise.all(keys.map((k) => caches.delete(k)));
			}

			try {
				sessionStorage.clear();
			} catch {
				// Ignore errors if sessionStorage is restricted (e.g. incognito mode)
			}
		} finally {
			window.location.href = "/";
		}
	}, []);

	const content = (
		<div className="error-content">
			<section className="error-content__header">
				<h2 className="heading-styled flex items-start gap-2 text-xl sm:text-2xl">
					<div className="mt-px shrink-0 sm:mt-[4px]">
						<ExclamationTriangleIcon className="error-content__icon h-6 w-6" />
					</div>
					<span>{t("errorContent.boundaryError")}</span>
				</h2>
				<Separator
					color="cyan"
					decorative
					mt="2"
					orientation="horizontal"
					size="4"
				/>
			</section>

			<div className="error-content__body gap-3 text-sm sm:text-base">
				<Text as="p">
					{children || (variant === "page" ? <DefaultMessage /> : <InsetMessage />)}
				</Text>

				<ErrorDisplay
					error={error}
					errorInfo={errorInfo}
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button
					disabled={isResetting}
					onClick={() => void handleClearAndReload()}
					variant="soft"
				>
					{isResetting ? t("errorContent.resetting") : t("errorContent.clearAndReload")}
				</Button>
				<Button
					onClick={handleReload}
					variant="solid"
				>
					{t("common.reload")}
				</Button>
			</div>
		</div>
	);

	if (variant === "inset" && isLarge) {
		return (
			<div className="error-boundary__container">
				<div className="error-boundary__card">
					<ScrollArea style={{ height: "526px" }}>
						<div className="p-4">{content}</div>
					</ScrollArea>
				</div>
			</div>
		);
	}

	if (variant === "inset") {
		return <div className="mt-8">{content}</div>;
	}

	return (
		<main className="error-page__overlay">
			<div className="error-page__content">{content}</div>
		</main>
	);
};

/**
 * A fallback component for React Router's error boundaries.
 *
 * @remarks
 * This component is triggered when a route loader or action fails, or if an
 * error occurs during the rendering of a specific route. It captures the
 * error using `useRouteError`, reports it to global error handlers, signals
 * view readiness to the {@link lifecycleCoordinator}, and renders the standard
 * {@link ErrorContent} in its `'page'` variant.
 *
 * @see {@link useRouteError}
 * @see {@link ErrorContent}
 * @see {@link lifecycleCoordinator}
 * @see {@link ./ErrorBoundary.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <Route path="/feature" errorElement={<RouteError />} />
 * // mounts RouteError
 * ```
 */
export const RouteError = () => {
	const error = useRouteError() as Error;

	useEffect(() => {
		handleError(error);
		lifecycleCoordinator.markReady();
	}, [error]);

	return (
		<ErrorContent
			error={error}
			variant="page"
		/>
	);
};

/**
 * A robust class-based component that intercepts JavaScript errors in its subtree.
 *
 * @remarks
 * When an error is caught:
 * 1. It prevents the entire application from crashing.
 * 2. It triggers a global error reporting event.
 * 3. It displays a user-friendly error UI or the provided `fallback` node.
 * 4. It maintains information about the crash for debugging purposes.
 *
 * @see {@link Props}
 * @see {@link State}
 * @see {@link ErrorContent}
 * @see {@link lifecycleCoordinator}
 * @see {@link ./ErrorBoundary.test.tsx Unit Tests}
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
 * // mounts ErrorBoundary
 * ```
 */
class ErrorBoundary extends Component<Props, State> {
	/**
	 * Initializes the error boundary with a clean state.
	 *
	 * @param props - Component properties.
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
	 * @param error - The caught exception.
	 *
	 * @returns The new component state.
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
	 * @param error - The caught exception.
	 * @param errorInfo - The component stack trace.
	 *
	 * @example Side effects
	 * ```typescript
	 * component.componentDidCatch(new Error("test"), info);
	 * ```
	 */
	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		handleError(error, errorInfo);
		lifecycleCoordinator.markReady();
		this.setState({ errorInfo });
	}

	/**
	 * Renders children normally, or the error UI if a crash occurred.
	 *
	 * @returns The rendered component tree or fallback UI.
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
				<ErrorContent
					error={error}
					errorInfo={errorInfo}
					variant="page"
				/>
			);
		}

		return children;
	}
}

export default ErrorBoundary;
