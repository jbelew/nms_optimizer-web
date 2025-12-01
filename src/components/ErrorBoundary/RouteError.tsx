import { useEffect } from "react";
import { useRouteError } from "react-router-dom";

import { ErrorContent } from "./ErrorContent";
import { handleError } from "./errorHandler";

export const RouteError = () => {
	const error = useRouteError() as Error;

	useEffect(() => {
		handleError(error);
	}, [error]);

	return <ErrorContent error={error} variant="page" />;
};
