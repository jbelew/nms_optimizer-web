import React from "react";

import { radixIconRegistry } from "@/utils/icons/iconRegistry";

/**
 * Props for the `DynamicRadixIcon` component.
 *
 * @category Components
 */
interface DynamicRadixIconProps {
	/** Optional CSS class name. */
	className?: string;
	/** The fill or stroke color of the icon. */
	color?: string;
	/** The name of the icon in the registry (e.g., 'InfoCircled'). **Suffixing with 'Icon' is optional.** */
	name: string;
	/** The width and height of the icon. Accepts CSS lengths. */
	size?: number | string;
	/** Optional inline styles. */
	style?: React.CSSProperties;
}

/**
 * A utility component that renders Radix UI icons based on a string identifier.
 *
 * @remarks
 * It looks up the icon component in the `radixIconRegistry` to ensure that only
 * explicitly registered icons are bundled. It applies standard dimensions and
 * colors based on the provided props.
 *
 * @param {DynamicRadixIconProps} props - Component properties.
 *
 * @returns {JSX.Element | null} The rendered icon component, or `null` if not found.
 *
 * @see {@link radixIconRegistry}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <DynamicRadixIcon
 *   name="InfoCircled"
 *   size={24}
 *   color="blue"
 *   className="my-icon"
 * />
 * // mounts InfoCircledIcon with 24px width/height and blue color
 * ```
 */
const DynamicRadixIcon: React.FC<DynamicRadixIconProps> = ({
	className,
	color,
	name,
	size,
	style,
}) => {
	// Map the incoming name to a registry key
	const iconName = name.endsWith("Icon") ? name : `${name}Icon`;
	const IconComponent = radixIconRegistry[iconName];

	if (!IconComponent) {
		console.warn(`Radix Icon "${iconName}" not found.`);

		return null;
	}

	const iconStyles: React.CSSProperties = {
		color: color,
		display: "inline-block",
		height: size,
		verticalAlign: "middle",
		width: size,
		...style,
	};

	return <IconComponent className={className} style={iconStyles} />;
};

export default DynamicRadixIcon;
