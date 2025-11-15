import { createContext, useContext } from "react";

/**
 * Represents the context value for route-related information.
 */
type RouteContextType = {
	/** Whether the current route is a known/valid route. */
	isKnownRoute: boolean;
};

/**
 * React Context for managing route-related state and providing route information
 * to child components.
 *
 * @default {isKnownRoute: true}
 */
export const RouteContext = createContext<RouteContextType>({
	isKnownRoute: true,
});

/**
 * Custom hook to access route context.
 * Must be used within a RouteContext provider.
 *
 * @returns {RouteContextType} The current route context value.
 * @throws {Error} If used outside of a RouteContext provider.
 */
export const useRouteContext = () => useContext(RouteContext);
