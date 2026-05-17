import type { useTechTreeRow } from "./useTechTreeRow";
import { createContext } from "react";

/**
 * Context value for a single technology row.
 */
export type TechTreeRowContextValue = ReturnType<typeof useTechTreeRow>;

export const TechTreeRowContext = createContext<null | TechTreeRowContextValue>(null);
