/**
 * React Router error boundary integration module.
 *
 * @remarks
 * This module provides the `RouteError` component, which acts as the default
 * `errorElement` for the application's routing system.
 *
 * @see {@link RouteError}
 *
 * @category Components
 */

import { useEffect } from "react";
import { useRouteError } from "react-router-dom";

import { ErrorContent } from "./ErrorContent";
import { handleError } from "./errorHandler";

/**
 * A fallback component for React Router's error boundaries.
 *
 * @remarks
 * This component is triggered when a route loader or action fails, or if an
 * error occurs during the rendering of a specific route. It captures the
 * error using `useRouteError`, reports it to global error handlers, and
 * renders the standard `ErrorContent` in its 'page' variant.
 *
 * @returns {JSX.Element} The rendered route error page.
 *
 * @see {@link useRouteError}
 * @see {@link handleError}
 * @see {@link ErrorContent}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <Route path="/feature" errorElement={<RouteError />} />
 * // handles route failure
 * ```
 */
export const RouteError = () => {
	const error = useRouteError() as Error;

	useEffect(() => {
		handleError(error);
	}, [error]);

	return <ErrorContent error={error} variant="page" />;
};
