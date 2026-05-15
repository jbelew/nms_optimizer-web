// src/context/dialogContext.tsx
import type { DialogType } from "../utils/system/dialogUtils";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { safeGetItem, safeRemoveItem, safeSetItem } from "../utils/browser/environment";
import { DialogContext } from "../utils/system/dialogUtils";

/** List of non-English language codes supported by the router. */
const OTHER_LANGUAGES = ["es", "fr", "de", "pt", "it"];

/**
 * Provider component for managing the state and logic of routed dialogs.
 *
 * @remarks
 * This provider synchronizes the currently active dialog with the browser's URL path.
 * It also manages persistent state for the tutorial and first-visit flags via `localStorage`.
 * It provides methods to open and close dialogs programmatically while preserving
 * language and search parameters.
 *
 * @param {object} props - Component properties.
 * @param {import("react").ReactNode} props.children - The child components to wrap.
 *
 * @returns {JSX.Element} The context provider with dialog state.
 *
 * @see {@link ../utils/system/dialogUtils.ts useDialog Hook}
 * @see {@link DialogContext}
 * @see {@link DialogType}
 * @see {@link ./DialogContext.test.tsx Unit Tests}
 *
 * @category Components
 *
 * @example Application wrapper
 * ```tsx
 * <DialogProvider>
 *   <App />
 * </DialogProvider>
 * ```
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
		dialogPath === "privacy" ||
		dialogPath === "performance"
			? dialogPath
			: null;

	/**
	 * Navigates to a specific dialog route or sets the share URL state.
	 *
	 * @param {NonNullable<DialogType> | null} dialog - The identifier of the dialog to open.
	 * @param {object} [data] - Optional metadata for the dialog.
	 * @param {string} [data.shareUrl] - A specific URL for the share dialog.
	 * @param {string} [data.section] - An element ID to scroll into view when the dialog opens.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example Dialog and section navigation
	 * ```typescript
	 * openDialog("changelog", { section: "v2.0" });
	 * ```
	 */
	const openDialog = (
		dialog: NonNullable<DialogType> | null,
		data?: { section?: string; shareUrl?: string }
	) => {
		const lang = (i18n.language || "en").split("-")[0];

		if (data?.shareUrl) {
			setShareUrl(data.shareUrl);
		} else if (dialog) {
			const path = lang === "en" ? `/${dialog}/` : `/${lang}/${dialog}/`;
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
	 * @returns {void} Side-effects only.
	 *
	 * @example Interface reset
	 * ```typescript
	 * closeDialog();
	 * ```
	 */
	const closeDialog = () => {
		const lang = (i18n.language || "en").split("-")[0];

		if (shareUrl) {
			setShareUrl("");
		} else if (activeDialog) {
			const path = lang === "en" ? "/" : `/${lang}/`;
			navigate(path + window.location.search);
		}

		setSectionToScrollTo(undefined);
	};

	/**
	 * Updates state and `localStorage` to indicate the user has completed the tutorial.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example Completion tracking
	 * ```typescript
	 * markTutorialFinished();
	 * ```
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
	 * @returns {void} Side-effects only.
	 *
	 * @example Persistence tracking
	 * ```typescript
	 * markUserVisited();
	 * ```
	 */
	const markUserVisited = () => {
		if (!userVisited) {
			setUserVisited(true);
			safeSetItem("userVisited", "true");
		}
	};

	const value = {
		activeDialog,
		closeDialog,
		markTutorialFinished,
		markUserVisited,
		openDialog,
		sectionToScrollTo,
		shareUrl,
		tutorialFinished,
		userVisited,
	};

	return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
};
