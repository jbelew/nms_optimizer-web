import type { Module, ModuleSelectionDialogProps } from "./index";
import React, { useMemo } from "react";
import { Blockquote } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { MODULE_RANK_ORDER } from "./constants";
import { ModuleCheckbox } from "./ModuleCheckbox";

/**
 * Props for the ModuleGroup component.
 */
export interface ModuleGroupProps extends Pick<
	ModuleSelectionDialogProps,
	"currentCheckedModules" | "techColor"
> {
	groupName: string;
	modules: Module[];
	titleOverride?: string;
}

/**
 * Renders a group of modules within the dialog.
 * It handles the display of a group title, optional info blocks, and the list of modules.
 * It also contains the logic for sorting modules and disabling them based on dependencies.
 *
 * @param {ModuleGroupProps} props - The props for the component.
 * @returns {JSX.Element | null} The rendered module group, or null if there are no modules.
 */
const ModuleGroupComponent: React.FC<ModuleGroupProps> = ({
	groupName,
	modules,
	currentCheckedModules,
	techColor,
	titleOverride,
}) => {
	const { t } = useTranslation();

	const sortedModules = useMemo(() => {
		if (["bonus", "trails", "figurines"].includes(groupName)) {
			return [...modules].sort((a, b) => a.label.localeCompare(b.label));
		}
		return modules;
	}, [modules, groupName]);

	const dependencyMap = useMemo(() => {
		const map = new Map<string, string>();
		if (["upgrade", "cosmetic", "reactor", "atlantid"].includes(groupName)) {
			modules.forEach((module) => {
				const rankIndex = MODULE_RANK_ORDER.findIndex((rank) =>
					module.label.includes(rank)
				);
				if (rankIndex > 0) {
					const prerequisiteRank = MODULE_RANK_ORDER[rankIndex - 1];
					const prerequisiteModule = modules.find((m) =>
						m.label.includes(prerequisiteRank)
					);
					if (prerequisiteModule) {
						map.set(module.id, prerequisiteModule.id);
					}
				}
			});
		}
		return map;
	}, [modules, groupName]);

	if (!modules || modules.length === 0) {
		return null;
	}

	return (
		<div>
			<div
				className={`font-bold capitalize ${groupName !== "cosmetic" ? "mb-2" : "mb-0"}`}
				style={{ color: "var(--accent-a11)" }}
			>
				{titleOverride || t(`moduleSelection.${groupName}`)}
			</div>
			{groupName === "cosmetic" && (
				<Blockquote
					className="text-sm sm:text-base"
					mb="3"
					mt="1"
					dangerouslySetInnerHTML={{
						__html: t("moduleSelection.cosmeticInfo"),
					}}
				/>
			)}
			{sortedModules.map((module) => {
				const prerequisiteId = dependencyMap.get(module.id);
				const isDisabled = prerequisiteId
					? !currentCheckedModules.includes(prerequisiteId)
					: false;

				return (
					<ModuleCheckbox
						key={module.id}
						module={module}
						techColor={techColor}
						isDisabled={isDisabled}
					/>
				);
			})}
		</div>
	);
};

export const ModuleGroup = React.memo(ModuleGroupComponent);
