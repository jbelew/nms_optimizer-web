// src/components/LanguageSelector/LanguageSelector.tsx
import "./LanguageSelector.css";

import React, { useMemo } from "react";
import { GlobeIcon } from "@radix-ui/react-icons";
import { DropdownMenu, IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

// Import your SVG flag components
import deFlagPath from "../../assets/svg/flags/de.svg";
import esFlagPath from "../../assets/svg/flags/es.svg";
import frFlagPath from "../../assets/svg/flags/fr.svg";
import ptFlagPath from "../../assets/svg/flags/pt.svg";
import usFlagPath from "../../assets/svg/flags/us.svg";
import xxFlagPath from "../../assets/svg/flags/xx.svg";
import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";

interface LanguageFlagPaths {
	[key: string]: string; // Path to the SVG
}

// Map language codes to SVG components
const languageFlagPaths: LanguageFlagPaths = {
	en: usFlagPath,
	de: deFlagPath,
	es: esFlagPath,
	fr: frFlagPath,
	pt: ptFlagPath,
	// Add other languages and their flag classes
};

/**
 * LanguageSelector component allows users to change the application's language.
 * It displays a dropdown with flags and names of supported languages.
 */
const LanguageSelector: React.FC = () => {
	const isSmallAndUp = useBreakpoint("640px");
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const currentLanguage = i18n.language.split("-")[0]; // Get base language code
	const { sendEvent } = useAnalytics();
	const OTHER_LANGUAGES = ["es", "fr", "de", "pt"];

	const supportedLanguages = useMemo(() => {
		const availableLanguageCodes = Object.keys(i18n.services.resourceStore.data || {});
		return availableLanguageCodes
			.map((code) => {
				const label =
					(i18n.getResource(code, "translation", "languageInfo.nativeName") as
						| string
						| undefined) ?? code.toUpperCase();
				const flagPath = languageFlagPaths[code] || xxFlagPath; // Fallback flag path
				return { code, label, flagPath };
			})
			.filter((lang) => lang.label && lang.label !== lang.code.toUpperCase() && lang.flagPath)
			.sort((a, b) => a.label.localeCompare(b.label));
	}, [i18n]);

	/**
	 * Handles the language change event.
	 * Navigates to the URL with the new language code and updates i18n state.
	 * @param {string} newLang - The language code to change to.
	 */
	const handleLanguageChange = (newLang: string) => {
		const pathParts = location.pathname.split("/").filter(Boolean);
		const langCand = pathParts[0];
		let basePath = location.pathname;

		if (OTHER_LANGUAGES.includes(langCand)) {
			basePath = location.pathname.substring(langCand.length + 1) || "/";
		}

		const newPath =
			newLang === "en" ? basePath : `/${newLang}${basePath === "/" ? "" : basePath}`;

		void i18n.changeLanguage(newLang);
		navigate(newPath);

		sendEvent({
			category: "User Interactions",
			action: "languageSelection",
			label: newLang,
			value: 1,
		});
	};

	/**
	 * Handles the click event for the "Request Translation" button.
	 * Navigates to the translation page.
	 */
	const handleRequestTranslationClick = () => {
		const lang = (i18n.language || "en").split("-")[0];
		const path = lang === "en" ? "/translation" : `/${lang}/translation`;
		navigate(path);
	};

	const currentFlagPath =
		supportedLanguages.find((lang) => lang.code === currentLanguage)?.flagPath || xxFlagPath;

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<IconButton
					variant="ghost"
					radius="full"
					size={isSmallAndUp ? "2" : "1"}
					aria-label={t("languageInfo.changeLanguage") || "Change language"}
				>
					<img
						src={currentFlagPath}
						alt={t("languageInfo.changeLanguage") || "Change language"}
						className="h-[12] w-[16] sm:h-[14] sm:w-[20]"
					/>
				</IconButton>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content sideOffset={5} align="end">
				<DropdownMenu.Label className="selectLanguage__header">
					{t("languageInfo.selectLanguage") || "Select Language"}
				</DropdownMenu.Label>
				<DropdownMenu.RadioGroup
					value={currentLanguage}
					onValueChange={handleLanguageChange}
				>
					{supportedLanguages.map(({ code, label, flagPath }) => (
						<DropdownMenu.RadioItem key={code} value={code}>
							<img src={flagPath} alt={label} className="mr-2 h-auto w-5" />
							<span className="ml-1 font-medium">{label}</span>
						</DropdownMenu.RadioItem>
					))}
				</DropdownMenu.RadioGroup>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onClick={handleRequestTranslationClick} className="font-medium">
					<GlobeIcon className="mr-2 h-auto w-5" style={{ color: "var(--accent-a11)" }} />
					{t("translationRequest.openDialogLabel")}
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	);
};

export default React.memo(LanguageSelector);
