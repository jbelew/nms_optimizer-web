// src/context/DialogContext.tsx
import type { DialogType } from "./dialog-utils";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { DialogContext } from "./dialog-utils";

/**
 * Provider component that manages the state and logic for routed dialogs.
 * It syncs the active dialog with the URL.
 */
export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const location = useLocation();
	const navigate = useNavigate();

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

	// Effect to sync dialog state with URL
	useEffect(() => {
		const path = location.pathname.substring(1); // remove leading '/'
		if (
			path === "about" ||
			path === "instructions" ||
			path === "changelog" ||
			path === "translation" ||
			path === "userstats"
		) {
			setActiveDialog(path);
		} else {
			setActiveDialog(null);
		}
	}, [location.pathname]);

	const openDialog = useCallback(
		(dialog: NonNullable<DialogType> | null, data?: { shareUrl?: string; section?: string }) => {
			if (data?.shareUrl) {
				setShareUrl(data.shareUrl);
			} else {
				navigate(`/${dialog}`);
			}
			if (data?.section) {
				setSectionToScrollTo(data.section);
			} else {
				setSectionToScrollTo(undefined);
			}
		},
		[navigate]
	);

	const closeDialog = useCallback(() => {
		if (shareUrl) {
			setShareUrl("");
		} else if (activeDialog) {
			navigate("/");
		}
		setSectionToScrollTo(undefined);
	}, [activeDialog, navigate, shareUrl]);

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
