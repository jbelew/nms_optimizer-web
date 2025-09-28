import React, { useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
	Checkbox,
	Separator,
	Text,
	CheckboxGroup,
	Avatar,
} from "@radix-ui/themes";
import { usePlatformStore } from "../../store/PlatformStore";
import { ModuleGroup } from "./ModuleGroup";
import type { ModuleSelectionDialogProps } from "./index";
import type { TechTreeRowProps } from "../TechTreeRow/TechTreeRow";

const groupOrder = ["core", "bonus", "upgrade", "atlantid", "reactor", "cosmetic"];
const baseImagePath = "/assets/img/grid/";
const fallbackImage = `${baseImagePath}infra.webp`;

/**
 * Props for the DialogBody component.
 */
export interface DialogBodyProps
	extends Pick<
		ModuleSelectionDialogProps,
		| "groupedModules"
		| "currentCheckedModules"
		| "handleValueChange"
		| "handleSelectAllChange"
		| "allModulesSelected"
		| "isIndeterminate"
		| "techColor"
	> {}

/**
 * Renders the main body of the module selection dialog.
 * This includes the global "Select All" checkbox, a warning for specific ship types,
 * and the groups of selectable modules.
 *
 * @param {DialogBodyProps} props - The props for the component.
 * @returns {JSX.Element} The rendered dialog body.
 */
export const DialogBody: React.FC<DialogBodyProps> = ({
	groupedModules,
	currentCheckedModules,
	handleValueChange,
	handleSelectAllChange,
	allModulesSelected,
	isIndeterminate,
	techColor,
}) => {
	const { t } = useTranslation();
	const selectAllCheckboxRef = useRef<HTMLButtonElement>(null);
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const isCorvette = selectedShipType === "corvette";

	useEffect(() => {
		if (selectAllCheckboxRef.current) {
			const inputElement =
				selectAllCheckboxRef.current.querySelector('input[type="checkbox"]');
			if (inputElement instanceof HTMLInputElement) {
				inputElement.indeterminate = isIndeterminate;
			}
		}
	}, [isIndeterminate]);

	const onSelectAllChange = useCallback(
		(checked: boolean | "indeterminate") => {
			if (isCorvette && !checked) {
				handleValueChange([]);
			} else {
				handleSelectAllChange(checked);
			}
		},
		[isCorvette, handleValueChange, handleSelectAllChange]
	);

	return (
		<>
			{isCorvette && (
				<span
					className="mb-3 block text-sm sm:text-base"
					dangerouslySetInnerHTML={{ __html: t("moduleSelection.warning") }}
				/>
			)}
			<label className="flex cursor-pointer items-center text-sm font-medium transition-colors duration-200 hover:text-[var(--accent-a12)] sm:text-base">
				<Checkbox
					ref={selectAllCheckboxRef}
					checked={allModulesSelected}
					onCheckedChange={onSelectAllChange}
				/>
				<Text ml="2" className="text-sm font-medium sm:text-base">
					{t("moduleSelection.selectAll")}
				</Text>
			</label>
			<Separator size="4" className="mt-2" mb="3" />
			<div className="flex flex-col gap-2">
				{!isCorvette && groupedModules["core"]?.length > 0 && (
					<div key="core">
						<div
							className="mb-2 font-bold capitalize"
							style={{ color: "var(--accent-a11)" }}
						>
							{t(`moduleSelection.core`)}
						</div>
						{groupedModules["core"].map((module) => {
							const imagePath = module.image
								? `${baseImagePath}${module.image}`
								: fallbackImage;
							return (
								<div
									key={module.id}
									className="mb-2 flex items-center gap-2 font-medium"
								>
									<Checkbox checked={true} disabled={true} />
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
				)}
				<CheckboxGroup.Root
					value={currentCheckedModules}
					onValueChange={handleValueChange}
				>
					{(isCorvette ? groupOrder : groupOrder.filter((g) => g !== "core")).map(
						(groupName) =>
							groupedModules[groupName]?.length > 0 && (
								<ModuleGroup
									key={groupName}
									groupName={groupName}
									modules={groupedModules[groupName]}
									currentCheckedModules={currentCheckedModules}
									techColor={techColor}
								/>
							)
					)}
				</CheckboxGroup.Root>
			</div>
		</>
	);
};