// src/context/DialogContext.tsx
import type { DialogType } from "./dialog-utils";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { DialogContext } from "./dialog-utils";

const OTHER_LANGUAGES = ["es", "fr", "de", "pt"];

/**
 * Provider component that manages the state and logic for routed dialogs.
 * It syncs the active dialog with the URL.
 *
 * @param {{children: React.ReactNode}} props - The props for the component.
 * @returns {JSX.Element} The rendered provider.
 */
export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { i18n } = useTranslation();

	const [userVisited, setUserVisited] = useState(() => {
		if (typeof window === "undefined" || !window.localStorage) {
			return false;
		}

		return localStorage.getItem("userVisited") === "true";
	});

	const [shareUrl, setShareUrl] = useState<string>("");
	const [sectionToScrollTo, setSectionToScrollTo] = useState<string | undefined>(undefined);
	const [tutorialFinished, setTutorialFinished] = useState(() => {
		if (typeof window === "undefined" || !window.localStorage) {
			return false;
		}

		const oldKey = "hasVisitedNMSOptimizer";
		const newKey = "tutorialFinished";
		const oldVal = localStorage.getItem(oldKey);
		const newVal = localStorage.getItem(newKey);

		if (newVal === "true") {
			return true;
		} else if (oldVal === "true") {
			localStorage.setItem(newKey, "true");
			localStorage.removeItem(oldKey);

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
		dialogPath === "userstats"
			? dialogPath
			: null;

	/**
	 * Opens a dialog.
	 *
	 * @param {NonNullable<DialogType>|null} dialog - The dialog to open.
	 * @param {{shareUrl?: string, section?: string}} [data] - Additional data for the dialog.
	 */
	const openDialog = useCallback(
		(
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
		},
		[navigate, i18n.language]
	);

	/**
	 * Closes the currently active dialog.
	 */
	const closeDialog = useCallback(() => {
		const lang = (i18n.language || "en").split("-")[0];

		if (shareUrl) {
			setShareUrl("");
		} else if (activeDialog) {
			const path = lang === "en" ? "/" : `/${lang}`;
			navigate(path + window.location.search);
		}

		setSectionToScrollTo(undefined);
	}, [activeDialog, navigate, shareUrl, i18n.language]);

	/**
	 * Marks the tutorial as finished.
	 */
	const markTutorialFinished = useCallback(() => {
		if (!tutorialFinished) {
			setTutorialFinished(true);

			if (typeof window !== "undefined" && window.localStorage) {
				localStorage.setItem("tutorialFinished", "true");
			}
		}
	}, [tutorialFinished]);

	/**
	 * Marks the user as visited.
	 */
	const markUserVisited = useCallback(() => {
		if (!userVisited) {
			setUserVisited(true);

			if (typeof window !== "undefined" && window.localStorage) {
				localStorage.setItem("userVisited", "true");
			}
		}
	}, [userVisited]);

	const value = React.useMemo(
		() => ({
			activeDialog,
			openDialog,
			closeDialog,
			tutorialFinished,
			markTutorialFinished,
			userVisited,
			markUserVisited,
			shareUrl,
			sectionToScrollTo,
		}),
		[
			activeDialog,
			openDialog,
			closeDialog,
			tutorialFinished,
			markTutorialFinished,
			userVisited,
			markUserVisited,
			shareUrl,
			sectionToScrollTo,
		]
	);

	return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
};
