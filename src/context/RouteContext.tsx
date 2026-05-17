import { createContext, useContext } from "react";

/**
 * Context value representing global routing metadata.
 *
 * @category Context
 */
type RouteContextType = {
	/** Whether the current location matches a defined application route. */
	isKnownRoute: boolean;
};

/**
 * React Context for managing and providing global route-related state.
 *
 * @remarks
 * This context allows deeply nested components to adapt their behavior based
 * on whether they are being rendered within a recognized application route.
 *
 * @default { isKnownRoute: true }
 *
 * @see {@link useRouteContext}
 *
 * @category Context
 */
const RouteContext = createContext<RouteContextType>({
	isKnownRoute: true,
});

/**
 * Custom hook for accessing the `RouteContext`.
 *
 * @remarks
 * Use this hook to determine if the current page is a known application route.
 * This is useful for conditional rendering of layout elements like navbars or footers
 * that should only appear on valid routes.
 *
 * @returns {RouteContextType} The active route context value.
 *
 * @see {@link RouteContext}
 *
 * @category Context
 *
 * @example
 * ```tsx
 * const { isKnownRoute } = useRouteContext();
 * // returns { isKnownRoute: true }
 * ```
 */
export const useRouteContext = () => useContext(RouteContext);
