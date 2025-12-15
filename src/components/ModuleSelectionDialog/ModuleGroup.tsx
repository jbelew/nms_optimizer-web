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
			// P2 Optimization: Build rank-to-module lookup once to avoid O(n²) dependency resolution
			// Previously called modules.find() for each module during forEach loop
			const rankToModuleMap = new Map<string, string>();
			modules.forEach((module) => {
				MODULE_RANK_ORDER.forEach((rank) => {
					if (module.label.includes(rank)) {
						rankToModuleMap.set(rank, module.id);
					}
				});
			});

			modules.forEach((module) => {
				const rankIndex = MODULE_RANK_ORDER.findIndex((rank) =>
					module.label.includes(rank)
				);

				if (rankIndex > 0) {
					const prerequisiteRank = MODULE_RANK_ORDER[rankIndex - 1];
					const prerequisiteModuleId = rankToModuleMap.get(prerequisiteRank);

					if (prerequisiteModuleId) {
						map.set(module.id, prerequisiteModuleId);
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
