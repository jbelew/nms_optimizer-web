import { useEffect } from "react";
import { useRouteError } from "react-router-dom";

import { ErrorContent } from "./ErrorContent";
import { handleError } from "./errorHandler";

/**
 * Component that displays a route error caught by React Router.
 * Uses ErrorContent to render the error UI.
 */
export const RouteError = () => {
	const error = useRouteError() as Error;

	useEffect(() => {
		handleError(error);
	}, [error]);

	return <ErrorContent error={error} variant="page" />;
};
