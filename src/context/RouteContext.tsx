import { createContext, useContext } from "react";

/**
 * Context value representing global routing metadata.
 */
type RouteContextType = {
	/** Whether the current location matches a defined application route. */
	isKnownRoute: boolean;
};

/**
 * React Context for managing and providing global route-related state.
 *
 * This context allows deeply nested components to adapt their behavior based
 * on whether they are being rendered within a recognized application route.
 *
 * @default { isKnownRoute: true }
 */
const RouteContext = createContext<RouteContextType>({
	isKnownRoute: true,
});

/**
 * Custom hook for accessing the `RouteContext`.
 *
 * @returns {RouteContextType} The active route context value.
 *
 * @see {@link RouteContext}
 *
 * @example
 * const { isKnownRoute } = useRouteContext();
 * // returns { isKnownRoute: true }
 */
export const useRouteContext = () => useContext(RouteContext);
