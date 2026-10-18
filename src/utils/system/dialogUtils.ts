import React, { createContext, use, useState } from "react";
import type { i18n as I18nInstance } from "i18next";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import type { PageName } from "@/routeConfig";
import { languages } from "@/routeConfig";
import { safeGetItem, safeSetItem } from "@/utils/browser/environment";
import { getPageByPath, ROUTED_DIALOG_IDS } from "@shared/page-registry.js";

/**
 * Returns the list of language codes supported by the application.
 *
 * @remarks
 * Inspects the active `i18next` resource store data keys to determine which
 * language bundles are registered.
 *
 * @param i18nInstance - The `i18next` instance.
 *
 * @returns An array of supported language codes (e.g., `['en', 'es', 'fr']`).
 *
 * @see {@link useSupportedLanguages}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * getSupportedLanguages(i18n);
 * // returns ['en', 'es', 'fr', ...]
 * ```
 */
export const getSupportedLanguages = (i18nInstance: I18nInstance): string[] => {
	return Object.keys(i18nInstance.services.resourceStore.data || {});
};

/**
 * Hook to access the list of supported language codes from the active `i18next` instance.
 *
 * @remarks
 * Reads the active `i18next` instance from `useTranslation` and delegates to
 * {@link getSupportedLanguages}.
 *
 * @returns An array of supported language codes.
 *
 * @see {@link getSupportedLanguages}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const langs = useSupportedLanguages();
 * // returns ['en', 'es', 'fr', ...]
 * ```
 */
export const useSupportedLanguages = (): string[] => {
	const { i18n } = useTranslation();

	return getSupportedLanguages(i18n);
};

/**
 * Context type for the application's Routed Dialog system.
 *
 * @see {@link DialogProvider}
 *
 * @category Dialog
 */
