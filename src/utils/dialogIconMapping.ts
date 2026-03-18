// src/utils/dialogIconMapping.ts

import type { CSSProperties, ElementType } from "react";
import {
	CounterClockwiseClockIcon,
	DownloadIcon,
	ExclamationTriangleIcon,
	EyeNoneIcon,
	GlobeIcon,
	InfoCircledIcon,
	PieChartIcon,
	QuestionMarkCircledIcon,
	ReloadIcon,
	Share1Icon,
} from "@radix-ui/react-icons";

/**
 * Represents an icon component and its associated CSS styles.
 */
interface DialogIconAndStyle {
	/** The React component used to render the icon. */
	IconComponent: ElementType | null;
	/** The CSS properties to apply to the icon container or component. */
	style: CSSProperties;
}

/**
 * A map of dialog title translation keys to their corresponding Radix UI icon components.
 */
const iconMap: Record<string, ElementType> = {
	"dialogs.titles.instructions": InfoCircledIcon,
	"dialogs.titles.changelog": CounterClockwiseClockIcon,
	"dialogs.titles.about": QuestionMarkCircledIcon,
	"dialogs.titles.serverError": ExclamationTriangleIcon,
	"dialogs.titles.translationRequest": GlobeIcon,
	"dialogs.titles.shareLink": Share1Icon,
	"dialogs.titles.userStats": PieChartIcon,
	"dialogs.titles.optimizationAlert": ExclamationTriangleIcon,
	"dialogs.titles.privacy": EyeNoneIcon,
	"dialogs.titles.updatePrompt": ReloadIcon,
	"dialog.buildName.title": DownloadIcon,
	"dialogs.titles.welcome": InfoCircledIcon,
};

/**
 * A map of dialog title translation keys to their corresponding CSS styles.
 */
const iconStyle: Record<string, CSSProperties> = {
	"dialogs.titles.serverError": { color: "var(--red-track)" },
	"dialogs.titles.optimizationAlert": { color: "var(--red-track)" },
	default: { color: "var(--accent-track)" },
};

/**
 * Returns the appropriate icon component and style for a given dialog title key.
 *
 * This utility helps maintain visual consistency across different dialog types by
 * centralizing the icon selection logic.
 *
 * @param {string} [titleKey] - The translation key for the dialog title.
 * @returns {DialogIconAndStyle} An object containing the `IconComponent` and its `style`.
 *
 * @example
 * const { IconComponent, style } = getDialogIconAndStyle("dialogs.titles.about");
 */
export const getDialogIconAndStyle = (titleKey: string | undefined): DialogIconAndStyle => {
	const IconComponent = titleKey ? iconMap[titleKey] : null;
	const style = titleKey ? iconStyle[titleKey] || iconStyle.default : iconStyle.default;

	return { IconComponent, style };
};
