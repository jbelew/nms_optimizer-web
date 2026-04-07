/**
 * Upload and file action icon component.
 *
 * @remarks
 * This module provides a custom SVG icon designed to represent file uploads
 * and export actions across the application.
 *
 * @see {@link UploadIcon}
 *
 * @category Components
 */

import type { SVGProps } from "react";

/**
 * Props for the `UploadIcon` component.
 */
interface UploadIconProps extends SVGProps<SVGSVGElement> {
	/** The width and height of the icon in pixels. Defaults to `24`. */
	size?: number;
	/** Optional visual weight classification. */
	weight?: "light" | "regular" | "bold";
}

/**
 * A custom SVG icon representing an "upload" or "file" action.
 *
 * @remarks
 * It provides a standardized look for file operations and can be scaled
 * using the `size` prop.
 *
 * @param {UploadIconProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered SVG icon.
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <UploadIcon size={32} />
 * // renders 32x32 upload icon
 * ```
 */
export const UploadIcon = ({ size = 24, ...props }: UploadIconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 256 256"
			fill="currentColor"
			{...props}
		>
			<path d="M212.24,67.76l-40-40A6,6,0,0,0,168,26H88A14,14,0,0,0,74,40V58H56A14,14,0,0,0,42,72V216a14,14,0,0,0,14,14H168a14,14,0,0,0,14-14V198h18a14,14,0,0,0,14-14V72A6,6,0,0,0,212.24,67.76ZM170,216a2,2,0,0,1-2,2H56a2,2,0,0,1-2-2V72a2,2,0,0,1,2-2h77.51L170,106.49Zm32-32a2,2,0,0,1-2,2H182V104a6,6,0,0,0-1.76-4.24l-40-40A6,6,0,0,0,136,58H86V40a2,2,0,0,1,2-2h77.51L202,74.49Zm-60-32a6,6,0,0,1-6,6H88a6,6,0,0,1,0-12h48A6,6,0,0,1,142,152Zm0,32a6,6,0,0,1-6,6H88a6,6,0,0,1,0-12h48A6,6,0,0,1,142,184Z" />
		</svg>
	);
};
