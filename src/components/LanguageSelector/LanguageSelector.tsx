/**
 * Internationalization and language switching module.
 *
 * @remarks
 * This module provides the `LanguageSelector` UI, allowing users to localize
 * the application interface. It handles route synchronization and asset
 * loading for flags.
 *
 * @see {@link LanguageSelector}
 * @see {@link ./LanguageSelector.test.tsx Unit Tests}
 *
 * @category Components
 */

import "./LanguageSelector.scss";

import React, { useTransition } from "react";
import { GlobeIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu, IconButton, Separator } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

// Import your SVG flag components
import deFlagPath from "@/assets/svg/flags/de.svg";
import esFlagPath from "@/assets/svg/flags/es.svg";
import frFlagPath from "@/assets/svg/flags/fr.svg";
import itFlagPath from "@/assets/svg/flags/it.svg";
import ptFlagPath from "@/assets/svg/flags/pt.svg";
import usFlagPath from "@/assets/svg/flags/us.svg";
import xxFlagPath from "@/assets/svg/flags/xx.svg";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { languages, nativeLanguageNames } from "@/i18n/i18n";
import { useErrorStore } from "@/store/ui/uiStore";

/**
 * Mapping of language codes to their respective SVG flag asset paths.
 *
 * @remarks
 * Uses local SVG imports for consistent rendering across environments.
 *
 * @category Components
 */
interface LanguageFlagPaths {
	[key: string]: string;
}

const languageFlagPaths: LanguageFlagPaths = {
	de: deFlagPath,
	en: usFlagPath,
	es: esFlagPath,
	fr: frFlagPath,
	it: itFlagPath,
	pt: ptFlagPath,
};

/**
 * A component that allows users to toggle between supported application languages.
 *
 * @remarks
 * It provides a dropdown menu featuring flags and native language names.
 * Changing the language updates the global `i18next` state, synchronizes the
 * URL path prefix, and sends an analytics event.
 *
 * @returns {JSX.Element} The rendered language selection dropdown.
 *
 * @see {@link useTranslation} for internationalization state.
 * @see {@link useAnalytics} for event tracking.
 * @see {@link ./LanguageSelector.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <LanguageSelector />
 * ```
 */
export const LanguageSelector: React.FC = () => {
	const isSm = useBreakpoint("640px");
	const isMd = useBreakpoint("1024px");
	const { i18n, t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const currentLanguage = i18n.language.split("-")[0]; // Get base language code
	const { sendDeferredEvent } = useAnalytics();
	const { clearErrors } = useErrorStore();
	const [, startTransition] = useTransition();

	const availableLanguageCodes = ((i18n.options.supportedLngs as string[]) || []).filter((code) =>
		languages.includes(code)
	);

	const supportedLanguages = availableLanguageCodes
		.map((code) => {
			const label = nativeLanguageNames[code] ?? code.toUpperCase();
			const flagPath = languageFlagPaths[code] || xxFlagPath; // Fallback flag path

			return { code, flagPath, label };
		})
		.filter((lang) => lang.flagPath)
		.sort((a, b) => a.label.localeCompare(b.label));

	/**
	 * Finalizes the language transition by updating the URL and i18n store.
	 *
	 * @remarks
	 * Automatically handles URL prefixing (e.g., `/fr/`) and preserves query parameters.
	 *
	 * @param {string} newLang - The ISO language code to switch to. **Must be supported.**
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```ts
	 * handleLanguageChange("de");
	 * ```
	 */
	const handleLanguageChange = (newLang: string) => {
		clearErrors(); // Clear existing errors to prevent re-display on remount

		const pathParts = location.pathname.split("/").filter(Boolean);
		const langCand = pathParts[0];
		let basePath = location.pathname;

		if (languages.includes(langCand)) {
			basePath = location.pathname.substring(langCand.length + 1) || "/";
		}

		// Ensure trailing slash
		const normalizePath = (p: string) => (p.endsWith("/") ? p : `${p}/`);
		const newPath =
			newLang === "en" ? normalizePath(basePath) : `/${newLang}${normalizePath(basePath)}`;

		// Use startTransition to keep dropdown responsive while handling heavy updates
		startTransition(() => {
			void i18n.changeLanguage(newLang);
			navigate(newPath + window.location.search);
		});

		sendDeferredEvent({
			action: "select_content",
			category: "ui",
			content_type: "language",
			item_id: newLang,
			nonInteraction: false,
			value: 1,
		});
	};

	/**
	 * Navigates the user to the translation request route.
	 *
	 * @remarks
	 * Redirects to the localized `/translation/` page.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```ts
	 * handleRequestTranslationClick();
	 * ```
	 */
	const handleRequestTranslationClick = () => {
		const lang = (i18n.language || "en").split("-")[0];
		const path = lang === "en" ? "/translation/" : `/${lang}/translation/`;
		navigate(path + window.location.search);
	};

	const currentFlagPath =
		supportedLanguages.find((lang) => lang.code === currentLanguage)?.flagPath || xxFlagPath;

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{!isSm || isMd ? (
					<Button
						aria-label={t("languageInfo.changeLanguage") || "Change language"}
						variant="soft"
					>
						<img
							alt=""
							className="h-3 w-4 sm:h-3.5 sm:w-5"
							height="14"
							src={currentFlagPath}
							width="20"
						/>
						<Separator decorative orientation="vertical" />
						<DropdownMenu.TriggerIcon />
					</Button>
				) : (
					<IconButton
						aria-label={t("languageInfo.changeLanguage") || "Change language"}
						variant="soft"
					>
						<img
							alt=""
							className="h-[12] w-[16] sm:h-[14] sm:w-[20]"
							height="12"
							src={currentFlagPath}
							width="16"
						/>
					</IconButton>
				)}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" sideOffset={5}>
				<DropdownMenu.Label className="selectLanguage__header heading-styled">
					{t("languageInfo.selectLanguage") || "Select Language"}
				</DropdownMenu.Label>
				<DropdownMenu.RadioGroup
					onValueChange={handleLanguageChange}
					value={currentLanguage}
				>
					{supportedLanguages.map(({ code, flagPath, label }) => (
						<DropdownMenu.RadioItem key={code} value={code}>
							<img
								alt={label}
								className="mr-2 h-auto w-5"
								height="14"
								src={flagPath}
								width="20"
							/>
							<span className="ml-1 font-medium">{label}</span>
						</DropdownMenu.RadioItem>
					))}
				</DropdownMenu.RadioGroup>
				<DropdownMenu.Separator />
				<DropdownMenu.Item className="font-medium" onClick={handleRequestTranslationClick}>
					<GlobeIcon className="mr-2 h-auto w-5" style={{ color: "var(--accent-a11)" }} />
					{t("translationRequest.openDialogLabel")}
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	);
};
