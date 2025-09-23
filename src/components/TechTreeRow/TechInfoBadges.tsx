import React, { useEffect, useMemo, useRef } from "react";
import { Avatar, Button, Checkbox, CheckboxGroup, Dialog, Separator } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

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
	translatedTechName: string;
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
	translatedTechName,
}) => {
	const { t } = useTranslation();
	const baseImagePath = "/assets/img/grid/";
	const fallbackImage = `${baseImagePath}infra.webp`;

	const allModuleIds = modules.map((module) => module.id);
	const coreModuleIds = useMemo(() => {
		return modules.filter((module) => module.type === "core").map((module) => module.id);
	}, [modules]);

	const groupedModules = useMemo(() => {
		const groups: { [key: string]: typeof modules } = {
			core: [],
			bonus: [],
			upgrade: [],
			reactor: [],
			cosmetic: [],
		};

		modules.forEach((module) => {
			const type = module.type || "upgrade"; // Default to upgrade if type is not specified
			if (groups[type]) {
				groups[type].push(module);
			} else {
				groups.upgrade.push(module); // Or handle unknown types
			}
		});

		return groups;
	}, [modules]);

	const groupOrder = ["core", "bonus", "upgrade", "reactor", "cosmetic"];

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
		const oldValues = new Set(currentCheckedModules);
		const newValuesSet = new Set(newValues.filter((id) => !coreModuleIds.includes(id)));

		const added = [...newValuesSet].filter((id) => !oldValues.has(id));
		const removed = [...oldValues].filter((id) => !newValuesSet.has(id));

		if (added.length > 0) {
			// User checked a box. The disabling logic should prevent out-of-order checks.
			handleCheckboxChange(added[0]);
		} else if (removed.length > 0) {
			// User unchecked a box.
			const removedId = removed[0];
			const module = modules.find((m) => m.id === removedId);

			// Start with the new values from the checkbox group
			const finalNewValues = new Set(newValues.filter((id) => !coreModuleIds.includes(id)));

			if (module) {
				const groupName = module.type || "upgrade";
				if (
					groupName === "upgrade" ||
					groupName === "cosmetic" ||
					groupName === "reactor"
				) {
					const label = module.label;
					if (label.includes("Theta")) {
						const tauModule = groupedModules[groupName].find((m) =>
							m.label.includes("Tau")
						);
						const sigmaModule = groupedModules[groupName].find((m) =>
							m.label.includes("Sigma")
						);
						if (tauModule) finalNewValues.delete(tauModule.id);
						if (sigmaModule) finalNewValues.delete(sigmaModule.id);
					} else if (label.includes("Tau")) {
						const sigmaModule = groupedModules[groupName].find((m) =>
							m.label.includes("Sigma")
						);
						if (sigmaModule) finalNewValues.delete(sigmaModule.id);
					}
				}
			}
			handleAllCheckboxesChange(Array.from(finalNewValues));
		}
	};

	return (
		<>
			{hasTechInGrid && (
				<BonusStatusIcon techMaxBonus={techMaxBonus} techSolvedBonus={techSolvedBonus} />
			)}
			<Dialog.Root>
				<Dialog.Trigger>
					<Button
						mt="1"
						className="!ml-1 align-top !font-mono"
						size="1"
						radius="medium"
						variant={modules.length === 1 ? "surface" : "solid"}
						color={hasTechInGrid ? "gray" : techColor}
						disabled={modules.length === 1}
					>
						x{currentCheckedModulesLength}
					</Button>
				</Dialog.Trigger>
				<Dialog.Content maxWidth="384px">
					<Dialog.Title className="heading__styled text-xl sm:text-2xl">
						{translatedTechName} MODULES
					</Dialog.Title>
					<Dialog.Description>
						<Checkbox
							ref={selectAllCheckboxRef}
							checked={allModulesSelected}
							onCheckedChange={handleSelectAllChange}
						/>
						<span className="ml-3">Select All</span>
						<Separator className="mt-2 mb-4" size="4" />
					</Dialog.Description>
					<CheckboxGroup.Root
						value={effectiveCheckedModules}
						onValueChange={handleValueChange}
					>
						<div className="flex flex-col gap-2">
							{groupOrder.map(
								(groupName) =>
									groupedModules[groupName].length > 0 && (
										<div key={groupName}>
											<div
												className="mb-2 font-bold capitalize"
												style={{ color: "var(--accent-a11)" }}
											>
												{t(`moduleSelection.${groupName}`)}
											</div>
											{groupedModules[groupName].map((module) => {
												const imagePath = module.image
													? `${baseImagePath}${module.image}`
													: fallbackImage;

												const isCore = coreModuleIds.includes(module.id);
												let isDisabled = isCore;

												if (
													groupName === "upgrade" ||
													groupName === "cosmetic" ||
													groupName === "reactor"
												) {
													const label = module.label;
													const order = ["Theta", "Tau", "Sigma"];

													let rankIndex = -1;
													if (label.includes("Theta")) rankIndex = 0;
													else if (label.includes("Tau")) rankIndex = 1;
													else if (label.includes("Sigma")) rankIndex = 2;

													if (rankIndex > 0) {
														const prerequisiteRank =
															order[rankIndex - 1];
														const prerequisiteModule = groupedModules[
															groupName
														].find((m) =>
															m.label.includes(prerequisiteRank)
														);

														if (
															prerequisiteModule &&
															!currentCheckedModules.includes(
																prerequisiteModule.id
															)
														) {
															isDisabled = true;
														}
													}
												}

												return (
													<div className="mb-2 flex items-center gap-2 font-medium">
														<CheckboxGroup.Item
															value={module.id}
															disabled={isDisabled}
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
									)
							)}
						</div>
					</CheckboxGroup.Root>
				</Dialog.Content>
			</Dialog.Root>
		</>
	);
};
