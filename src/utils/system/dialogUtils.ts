// src/utils/system/dialogUtils.ts
import { createContext, useContext } from "react";

/**
 * Context type for the application's routed dialog system.
 *
 * @see {@link import('./DialogContext').DialogProvider}
 *
 * @category Dialog
 */
export interface DialogContextType {
	/** The identifier of the dialog currently being displayed. */
	activeDialog: DialogType;
	/**
	 * Navigates away from the active dialog route.
	 */
	closeDialog: () => void;
	/** Sets the tutorial completion flag. */
	markTutorialFinished: () => void;
	/** Sets the user visited flag. */
	markUserVisited: () => void;
	/**
	 * Navigates to a dialog route or sets external data for a dialog.
	 *
	 * @param {NonNullable<DialogType> | null} dialog - The dialog to show.
	 * @param {object} [data] - Optional metadata.
	 */
	openDialog: (
		dialog: NonNullable<DialogType> | null,
		data?: { section?: string; shareUrl?: string }
	) => void;
	/** Optional ID of an element within a dialog to scroll to on mount. */
	sectionToScrollTo: string | undefined;
	/** The temporary URL stored for the share link dialog. */
	shareUrl: string;
	/** Whether the user has seen and completed the initial tutorial. */
	tutorialFinished: boolean;
	/** Whether the user has visited the site previously. */
	userVisited: boolean;
}

/**
 * Union type of all valid routed dialog identifiers.
 *
 * @see {@link import('./DialogContext').DialogProvider}
 *
 * @category Dialog
 */
export type DialogType =
	| "about"
	| "changelog"
	| "instructions"
	| "performance"
	| "privacy"
	| "translation"
	| "userstats"
	| null;

/**
 * React Context for managing and providing global dialog-related state.
 *
 * @see {@link import('./DialogContext').DialogProvider}
 *
 * @category Dialog
 */
export const DialogContext = createContext<DialogContextType | undefined>(undefined);

/**
 * Custom hook for accessing the `DialogContext`.
 *
 * @returns {DialogContextType} The active dialog context value.
 *
 * @throws {Error} If called outside of a `DialogProvider`.
 *
 * @see {@link import('./DialogContext').DialogProvider}
 * @see {@link DialogContextType}
 *
 * @category Hooks
 *
 * @example Hook usage for dialog control
 * ```ts
 * const { openDialog } = useDialog();
 * openDialog("changelog");
 * ```
 */
export const useDialog = () => {
	const context = useContext(DialogContext);

	if (context === undefined) {
		throw new Error("useDialog must be used within a DialogProvider");
	}

	return context;
};
