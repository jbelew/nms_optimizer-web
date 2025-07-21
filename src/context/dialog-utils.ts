// src/context/dialog-utils.ts
import { createContext, useContext } from "react";

// --- Context Definition ---
export type DialogType = "about" | "instructions" | "changelog" | "translation" | "shareLink" | null;

export interface DialogContextType {
	activeDialog: DialogType;
	openDialog: (dialog: NonNullable<DialogType>, data?: { shareUrl?: string }) => void;
	closeDialog: () => void;
	isFirstVisit: boolean;
	onFirstVisitInstructionsDialogOpened: () => void;
	shareUrl?: string;
}

export const DialogContext = createContext<DialogContextType | undefined>(undefined);

/**
 * Custom hook for easy consumption of the DialogContext.
 * Throws an error if used outside of a DialogProvider.
 */
export const useDialog = () => {
	const context = useContext(DialogContext);
	if (context === undefined) {
		throw new Error("useDialog must be used within a DialogProvider");
	}
	return context;
};
