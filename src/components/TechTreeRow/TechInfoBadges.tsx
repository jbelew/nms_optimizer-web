import React, { useEffect, useMemo, useRef } from "react";
import { Avatar, Badge, Checkbox, CheckboxGroup, Popover, Separator } from "@radix-ui/themes";

import { BonusStatusIcon } from "./BonusStatusIcon";
import { TechTreeRowProps } from "./TechTreeRow";

/**
 * @interface TechInfoBadgesProps
 * @property {boolean} hasTechInGrid - Whether the technology is in the grid.
 * @property {TechTreeRowProps["techColor"]} techColor - The color of the technology.
 * @property {number} moduleCount - The number of modules for the technology.
 * @property {number} currentCheckedModulesLength - The number of currently checked modules.
 * @property {number} techMaxBonus - The maximum potential bonus for the technology.
 * @property {number} techSolvedBonus - The bonus achieved from the current solved state for the technology.
 * @property {Array<object>} modules - The modules for the technology.
 * @property {string[]} currentCheckedModules - The currently checked modules.
 * @property {function} handleCheckboxChange - The function to handle checkbox changes.
 */
interface TechInfoBadgesProps {
	hasTechInGrid: boolean;
	techColor: TechTreeRowProps["techColor"];
	moduleCount: number;
	currentCheckedModulesLength: number;
	techMaxBonus: number;
	techSolvedBonus: number;
	modules: { label: string; id: string; image: string; type?: string }[];
	currentCheckedModules: string[];
	handleCheckboxChange: (moduleId: string) => void;
	handleAllCheckboxesChange: (moduleIds: string[]) => void;
}

/**
 * Renders badges for a tech tree row, including a bonus status icon and a module count.
 *
 * @param {TechInfoBadgesProps} props - The props for the component.
 * @returns {JSX.Element} The rendered tech info badges.
 */
export const TechInfoBadges: React.FC<TechInfoBadgesProps> = ({
	hasTechInGrid,
	techColor,
	currentCheckedModulesLength,
	techMaxBonus,
	techSolvedBonus,
	modules,
	currentCheckedModules,
	handleCheckboxChange,
	handleAllCheckboxesChange,
}) => {
	const baseImagePath = "/assets/img/grid/";
	const fallbackImage = `${baseImagePath}infra.webp`;

	const allModuleIds = modules.map((module) => module.id);
	const coreModuleIds = useMemo(() => {
		return modules.filter((module) => module.type === "core").map((module) => module.id);
	}, [modules]);

	const effectiveCheckedModules = useMemo(() => {
		const checked = new Set(currentCheckedModules);
		coreModuleIds.forEach((id) => checked.add(id));
		return Array.from(checked);
	}, [currentCheckedModules, coreModuleIds]);

	const allModulesSelected = effectiveCheckedModules.length === allModuleIds.length;
	const isIndeterminate = effectiveCheckedModules.length > 0 && !allModulesSelected;

	const selectAllCheckboxRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (selectAllCheckboxRef.current) {
			// Find the native input element within the Radix Checkbox component
			const inputElement =
				selectAllCheckboxRef.current.querySelector('input[type="checkbox"]');
			if (inputElement instanceof HTMLInputElement) {
				inputElement.indeterminate = isIndeterminate;
			}
		}
	}, [isIndeterminate]);

	const handleSelectAllChange = (checked: boolean) => {
		if (checked) {
			handleAllCheckboxesChange(Array.from(new Set([...allModuleIds, ...coreModuleIds])));
		} else {
			handleAllCheckboxesChange(coreModuleIds);
		}
	};

	const handleValueChange = (newValues: string[]) => {
		const oldValues = new Set(effectiveCheckedModules);
		const newValuesSet = new Set(newValues);

		let changedId: string | undefined;

		if (newValues.length > effectiveCheckedModules.length) {
			changedId = newValues.find((id) => !oldValues.has(id));
		} else {
			changedId = effectiveCheckedModules.find((id) => !newValuesSet.has(id));
		}

		if (changedId && !coreModuleIds.includes(changedId)) {
			handleCheckboxChange(changedId);
		}
	};

	// The `currentCheckedModules` prop is already available and used.

	return (
		<>
			{hasTechInGrid && (
				<BonusStatusIcon techMaxBonus={techMaxBonus} techSolvedBonus={techSolvedBonus} />
			)}
			<Popover.Root>
				<Popover.Trigger>
					<Badge
						mt="1"
						className="!ml-0 align-top !font-mono"
						size="2"
						radius="full"
						variant={hasTechInGrid ? "soft" : "surface"}
						color={hasTechInGrid ? "gray" : techColor}
						style={
							hasTechInGrid
								? {
										backgroundColor: "var(--gray-a2)",
										color: "var(--gray-a8)",
									}
								: { backgroundColor: "var(--accent-a3)" }
						}
					>
						x{currentCheckedModulesLength}
					</Badge>
				</Popover.Trigger>
				<Popover.Content>
					<CheckboxGroup.Root
						value={effectiveCheckedModules}
						onValueChange={handleValueChange}
					>
						<div className="selectLanguage__header mb-2 flex items-center">
							<Checkbox
								ref={selectAllCheckboxRef}
								checked={allModulesSelected}
								onCheckedChange={handleSelectAllChange}
							/>
							<span className="ml-3">Available Modules</span>
						</div>
						<Separator className="mb-3" size="4" />
						<div className="flex flex-col gap-2">
							{modules.map((module) => {
								const imagePath = module.image
									? `${baseImagePath}${module.image}`
									: fallbackImage;
								return (
									<div className="flex items-center gap-2">
										<CheckboxGroup.Item
											value={module.id}
											disabled={coreModuleIds.includes(module.id)}
										/>{" "}
										<Avatar
											size="1"
											radius="full"
											alt={module.label}
											fallback="IK"
											src={imagePath}
											color={techColor}
										/>
										{module.label}
									</div>
								);
							})}
						</div>
					</CheckboxGroup.Root>
				</Popover.Content>
			</Popover.Root>
		</>
	);
};
