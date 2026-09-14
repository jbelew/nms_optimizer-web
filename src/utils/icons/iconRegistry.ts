/**
 * Icon registry and mapping utility module.
 *
 * @remarks
 * This module centralizes the selection and management of icons used across the
 * application. It includes a registry for Radix UI icons to optimize bundle size
 * and integrates with the Unified Page Registry for dialog-specific icons and styles.
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
import { PAGE_REGISTRY } from "@shared/page-registry.js";

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
};

/**
 * Represents an icon component and its associated CSS styles.
 *
 * @category Utilities
 */
export interface DialogIconAndStyle {
	/** The React component used to render the icon. */
	IconComponent: ElementType | null;
	/** The CSS properties to apply to the icon container or component. */
	style: CSSProperties;
}

/**
 * Static map of non-routed dialog title translation keys to their Radix UI icon components.
 *
 * @category Utilities
 */
const staticIconMap: Record<string, ElementType> = {
	"dialog.buildName.title": DownloadIcon,
	"dialogs.titles.optimizationAlert": ExclamationTriangleIcon,
	"dialogs.titles.serverError": ExclamationTriangleIcon,
	"dialogs.titles.shareLink": Share1Icon,
	"dialogs.titles.updatePrompt": ReloadIcon,
	"dialogs.titles.welcome": InfoCircledIcon,
};

/**
 * Static map of non-routed dialog title translation keys to their CSS styles.
 *
 * @category Utilities
 */
const staticIconStyle: Record<string, CSSProperties> = {
	default: { color: "var(--accent-track)" },
	"dialogs.titles.optimizationAlert": { color: "var(--red-track)" },
	"dialogs.titles.serverError": { color: "var(--red-track)" },
};

/**
 * Complete icon map combining static dialogs and Unified Page Registry definitions.
 *
 * @category Utilities
 */
const iconMap: Record<string, ElementType> = {
	...staticIconMap,
	...Object.fromEntries(
		Object.values(PAGE_REGISTRY)
			.filter((p) => p.dialogTitleKey && p.iconName && radixIconRegistry[p.iconName])
			.map((p) => [p.dialogTitleKey as string, radixIconRegistry[p.iconName as string]])
	),
};

/**
 * Complete icon style map combining static styles and Unified Page Registry definitions.
 *
 * @category Utilities
 */
const iconStyle: Record<string, CSSProperties> = {
	...staticIconStyle,
	...Object.fromEntries(
		Object.values(PAGE_REGISTRY)
			.filter((p) => p.dialogTitleKey && p.iconStyle)
			.map((p) => [p.dialogTitleKey as string, p.iconStyle as CSSProperties])
	),
};

/**
 * Returns the appropriate icon component and style for a given dialog title key.
 *
 * @remarks
 * This utility helps maintain visual consistency across different dialog types by
 * centralizing the icon selection logic. It dynamically resolves icons and styles
 * defined in the Unified Page Registry, defaulting to an accent color if
 * no specific style is mapped.
 *
 * @param {string} [titleKey] - The translation key for the dialog title.
 *
 * @returns {DialogIconAndStyle} An object containing the `IconComponent` and its `style`.
 *
 * @see {@link PAGE_REGISTRY}
 * @see {@link iconMap}
 * @see {@link iconStyle}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const { IconComponent, style } = getDialogIconAndStyle("dialogs.titles.about");
 * // returns DialogIconAndStyle with QuestionMarkCircledIcon
 * ```
 */
export const getDialogIconAndStyle = (titleKey: string | undefined): DialogIconAndStyle => {
	const IconComponent = titleKey ? iconMap[titleKey] : null;
	const style = titleKey ? iconStyle[titleKey] || iconStyle.default : iconStyle.default;

	return { IconComponent, style };
};
