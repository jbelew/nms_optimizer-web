// src/utils/dialogIconMapping.ts

import type { CSSProperties } from "react";
import {
	CounterClockwiseClockIcon,
	ExclamationTriangleIcon,
	GlobeIcon,
	InfoCircledIcon,
	PieChartIcon,
	QuestionMarkCircledIcon,
	ReloadIcon,
	Share1Icon,
} from "@radix-ui/react-icons";

import { DownloadIcon } from "@/components/Icons/DownloadIcon";

/**
 * @interface DialogIconAndStyle
 * @property {React.ElementType | null} IconComponent - The icon component to render.
 * @property {CSSProperties} style - The style to apply to the icon.
 */
interface DialogIconAndStyle {
	IconComponent: React.ElementType | null;
	style: CSSProperties;
}

/**
 * A map of dialog title keys to their corresponding icon components.
 */
const iconMap: Record<string, React.ElementType> = {
	"dialogs.titles.instructions": InfoCircledIcon,
	"dialogs.titles.changelog": CounterClockwiseClockIcon,
	"dialogs.titles.about": QuestionMarkCircledIcon,
	"dialogs.titles.serverError": ExclamationTriangleIcon,
	"dialogs.titles.translationRequest": GlobeIcon,
	"dialogs.titles.shareLink": Share1Icon,
	"dialogs.titles.userStats": PieChartIcon,
	"dialogs.titles.optimizationAlert": ExclamationTriangleIcon,
	"dialogs.titles.updatePrompt": ReloadIcon,
	"dialog.buildName.title": DownloadIcon,
};

/**
 * A map of dialog title keys to their corresponding icon styles.
 * @type {Record<string, CSSProperties>}
 */
const iconStyle: Record<string, CSSProperties> = {
	"dialogs.titles.serverError": { color: "var(--red-track)" },
	"dialogs.titles.optimizationAlert": { color: "var(--red-track)" },
	default: { color: "var(--accent-track)" },
};

/**
 * Returns the appropriate icon component and style for a given dialog title key.
 *
 * @param {string | undefined} titleKey - The translation key for the dialog title.
 * @returns {DialogIconAndStyle} An object containing the IconComponent and its style.
 */
export const getDialogIconAndStyle = (titleKey: string | undefined): DialogIconAndStyle => {
	const IconComponent = titleKey ? iconMap[titleKey] : null;
	const style = titleKey ? iconStyle[titleKey] || iconStyle.default : iconStyle.default;

	return { IconComponent, style };
};
