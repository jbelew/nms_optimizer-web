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
 * This central registry facilitates tree-shaking by ensuring only the icons listed here
 * are included in the final production bundle.
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
