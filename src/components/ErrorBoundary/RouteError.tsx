import { useEffect } from "react";
import { useRouteError } from "react-router-dom";

import { handleError } from "./errorHandler";
import { ErrorPage } from "./ErrorPage";

export const RouteError = () => {
	const error = useRouteError() as Error;

	useEffect(() => {
		handleError(error);
	}, [error]);

	return <ErrorPage error={error} />;
};
