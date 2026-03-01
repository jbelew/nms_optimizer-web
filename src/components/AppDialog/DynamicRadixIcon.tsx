import React from "react";

import { radixIconRegistry } from "../../utils/radixIconRegistry";

interface DynamicRadixIconProps {
	name: string;
	className?: string;
	style?: React.CSSProperties;
	size?: number | string;
	color?: string;
}

/**
 * Dynamically renders a Radix UI icon by its name from a pre-defined registry.
 * This approach ensures that only used icons are included in the bundle.
 *
 * @example
 * <DynamicRadixIcon name="InfoCircledIcon" size={24} color="blue" />
 */
const DynamicRadixIcon: React.FC<DynamicRadixIconProps> = ({
	name,
	className,
	style,
	size,
	color,
}) => {
	// Map the incoming name to a registry key
	const iconName = name.endsWith("Icon") ? name : `${name}Icon`;
	const IconComponent = radixIconRegistry[iconName];

	if (!IconComponent) {
		console.warn(`Radix Icon "${iconName}" not found.`);

		return null;
	}

	const iconStyles: React.CSSProperties = {
		display: "inline-block",
		verticalAlign: "middle",
		width: size,
		height: size,
		color: color,
		...style,
	};

	return <IconComponent className={className} style={iconStyles} />;
};

export default DynamicRadixIcon;
