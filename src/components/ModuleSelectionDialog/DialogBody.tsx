import type { TechTreeRowProps } from "../TechTreeRow/TechTreeRow";
import type { GroupedModules } from "./ModuleSelectionDialog";
import React from "react";
import { Avatar, Checkbox, CheckboxGroup, Separator, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { usePlatformStore } from "../../store/PlatformStore";
import { MODULE_GROUP_ORDER } from "./constants";
import { ModuleGroup } from "./ModuleGroup";

/** Base path for grid module images. */
const baseImagePath = "/assets/img/grid/";
/** Path to the fallback icon for modules. */
const fallbackImage = `${baseImagePath}infra.webp`;

/**
 * Props for the `DialogBody` component.
 */
export interface DialogBodyProps {
	/** Modules organized into categories for display. **Must be provided.** */
	groupedModules: GroupedModules;
	/** Array of IDs for currently selected modules. */
	currentCheckedModules: string[];
	/** Callback for selection changes within the checkbox group. */
	handleValueChange: (newValues: string[]) => void;
	/** Callback for the "Select All" toggle checkbox. */
	handleSelectAllChange: (checked: boolean | "indeterminate") => void;
	/** Whether all modules in the dialog are currently selected. */
	allModulesSelected: boolean;
	/** Theme color for the technology avatar. */
	techColor: TechTreeRowProps["techColor"];
	/** Ref to the "Select All" checkbox element. */
	selectAllCheckboxRef?: React.RefObject<HTMLButtonElement | null>;
	/** The unique identifier of the technology being configured. */
	tech?: string;
	/** Callback triggered when the dialog is dismissed. */
	onClose?: () => void;
}

/**
 * The primary content component for the module selection dialog.
 *
 * It manages the rendering of:
 * 1. Global selection controls (Select All).
 * 2. Specialized warnings for certain ship types (e.g., Corvettes).
 * 3. Categorized module lists (Core, Upgrades, etc.) with resolution-aware icons.
 * 4. Read-only display for "Core" technology modules.
 *
 * @param {DialogBodyProps} props - Component properties.
 * @returns {JSX.Element} The rendered dialog body content.
 *
 * @example Component usage
 * ```tsx
 * <DialogBody {...props} />
 * ```
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
	onClose,
}) => {
	const { t } = useTranslation();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const isCorvette = selectedShipType === "corvette";

	/**
	 * Proxies the checkbox change event to the parent handler.
	 *
	 * @param {boolean | "indeterminate"} checked - The new state.
	 * @example Interaction relay
	 * ```typescript
	 * onSelectAllChange(true);
	 * ```
	 */
	const onSelectAllChange = (checked: boolean | "indeterminate") => {
		handleSelectAllChange(checked);
	};

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
			{!isCorvette && tech !== "trails" && (
				<span
					className="mb-3 block text-sm sm:text-base"
					dangerouslySetInnerHTML={{ __html: t("moduleSelection.description") }}
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
				{groupedModules["core"]?.length > 0 && (
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
									className="mb-2 flex items-center gap-2 text-sm font-medium sm:text-base"
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
					{MODULE_GROUP_ORDER.filter((g) => g !== "core").map((groupName) => {
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
								onClose={onClose}
							/>
						);
					})}
				</CheckboxGroup.Root>
			</div>
		</>
	);
};
