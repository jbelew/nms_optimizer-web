/**
 * Centralized registry for Radix UI icons.
 *
 * @remarks
 * This module ensures consistent icon usage across the application and
 * optimizes the build bundle by facilitating tree-shaking for `@radix-ui/react-icons`.
 *
 * @see {@link radixIconRegistry}
 *
 * @category Utilities
 */

import { ElementType } from "react";
import {
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
	Share1Icon,
	CameraIcon,
};
