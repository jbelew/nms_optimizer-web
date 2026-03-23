import type { ModuleSelectionDialogProps, SelectionModule } from "./ModuleSelectionDialog";
import React from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Blockquote } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useDialog } from "../../context/dialog-utils";
import { MODULE_RANK_ORDER } from "./constants";
import { ModuleCheckbox } from "./ModuleCheckbox";

/**
 * Props for the `ModuleGroup` component.
 */
export interface ModuleGroupProps extends Pick<
	ModuleSelectionDialogProps,
	"currentCheckedModules" | "techColor"
> {
	/** The internal name of the group (e.g., 'upgrade', 'bonus'). **Must be a valid category key.** */
	groupName: string;
	/** Array of modules belonging to this group. */
	modules: SelectionModule[];
	/** Optional title to display instead of the localized group name. */
	titleOverride?: string;
	/** Callback function to close the parent dialog. */
	onClose?: () => void;
}

/**
 * A component that renders a titled group of selectable modules.
 *
 * It handles the categorization logic, including:
 * 1. Sorting modules alphabetically for specific groups (bonus, figurines).
 * 2. Enforcing prerequisite dependencies (e.g., Sigma must be selected before Tau).
 * 3. Displaying contextual help info icons for specific module patterns.
 * 4. Rendering specialized informational blocks for "Cosmetic" groups.
 *
 * @param {ModuleGroupProps} props - Component properties.
 * @returns {JSX.Element | null} The rendered group UI, or `null` if no modules are present.
 *
 * @example
 * <ModuleGroup groupName="upgrade" modules={upgradeModules} currentCheckedModules={['M1']} techColor="blue" />
 */
export const ModuleGroup: React.FC<ModuleGroupProps> = ({
	groupName,
	modules,
	currentCheckedModules,
	techColor,
	titleOverride,
	onClose,
}) => {
	const { t } = useTranslation();
	const { openDialog } = useDialog();

	const sortedModules = ["bonus", "trails", "figurines"].includes(groupName)
		? [...modules].sort((a, b) => a.label.localeCompare(b.label))
		: modules;

	const dependencyMap = new Map<string, string>();

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
			const rankIndex = MODULE_RANK_ORDER.findIndex((rank) => module.label.includes(rank));

			if (rankIndex > 0) {
				const prerequisiteRank = MODULE_RANK_ORDER[rankIndex - 1];
				const prerequisiteModuleId = rankToModuleMap.get(prerequisiteRank);

				if (prerequisiteModuleId) {
					dependencyMap.set(module.id, prerequisiteModuleId);
				}
			}
		});
	}

	if (!modules || modules.length === 0) {
		return null;
	}

	return (
		<div>
			<div
				className={`flex items-center gap-2 font-bold capitalize ${
					groupName !== "cosmetic" ? "mb-2" : "mb-0"
				}`}
				style={{ color: "var(--accent-a11)" }}
			>
				{titleOverride || t(`moduleSelection.${groupName}`)}
				{modules.some((m) => m.label.includes("[") && m.label.includes("]")) && (
					<InfoCircledIcon
						className="shrink-0 cursor-pointer opacity-70 transition-opacity hover:opacity-100"
						onClick={() => {
							onClose?.();
							openDialog("instructions", { section: "section-5" });
						}}
					/>
				)}
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
