import type { TechTreeRowProps } from "../TechTreeRow/TechTreeRow";
import type { Module } from "./index";
import React from "react";
import { Avatar, CheckboxGroup } from "@radix-ui/themes";

const baseImagePath = "/assets/img/grid/";
const fallbackImage = `${baseImagePath}infra.webp`;

/**
 * Props for the ModuleCheckbox component.
 */
export interface ModuleCheckboxProps {
	module: Module;
	techColor: TechTreeRowProps["techColor"];
	isDisabled: boolean;
}

/**
 * Renders a single, memoized module checkbox item.
 * This component is memoized to prevent re-renders when its props do not change,
 * which is crucial for performance in a large list of checkboxes.
 *
 * @param {ModuleCheckboxProps} props - The props for the component.
 * @returns {JSX.Element} The rendered module checkbox.
 */
const ModuleCheckboxComponent: React.FC<ModuleCheckboxProps> = ({
	module,
	techColor,
	isDisabled,
}) => {
	const imagePath = module.image ? `${baseImagePath}${module.image}` : fallbackImage;

	return (
		<label
			key={module.id}
			className="mb-2 flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:text-[var(--accent-a12)] sm:text-base"
			style={{ cursor: "pointer" }}
		>
			<CheckboxGroup.Item value={module.id} disabled={isDisabled} />
			<Avatar
				size="1"
				radius="full"
				alt={module.label}
				fallback={module.id}
				src={imagePath}
				color={techColor}
			/>
			{module.label}
		</label>
	);
};

export const ModuleCheckbox = React.memo(ModuleCheckboxComponent);
