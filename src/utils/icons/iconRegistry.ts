/**
 * Icon registry and mapping utility module.
 *
 * @remarks
 * This module centralizes the selection and management of icons used across the
 * application. It includes a registry for Radix UI icons to optimize bundle size
 * and a mapping utility for dialog-specific icons and styles.
 *
 * @category Utilities
 */

import type { CSSProperties, ElementType } from "react";
import {
	CameraIcon,
	CounterClockwiseClockIcon,
	DownloadIcon,
	ExclamationTriangleIcon,
	EyeNoneIcon,
	EyeOpenIcon,
	FileIcon,
	GearIcon,
	GlobeIcon,
	InfoCircledIcon,
	OpenInNewWindowIcon,
	PieChartIcon,
	QuestionMarkCircledIcon,
	ReloadIcon,
	RocketIcon,
	Share1Icon,
} from "@radix-ui/react-icons";

/**
 * A registry of Radix UI icons used throughout the application.
 *
 * @remarks
 * Only icons explicitly listed in this registry are included in the final
 * production bundle. This central mapping also simplifies the use of
 * dynamic icon selection in components like `AppDialog`.
 *
 * @category Utilities
 */
export const radixIconRegistry: Record<string, ElementType> = {
	CameraIcon,
	CounterClockwiseClockIcon,
	DownloadIcon,
	ExclamationTriangleIcon,
	EyeOpenIcon,
	FileIcon,
	GearIcon,
	GlobeIcon,
	InfoCircledIcon,
	OpenInNewWindowIcon,
	PieChartIcon,
	QuestionMarkCircledIcon,
	ReloadIcon,
	RocketIcon,
	Share1Icon,
};

/**
 * Represents an icon component and its associated CSS styles.
 *
 * @category Utilities
 */
interface DialogIconAndStyle {
	/** The React component used to render the icon. */
	IconComponent: ElementType | null;
	/** The CSS properties to apply to the icon container or component. */
	style: CSSProperties;
}

/**
 * A map of dialog title translation keys to their corresponding Radix UI icon components.
 *
 * @category Utilities
 */
const iconMap: Record<string, ElementType> = {
	"dialog.buildName.title": DownloadIcon,
	"dialogs.titles.about": QuestionMarkCircledIcon,
	"dialogs.titles.changelog": CounterClockwiseClockIcon,
	"dialogs.titles.instructions": InfoCircledIcon,
	"dialogs.titles.optimizationAlert": ExclamationTriangleIcon,
	"dialogs.titles.performance": RocketIcon,
	"dialogs.titles.privacy": EyeNoneIcon,
	"dialogs.titles.serverError": ExclamationTriangleIcon,
	"dialogs.titles.shareLink": Share1Icon,
	"dialogs.titles.translationRequest": GlobeIcon,
	"dialogs.titles.updatePrompt": ReloadIcon,
	"dialogs.titles.userStats": PieChartIcon,
	"dialogs.titles.welcome": InfoCircledIcon,
};

/**
 * A map of dialog title translation keys to their corresponding CSS styles.
 *
 * @category Utilities
 */
const iconStyle: Record<string, CSSProperties> = {
	default: { color: "var(--accent-track)" },
	"dialogs.titles.optimizationAlert": { color: "var(--red-track)" },
	"dialogs.titles.performance": { color: "var(--cyan-track)" },
	"dialogs.titles.serverError": { color: "var(--red-track)" },
};

/**
 * Returns the appropriate icon component and style for a given dialog title key.
 *
 * @remarks
 * This utility helps maintain visual consistency across different dialog types by
 * centralizing the icon selection logic. It defaults to an accent color if
 * no specific style is mapped.
 *
 * @param {string} [titleKey] - The translation key for the dialog title.
 *
 * @returns {DialogIconAndStyle} An object containing the `IconComponent` and its `style`.
 *
 * @see {@link iconMap}
 * @see {@link iconStyle}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const { IconComponent, style } = getDialogIconAndStyle("dialogs.titles.about");
 * // returns DialogIconAndStyle
 * ```
 */
export const getDialogIconAndStyle = (titleKey: string | undefined): DialogIconAndStyle => {
	const IconComponent = titleKey ? iconMap[titleKey] : null;
	const style = titleKey ? iconStyle[titleKey] || iconStyle.default : iconStyle.default;

	return { IconComponent, style };
};
