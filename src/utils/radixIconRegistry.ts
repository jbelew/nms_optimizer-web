import {
	CounterClockwiseClockIcon,
	DownloadIcon,
	ExclamationTriangleIcon,
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
 * Importing icons individually here allows Rollup to tree-shake the
 * @radix-ui/react-icons library, significantly reducing build size.
 */
export const radixIconRegistry: Record<string, React.ElementType> = {
	CounterClockwiseClockIcon,
	DownloadIcon,
	ExclamationTriangleIcon,
	FileIcon,
	GearIcon,
	GlobeIcon,
	InfoCircledIcon,
	OpenInNewWindowIcon,
	PieChartIcon,
	QuestionMarkCircledIcon,
	ReloadIcon,
	Share1Icon,
};
