/**
 * Application root component.
 *
 * @remarks
 * Orchestrates global theme configuration, accessibility styles, ErrorBoundary,
 * Radix UI Theme provider, TooltipProvider, ToastProvider, and React Router.
 *
 * @category Components
 */

import React, { StrictMode, useEffect } from "react";
import { Provider as ToastProviderRadix, Viewport as ToastViewport } from "@radix-ui/react-toast";
import { Theme } from "@radix-ui/themes";
import { RouterProvider } from "react-router-dom";

import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import { TooltipManager } from "@/components/TooltipManager/TooltipManager";
import { TooltipProvider } from "@/context/TooltipContext";
import { ToastProvider } from "@/hooks/useToast/useToast";
import { routes } from "@/routes";
import { useA11yStore, useThemeStore } from "@/store/ui/uiStore";
import { createAppRouter } from "@/utils/system/monitoring";

/**
 * Root component that manages global theme and provider orchestration.
 *
 * @remarks
 * Sets up StrictMode, global ErrorBoundary, Radix UI Theme, tooltip provider,
 * toast provider, and router provider while synchronizing theme and accessibility classes.
 *
 * @returns {JSX.Element} The rendered root component with all providers.
 *
 * @see {@link useThemeStore}
 * @see {@link useA11yStore}
 * @see {@link ErrorBoundary}
 * @see {@link TooltipProvider}
 * @see {@link ToastProvider}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <Root />
 * // mounts Root application tree
 * ```
 */
export const Root = () => {
	const appearance = useThemeStore((s) => s.appearance);
	const router = React.useMemo(() => createAppRouter(routes), []);

	const a11yMode = useA11yStore((s) => s.a11yMode);

	useEffect(() => {
		// Sync theme classes to document root for global CSS visibility (backgrounds, etc)
		const root = document.documentElement;
		root.classList.remove("light", "dark", "light-theme", "dark-theme");
		root.classList.add(appearance, `${appearance}-theme`, "background-visible");

		// Sync accessibility classes
		if (a11yMode) {
			document.body.classList.add("a11y-font");
		} else {
			document.body.classList.remove("a11y-font");
		}

		root.style.colorScheme = appearance;
	}, [appearance, a11yMode]);

	return (
		<StrictMode>
			<ErrorBoundary>
				<Theme
					accentColor="cyan"
					appearance={appearance}
					grayColor="slate"
					panelBackground="solid"
					scaling="100%"
				>
					<TooltipProvider>
						<TooltipManager />
						<ToastProviderRadix swipeDirection="right">
							<ToastProvider>
								<RouterProvider router={router} />
							</ToastProvider>
							<ToastViewport className="ToastViewport" />
						</ToastProviderRadix>
					</TooltipProvider>
				</Theme>
			</ErrorBoundary>
		</StrictMode>
	);
};
