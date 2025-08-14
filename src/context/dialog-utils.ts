// src/context/dialog-utils.ts
import { createContext, useContext } from "react";

/**
 * The type of dialog to display.
 * @typedef {"about" | "instructions" | "changelog" | "translation" | "userstats" | null} DialogType
 */
export type DialogType =
	| "about"
	| "instructions"
	| "changelog"
	| "translation"
	| "userstats"
	| null;

/**
 * @interface DialogContextType
 * @property {DialogType} activeDialog - The currently active dialog.
 * @property {(dialog: NonNullable<DialogType>|null, data?: {shareUrl?: string, section?: string}) => void} openDialog - Function to open a dialog.
 * @property {() => void} closeDialog - Function to close the current dialog.
 * @property {boolean} tutorialFinished - Whether the user has finished the tutorial.
 * @property {() => void} markTutorialFinished - Function to mark the tutorial as finished.
 * @property {string} shareUrl - The URL to share.
 * @property {string|undefined} sectionToScrollTo - The section to scroll to in the dialog.
 */
export interface DialogContextType {
	activeDialog: DialogType;
	openDialog: (
		dialog: NonNullable<DialogType> | null,
		data?: { shareUrl?: string; section?: string }
	) => void;
	closeDialog: () => void;
	tutorialFinished: boolean;
	markTutorialFinished: () => void;
	shareUrl: string;
	sectionToScrollTo: string | undefined;
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
