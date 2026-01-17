import type { TechTreeRowProps } from "../TechTreeRow/TechTreeRow";
import type { Module } from "./index";
import React from "react";
import { Avatar, Badge, CheckboxGroup, Code } from "@radix-ui/themes";

const baseImagePath = "/assets/img/grid/";
const fallbackImage = `${baseImagePath}infra.webp`;

/**
 * Formats content within parentheses patterns (...) in a Code tag.
 * Separate function for easier styling experiments.
 */
const formatParentheses = (text: string): React.ReactNode => {
	const pattern = /\([^)]+\)/g;
	const parts = text.split(pattern);
	const matches = text.match(pattern) || [];

	if (matches.length === 0) {
		return text;
	}

	return parts.map((part, index) => (
		<React.Fragment key={index}>
			{part}
			{matches[index] && (
				<Badge ml="1" className="hidden! font-mono! sm:inline!">
					{matches[index].slice(1, -1)}
				</Badge>
			)}
		</React.Fragment>
	));
};

/**
 * Formats a label by wrapping [Pn] patterns (where n is a number) in a Code tag.
 */
const formatLabel = (label: string): React.ReactNode => {
	const pattern = /\[.*?\]/g;
	const parts = label.split(pattern);
	const matches = label.match(pattern) || [];

	if (matches.length === 0) {
		return formatParentheses(label);
	}

	return parts.map((part, index) => (
		<React.Fragment key={index}>
			{formatParentheses(part)}
			{matches[index] && <Code className="inline!">{matches[index]}</Code>}
		</React.Fragment>
	));
};

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
	const imagePath = module.image
		? `${baseImagePath}${module.image}?v=${__APP_VERSION__}`
		: fallbackImage;

	return (
		<label
			key={module.id}
			className="mb-2 flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:text-(--accent-a12) sm:text-base"
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
			<span className="flex-1">{formatLabel(module.label)}</span>
		</label>
	);
};

export const ModuleCheckbox = React.memo(ModuleCheckboxComponent);
