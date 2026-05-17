import type { ModuleSelectionDialogProps } from "@/types/props";
import { createContext } from "react";

/**
 * Context value for the ModuleSelection dialog.
 */
export type ModuleSelectionContextValue = ModuleSelectionDialogProps;

export const ModuleSelectionContext = createContext<ModuleSelectionContextValue | null>(null);
