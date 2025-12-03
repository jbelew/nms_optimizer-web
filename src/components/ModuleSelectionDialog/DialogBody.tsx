import type { TechTreeRowProps } from "../TechTreeRow/TechTreeRow";
import type { GroupedModules } from "./index";
import React, { useCallback } from "react";
import { Avatar, Checkbox, CheckboxGroup, Separator, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { usePlatformStore } from "../../store/PlatformStore";
import { MODULE_GROUP_ORDER } from "./constants";
import { ModuleGroup } from "./ModuleGroup";

const baseImagePath = "/assets/img/grid/";
const fallbackImage = `${baseImagePath}infra.webp`;

/**
 * Props for the DialogBody component.
 */
export interface DialogBodyProps {
	groupedModules: GroupedModules;
	currentCheckedModules: string[];
	handleValueChange: (newValues: string[]) => void;
	handleSelectAllChange: (checked: boolean | "indeterminate") => void;
	allModulesSelected: boolean;
	techColor: TechTreeRowProps["techColor"];
	selectAllCheckboxRef?: React.RefObject<HTMLButtonElement | null>;
	tech?: string;
}

/**
 * Renders the main body of the module selection dialog.
 * This includes the global "Select All" checkbox, a warning for specific ship types,
 * and the groups of selectable modules.
 *
 * @param props - The props for the component.
 * @returns {JSX.Element} The rendered dialog body.
 */
export const DialogBody: React.FC<DialogBodyProps> = ({
	groupedModules,
	currentCheckedModules,
	handleValueChange,
	handleSelectAllChange,
	allModulesSelected,
	techColor,
	selectAllCheckboxRef,
	tech,
}) => {
	const { t } = useTranslation();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const isCorvette = selectedShipType === "corvette";

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
			{isCorvette && tech !== "trails" && (
				<span
					className="mb-3 block text-sm sm:text-base"
					dangerouslySetInnerHTML={{ __html: t("moduleSelection.warning") }}
				/>
			)}
			{tech === "trails" && (
				<span
					className="mb-3 block text-sm sm:text-base"
					dangerouslySetInnerHTML={{ __html: t("moduleSelection.trailsInfo") }}
				/>
			)}
			<label className="flex cursor-pointer items-center text-sm font-medium transition-colors duration-200 hover:text-(--accent-a12) sm:text-base">
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
								<label
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
								</label>
							);
						})}
					</div>
				)}
				<CheckboxGroup.Root value={currentCheckedModules} onValueChange={handleValueChange}>
					{(isCorvette
						? MODULE_GROUP_ORDER
						: MODULE_GROUP_ORDER.filter((g) => g !== "core")
					).map((groupName) => {
						if (!groupedModules[groupName]?.length) return null;

						let titleOverride: string | undefined;

						if (groupName === "bonus" && tech === "trails") {
							titleOverride = t("moduleSelection.trails");
						}

						return (
							<ModuleGroup
								key={groupName}
								groupName={groupName}
								modules={groupedModules[groupName]}
								currentCheckedModules={currentCheckedModules}
								techColor={techColor}
								titleOverride={titleOverride}
							/>
						);
					})}
				</CheckboxGroup.Root>
			</div>
		</>
	);
};
