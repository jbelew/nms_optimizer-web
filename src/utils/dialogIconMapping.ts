// src/utils/dialogIconMapping.ts

import type { IconProps } from "@radix-ui/react-icons/dist/types";
import type { CSSProperties } from "react";
import {
	CounterClockwiseClockIcon,
	ExclamationTriangleIcon,
	GlobeIcon,
	InfoCircledIcon,
	PieChartIcon,
	QuestionMarkCircledIcon,
	ReloadIcon,
	Share2Icon,
} from "@radix-ui/react-icons";

/**
 * @interface DialogIconAndStyle
 * @property {React.ElementType<IconProps>|null} IconComponent - The icon component to render.
 * @property {CSSProperties} style - The style to apply to the icon.
 */
interface DialogIconAndStyle {
	IconComponent: React.ElementType<IconProps> | null;
	style: CSSProperties;
}

/**
 * A map of dialog title keys to their corresponding icon components.
 * @type {Record<string, React.ElementType<IconProps>>}
 */
const iconMap: Record<string, React.ElementType<IconProps>> = {
	"dialogs.titles.instructions": QuestionMarkCircledIcon,
	"dialogs.titles.changelog": CounterClockwiseClockIcon,
	"dialogs.titles.about": InfoCircledIcon,
	"dialogs.titles.serverError": ExclamationTriangleIcon,
	"dialogs.titles.translationRequest": GlobeIcon,
	"dialogs.titles.shareLink": Share2Icon,
	"dialogs.titles.userStats": PieChartIcon,
	"dialogs.titles.optimizationAlert": ExclamationTriangleIcon,
	"dialogs.titles.updatePrompt": ReloadIcon,
};

/**
 * A map of dialog title keys to their corresponding icon styles.
 * @type {Record<string, CSSProperties>}
 */
const iconStyle: Record<string, CSSProperties> = {
	"dialogs.titles.serverError": { color: "var(--red-9)" },
	default: { color: "var(--accent-indicator)" },
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
