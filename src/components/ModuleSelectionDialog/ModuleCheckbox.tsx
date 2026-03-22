import type { TechTreeRowProps } from "../TechTreeRow/TechTreeRow";
import type { SelectionModule } from "./ModuleSelectionDialog";
import React from "react";
import { Avatar, Badge, CheckboxGroup, Code } from "@radix-ui/themes";

/** Base path for grid module icons. */
const baseImagePath = "/assets/img/grid/";
/** Path to the default fallback icon. */
const fallbackImage = `${baseImagePath}infra.webp`;

/**
 * Parses and styles parenthetical text fragments within a string.
 *
 * It wraps text like `(Sigma)` or `(Tau)` into Radix UI `Badge` components
 * for a more structured, NMS-like UI appearance.
 *
 * @param {string} text - The input label string.
 * @returns {React.ReactNode} The formatted React element tree.
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
 * Parses and styles bracketed text fragments within a technology label.
 *
 * Specifically targets technical metadata like `[P1]` or `[S]`, wrapping
 * them in `Code` tags.
 *
 * @param {string} label - The raw technology or module label.
 * @returns {React.ReactNode} The formatted React element tree.
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
			{matches[index] && <Code className="inline! font-normal!">{matches[index]}</Code>}
		</React.Fragment>
	));
};

/**
 * Props for the `ModuleCheckbox` component.
 */
export interface ModuleCheckboxProps {
	/** The module object containing label, ID, and image data. **Must be valid.** */
	module: SelectionModule;
	/** The theme color applied to the module's avatar background. */
	techColor: TechTreeRowProps["techColor"];
	/** Whether the checkbox is in a read-only or blocked state. */
	isDisabled: boolean;
}

/**
 * A component that renders a single selectable module row.
 *
 * It includes a functional checkbox for selection, a circular avatar/icon 
 * representing the `module`, and a formatted text `label` with stylized technical metadata.
 *
 * @param {ModuleCheckboxProps} props - The component properties.
 * @returns {JSX.Element} The rendered checkbox row layout.
 * @see {@link formatLabel}
 *
 * @example
 * <ModuleCheckbox module={m} techColor="blue" isDisabled={false} />
 */
export const ModuleCheckbox: React.FC<ModuleCheckboxProps> = ({
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