export interface DialogContextType {
	/** The identifier of the Routed Dialog currently being displayed. */
	activeDialog: DialogType;
	/**
	 * Navigates away from the active Routed Dialog or closes the share modal.
	 *
	 * @returns {void} Side-effects only.
	 */
	closeDialog: () => void;
	/**
	 * Sets the tutorial completion flag.
	 *
	 * @returns {void} Side-effects only.
	 */
	markTutorialFinished: () => void;
	/**
	 * Sets the user visited flag.
	 *
	 * @returns {void} Side-effects only.
	 */
	markUserVisited: () => void;
	/**
	 * Navigates to a Routed Dialog path or sets external data for the share dialog.
	 *
	 * @param {NonNullable<DialogType> | null} dialog - The dialog to show.
	 * @param {object} [data] - Optional metadata.
	 * @param {string} [data.section] - Optional element ID within the dialog to scroll to.
	 * @param {string} [data.shareUrl] - Optional URL for the share link dialog.
	 *
	 * @returns {void} Side-effects only.
	 */
	openDialog: (
		dialog: NonNullable<DialogType> | null,
		data?: { section?: string; shareUrl?: string },
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
 * Props for the {@link DialogProvider} component.
 *
 * @category Dialog
 */
export interface DialogProviderProps {
	/** The child components wrapped by the dialog context provider. */
	children: React.ReactNode;
}

/**
 * Union type of all valid Routed Dialog identifiers derived from the Unified Page Registry.
 *
 * @see {@link DialogProvider}
 * @see {@link PageName}
 *
 * @category Dialog
 */
export type DialogType = null | PageName;

/** Set of valid Routed Dialog identifiers for efficient lookup derived from Unified Page Registry. */
const VALID_DIALOGS = new Set<string>(ROUTED_DIALOG_IDS);

/**
 * React Context for managing and providing global dialog-related state.
 *
 * @default undefined
 *
 * @see {@link DialogProvider}
 * @see {@link useDialog}
 *
 * @category Dialog
 */
export const DialogContext = createContext<DialogContextType | undefined>(undefined);

/**
 * Resolves the active Routed Dialog identifier from the given URL pathname.
 *
 * @remarks
 * Matches the localized or root `pathname` against the Unified Page Registry
 * and validates that the matched route represents a Routed Dialog.
 *
 * @param pathname - The current URL pathname to parse.
 * @param supportedLangs - The list of language codes currently supported by the app.
 *
 * @returns The matching Routed Dialog identifier, or `null` if none matches.
 *
 * @see {@link getPageByPath}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * getActiveDialogFromPathname("/fr/about", ["en", "fr"]);
 * // returns "about"
 * ```
 */
export const getActiveDialogFromPathname = (
	pathname: string,
	supportedLangs: string[],
): DialogType => {
	const page = getPageByPath(pathname, supportedLangs);

	return page?.isDialog && VALID_DIALOGS.has(page.id) ?
			(page.id as NonNullable<DialogType>)
		:	null;
};

/**
 * Builds a normalized, trailing-slash-terminated URL pathname for a target locale.
 *
 * @remarks
 * Strips any existing supported locale prefix from `pathname`, normalizes `targetLang`
 * to its primary language subtag (e.g., `"en-US"` → `"en"`), and prefixes non-English
 * locales while keeping English routes at the root.
 *
 * @param pathname - Current pathname (with or without an existing locale prefix).
 * @param targetLang - Target ISO language code or locale tag (e.g., `'en'`, `'fr'`, `'en-US'`).
 * @param [supportedLangs=languages] - Supported language codes used to strip an existing prefix.
 *
 * @returns The localized pathname ending with a trailing slash.
 *
 * @default languages
 *
 * @see {@link languages}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * buildLocalizedPath("/es/instructions/", "fr");
 * // returns "/fr/instructions/"
 * ```
 */
export const buildLocalizedPath = (
	pathname: string,
	targetLang: string,
	supportedLangs: string[] = languages,
): string => {
	const normalizedLang = (targetLang || "en").split("-")[0];
	const pathParts = pathname.split("/").filter(Boolean);
	const langCandidate = pathParts[0];
	let basePath = pathname;

	if (supportedLangs.includes(langCandidate)) {
		basePath = pathname.substring(langCandidate.length + 1) || "/";
	}

	const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;

	return normalizedLang === "en" ? normalizedBase : `/${normalizedLang}${normalizedBase}`;
};

/**
 * Provider component for managing the state and routing of Routed Dialogs.
 *
 * @remarks
 * Synchronizes the currently active Routed Dialog with the browser's URL path,
 * manages persistent `localStorage` flags (`userVisited`, `tutorialFinished`),
 * and provides methods to open and close dialogs while preserving language and query parameters.
 *
 * @param props - Component properties.
 *
 * @returns The context provider with dialog state.
 *
 * @see {@link DialogProviderProps}
 * @see {@link useDialog}
 * @see {@link DialogContext}
 * @see {@link ../../context/DialogContext.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Context
 *
 * @example
 * ```tsx
 * <DialogProvider>
 *   <App />
 * </DialogProvider>
 * // provides dialog context to descendants
 * ```
 */
export const DialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { i18n } = useTranslation();

	const [userVisited, setUserVisited] = useState(() => {
		return safeGetItem("userVisited") === "true";
	});

	const [shareUrl, setShareUrl] = useState<string>("");
	const [sectionToScrollTo, setSectionToScrollTo] = useState<string | undefined>(undefined);
	const [tutorialFinished, setTutorialFinished] = useState(() => {
		return safeGetItem("tutorialFinished") === "true";
	});

	const supportedLangs = getSupportedLanguages(i18n);
	const activeDialog = getActiveDialogFromPathname(location.pathname, supportedLangs);

	const openDialog = React.useCallback(
		(
			dialog: NonNullable<DialogType> | null,
			data?: { section?: string; shareUrl?: string },
		) => {
			if (data?.shareUrl) {
				React.startTransition(() => {
					setShareUrl(data.shareUrl || "");
				});
			} else if (dialog) {
				const path = buildLocalizedPath(`/${dialog}/`, i18n.language);
				navigate(path + window.location.search);
			}

			if (data?.section) {
				setSectionToScrollTo(data.section);
			} else {
				setSectionToScrollTo(undefined);
			}
		},
		[i18n.language, navigate],
	);

	const closeDialog = React.useCallback(() => {
		if (shareUrl) {
			setShareUrl("");
		} else if (activeDialog) {
			const path = buildLocalizedPath("/", i18n.language);
			navigate(path + window.location.search);
		}

		setSectionToScrollTo(undefined);
	}, [activeDialog, i18n.language, navigate, shareUrl]);

	const markTutorialFinished = React.useCallback(() => {
		if (!tutorialFinished) {
			setTutorialFinished(true);
			safeSetItem("tutorialFinished", "true");
		}
	}, [tutorialFinished]);

	const markUserVisited = React.useCallback(() => {
		if (!userVisited) {
			setUserVisited(true);
			safeSetItem("userVisited", "true");
		}
	}, [userVisited]);

	const value = React.useMemo(
		() => ({
			activeDialog,
			closeDialog,
			markTutorialFinished,
			markUserVisited,
			openDialog,
			sectionToScrollTo,
			shareUrl,
			tutorialFinished,
			userVisited,
		}),
		[
			activeDialog,
			closeDialog,
			markTutorialFinished,
			markUserVisited,
			openDialog,
			sectionToScrollTo,
			shareUrl,
			tutorialFinished,
			userVisited,
		],
	);

	return React.createElement(DialogContext.Provider, { value }, children);
};

/**
 * Custom hook for accessing the {@link DialogContext}.
 *
 * @remarks
 * Reads the active {@link DialogContext} provided by {@link DialogProvider} and throws
 * if invoked outside a provider boundary.
 *
 * @returns The active dialog context value.
 *
 * @throws {Error} If called outside of a {@link DialogProvider}.
 *
 * @see {@link DialogContext}
 * @see {@link DialogProvider}
 * @see {@link DialogContextType}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example Hook usage for dialog control
 * ```ts
 * const { openDialog } = useDialog();
 * openDialog("changelog");
 * // navigates to /changelog/
 * ```
 */
export const useDialog = (): DialogContextType => {
	const context = use(DialogContext);

	if (context === undefined) {
		throw new Error("useDialog must be used within a DialogProvider");
	}

	return context;
};
