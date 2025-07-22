// src/components/LanguageSelector/LanguageSelector.tsx
import "./LanguageSelector.css";

import React, { useMemo } from "react";
import { DropdownMenu, IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

// Import your SVG flag components
import deFlagPath from "../../assets/svg/flags/de.svg";
import esFlagPath from "../../assets/svg/flags/es.svg";
import frFlagPath from "../../assets/svg/flags/fr.svg";
import usFlagPath from "../../assets/svg/flags/us.svg";
import xxFlagPath from "../../assets/svg/flags/xx.svg";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useBreakpoint } from "../../hooks/useBreakpoint";

interface LanguageFlagPaths {
	[key: string]: string; // Path to the SVG
}

// Map language codes to SVG components
const languageFlagPaths: LanguageFlagPaths = {
	en: usFlagPath,
	de: deFlagPath,
	es: esFlagPath,
	fr: frFlagPath,
	// Add other languages and their flag classes
};

const LanguageSelector: React.FC = () => {
	const isSmallAndUp = useBreakpoint("640px");
	const { t, i18n } = useTranslation();
	const currentLanguage = i18n.language.split("-")[0]; // Get base language code
	const { sendEvent } = useAnalytics();

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

	const handleLanguageChange = (langCode: string) => {
		void i18n.changeLanguage(langCode);
		sendEvent({
			category: "User Interactions",
			action: "languageSelection",
			label: langCode,
		});
	};

	const currentFlagPath =
		supportedLanguages.find((lang) => lang.code === currentLanguage)?.flagPath || xxFlagPath;

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<IconButton
					variant="soft"
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
			<DropdownMenu.Content
				color="cyan"
				sideOffset={5}
				align="end"
				// style={{ backgroundColor: "var(--accent-2)" }}
			>
				<DropdownMenu.Label className="selectLanguage__header">
					{t("languageInfo.selectLanguage") || "Select Language"}
				</DropdownMenu.Label>
				<DropdownMenu.RadioGroup value={currentLanguage} onValueChange={handleLanguageChange}>
					{supportedLanguages.map(({ code, label, flagPath }) => (
						<DropdownMenu.RadioItem key={code} value={code} className="font-medium">
							<img src={flagPath} alt={label} className="w-5 h-auto mr-2" />
							<span className="ml-1">{label}</span>
						</DropdownMenu.RadioItem>
					))}
				</DropdownMenu.RadioGroup>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	);
};

export default React.memo(LanguageSelector);
