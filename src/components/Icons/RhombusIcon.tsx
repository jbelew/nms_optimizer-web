/**
 * Rhombus shape icon component.
 *
 * @remarks
 * This module provides a simple, decorative SVG icon used primarily for
 * UI markers and bullets.
 *
 * @category Components
 * @see {@link RhombusIcon}
 */

import React from "react";

/**
 * A purely decorative SVG component rendering a rhombus shape.
 *
 * @remarks
 * It inherits standard SVG properties, allowing for easy customization of size,
 * color, and other attributes.
 *
 * @param {React.SVGProps<SVGSVGElement>} props - Standard SVG attributes.
 * @returns {JSX.Element} The rendered SVG icon.
 * @component
 * @category Components
 *
 * @example
 * ```tsx
 * <RhombusIcon width={16} height={16} fill="red" />
 * // renders red rhombus icon
 * ```
 */
const RhombusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M12 2L22 12L12 22L2 12L12 2Z"
			fill="currentColor"
		/>
	</svg>
);

export default RhombusIcon;
