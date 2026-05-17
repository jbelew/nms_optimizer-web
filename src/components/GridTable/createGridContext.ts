/**
 * Context for the optimization grid.
 *
 * @category Context
 */
import type React from "react";
import { createContext } from "react";

/**
 * Values provided by the GridContext.
 */
export interface GridContextValue {
	/** Ref to the grid DOM element. */
	gridRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Context instance for the grid.
 */
export const GridContext = createContext<GridContextValue | null>(null);
