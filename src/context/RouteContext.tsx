import { createContext, useContext } from "react";

type RouteContextType = {
	isKnownRoute: boolean;
};

export const RouteContext = createContext<RouteContextType>({
	isKnownRoute: true,
});

export const useRouteContext = () => useContext(RouteContext);
