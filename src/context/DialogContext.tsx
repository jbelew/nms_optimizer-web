// src/context/DialogContext.tsx
import type { DialogType } from "./dialog-utils";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { safeGetItem, safeRemoveItem, safeSetItem } from "../utils/storage";
import { DialogContext } from "./dialog-utils";

/** List of non-English language codes supported by the router. */
const OTHER_LANGUAGES = ["es", "fr", "de", "pt"];

/**
 * Provider component for managing the state and logic of routed dialogs.
 *
 * This provider synchronizes the currently active dialog with the browser's URL path.
 * It also manages persistent state for the tutorial and first-visit flags via `localStorage`.
 *
 * @param {object} props - Component properties.
 * @param {React.ReactNode} props.children - The child components to wrap.
 * @returns {JSX.Element} The context provider with dialog state.
 *
 * @see {@link useDialog}
 * @see {@link DialogContext}
 * @see {@link DialogType}
 * @category Components
 *
 * @example
 * <DialogProvider>
 *   <App />
 * </DialogProvider>
 */
export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { i18n } = useTranslation();

	const [userVisited, setUserVisited] = useState(() => {
		return safeGetItem("userVisited") === "true";
	});

	const [shareUrl, setShareUrl] = useState<string>("");
	const [sectionToScrollTo, setSectionToScrollTo] = useState<string | undefined>(undefined);
	const [tutorialFinished, setTutorialFinished] = useState(() => {
		const oldKey = "hasVisitedNMSOptimizer";
		const newKey = "tutorialFinished";
		const oldVal = safeGetItem(oldKey);
		const newVal = safeGetItem(newKey);

		if (newVal === "true") {
			return true;
		} else if (oldVal === "true") {
			safeSetItem(newKey, "true");
			safeRemoveItem(oldKey);

			return true;
		} else {
			return false;
		}
	});

	const pathParts = location.pathname.split("/").filter(Boolean);
	const langCand = pathParts[0];

	const dialogPath: DialogType = OTHER_LANGUAGES.includes(langCand)
		? (pathParts[1] as DialogType) || null
		: (pathParts[0] as DialogType) || null;

	const activeDialog: DialogType =
		dialogPath === "about" ||
		dialogPath === "instructions" ||
		dialogPath === "changelog" ||
		dialogPath === "translation" ||
		dialogPath === "userstats" ||
		dialogPath === "privacy"
			? dialogPath
			: null;

	/**
	 * Navigates to a specific dialog route or sets the share URL state.
	 *
	 * @param {NonNullable<DialogType> | null} dialog - The identifier of the dialog to open.
	 * @param {object} [data] - Optional metadata for the dialog.
	 * @param {string} [data.shareUrl] - A specific URL for the share dialog.
	 * @param {string} [data.section] - An element ID to scroll into view when the dialog opens.
	 * @returns {void}
	 * @example
	 */
	const openDialog = (
		dialog: NonNullable<DialogType> | null,
		data?: { shareUrl?: string; section?: string }
	) => {
		const lang = (i18n.language || "en").split("-")[0];

		if (data?.shareUrl) {
			setShareUrl(data.shareUrl);
		} else if (dialog) {
			const path = lang === "en" ? `/${dialog}` : `/${lang}/${dialog}`;
			navigate(path + window.location.search);
		}

		if (data?.section) {
			setSectionToScrollTo(data.section);
		} else {
			setSectionToScrollTo(undefined);
		}
	};

	/**
	 * Clears the active dialog state and navigates back to the root route.
	 *
	 * @returns {void}
	 * @example
	 */
	const closeDialog = () => {
		const lang = (i18n.language || "en").split("-")[0];

		if (shareUrl) {
			setShareUrl("");
		} else if (activeDialog) {
			const path = lang === "en" ? "/" : `/${lang}`;
			navigate(path + window.location.search);
		}

		setSectionToScrollTo(undefined);
	};

	/**
	 * Updates state and `localStorage` to indicate the user has completed the tutorial.
	 *
	 * @returns {void}
	 * @example
	 */
	const markTutorialFinished = () => {
		if (!tutorialFinished) {
			setTutorialFinished(true);
			safeSetItem("tutorialFinished", "true");
		}
	};

	/**
	 * Updates state and `localStorage` to indicate the user has visited the app at least once.
	 *
	 * @returns {void}
	 * @example
	 */
	const markUserVisited = () => {
		if (!userVisited) {
			setUserVisited(true);
			safeSetItem("userVisited", "true");
		}
	};

	const value = {
		activeDialog,
		openDialog,
		closeDialog,
		tutorialFinished,
		markTutorialFinished,
		userVisited,
		markUserVisited,
		shareUrl,
		sectionToScrollTo,
	};

	return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
};
