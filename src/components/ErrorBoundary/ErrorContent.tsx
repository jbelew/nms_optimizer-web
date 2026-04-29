/**
 * Layout components for displaying error messages and recovery actions.
 *
 * @remarks
 * This module contains the visual templates for the error boundary UI,
 * including full-page overlays and compact inset cards.
 *
 * @see {@link ErrorContent}
 * @see {@link ./ErrorContent.test.tsx Unit Tests}
 * @see {@link ./ErrorContent.stories.tsx Storybook}
 *
 * @category Components
 */

import type { ErrorInfo, ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Button, Link, ScrollArea, Separator } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { hideSplashScreenAndShowBackground } from "../../utils/system/splashScreen";
import { ErrorDisplay } from "./ErrorDisplay";

import "./ErrorBoundary.scss";

/**
 * Props for the `ErrorContent` component.
 */
interface ErrorContentProps {
	/** The exception that was caught by the boundary. */
	error?: Error;
	/** Metadata regarding the React component stack. */
	errorInfo?: ErrorInfo;
	/** Controls the visual layout of the error UI. */
	variant: "page" | "inset";
	/** Optional custom React nodes to display as the error message. */
	children?: ReactNode;
}

/**
 * Static component rendering the default full-page error message.
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
			target="_blank"
			rel="noopener noreferrer"
			underline="always"
			weight="medium"
		/>
	</Trans>
);

/**
 * Static component rendering a compact inset error message.
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
			target="_blank"
			rel="noopener noreferrer"
			underline="always"
			weight="medium"
		/>
	</Trans>
);

/**
 * A layout component for displaying crash information and recovery steps.
 *
 * @remarks
 * This component is used by both the global `ErrorBoundary` and `RouteError`.
 * It automatically ensures the splash screen is hidden and adapts its
 * styling based on the `variant` (full page overlay vs. inset card).
 *
 * @param {ErrorContentProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered error UI.
 *
 * @see {@link ErrorDisplay}
 * @see {@link hideSplashScreenAndShowBackground}
 *
 * @component
 *
 * @category Components
 *
 * @example Component usage
 * ```tsx
 * <ErrorContent variant="page" error={new Error("Crash")} />
 * // renders full page error overlay
 * ```
 */
export const ErrorContent = ({ error, errorInfo, variant, children }: ErrorContentProps) => {
	const { t } = useTranslation();
	const isLarge = useBreakpoint("1024px");
	const [isResetting, setIsResetting] = useState(false);

	useEffect(() => {
		hideSplashScreenAndShowBackground();
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
				<h2 className="heading-styled flex items-center gap-2 text-xl sm:text-2xl">
					<ExclamationTriangleIcon className="error-content__icon h-5 w-5" />
					<span>{t("errorContent.boundaryError")}</span>
				</h2>
				<Separator mt="2" mb="4" size="4" orientation="horizontal" decorative />
			</section>

			<div className="error-content__body">
				<div className="mb-2 text-sm sm:text-base">
					{children || (variant === "page" ? <DefaultMessage /> : <InsetMessage />)}
				</div>

				<ErrorDisplay error={error} errorInfo={errorInfo} />

				<div className="mt-4 mr-1 mb-1 flex justify-end gap-2">
					<Button
						variant="soft"
						size="2"
						onClick={() => void handleClearAndReload()}
						disabled={isResetting}
					>
						{isResetting
							? t("errorContent.resetting")
							: t("errorContent.clearAndReload")}
					</Button>
					<Button size="2" variant="solid" autoFocus onClick={handleReload}>
						{t("common.reload")}
					</Button>
				</div>
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

	// variant === "page"
	return (
		<main className="error-page__overlay">
			<div className="error-page__content">{content}</div>
		</main>
	);
};
