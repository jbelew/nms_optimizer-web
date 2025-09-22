// src/context/DialogContext.tsx
import type { DialogType } from "./dialog-utils";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { DialogContext } from "./dialog-utils";

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
	const params = useParams();

	const [activeDialog, setActiveDialog] = useState<DialogType>(null);
	const [shareUrl, setShareUrl] = useState<string>("");
	const [sectionToScrollTo, setSectionToScrollTo] = useState<string | undefined>(undefined);
	const [tutorialFinished, setTutorialFinished] = useState(() => {
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

	/**
	 * Effect to sync dialog state with URL.
	 */
	useEffect(() => {
		const pathParts = location.pathname.split("/").filter(Boolean);
		const langParam = params.lang; // From the URL, e.g., 'fr'
		let dialogPath: DialogType;

		if (langParam) {
			// URL is like /fr/about
			dialogPath = (pathParts[1] as DialogType) || null;
		} else {
			// URL is like /about
			dialogPath = (pathParts[0] as DialogType) || null;
		}

		if (
			dialogPath === "about" ||
			dialogPath === "instructions" ||
			dialogPath === "changelog" ||
			dialogPath === "translation" ||
			dialogPath === "userstats"
		) {
			setActiveDialog(dialogPath);
		} else {
			setActiveDialog(null);
		}
	}, [location.pathname, params.lang]);

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
				navigate(path);
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
			navigate(path);
		}
		setSectionToScrollTo(undefined);
	}, [activeDialog, navigate, shareUrl, i18n.language]);

	/**
	 * Marks the tutorial as finished.
	 */
	const markTutorialFinished = useCallback(() => {
		if (!tutorialFinished) {
			setTutorialFinished(true);
			localStorage.setItem("tutorialFinished", "true");
		}
	}, [tutorialFinished]);

	const value = {
		activeDialog,
		openDialog,
		closeDialog,
		tutorialFinished,
		markTutorialFinished,
		shareUrl,
		sectionToScrollTo,
	};

	return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
};
