/**
 * Interactive technology module configuration dialog module.
 *
 * @remarks
 * This module provides the `ModuleSelectionDialog`, which allows users to
 * precisely control which technology upgrades are included in optimization
 * calculations. It supports categorical filtering and mass-selection.
 *
 * @see {@link ModuleSelectionDialog}
 * @see {@link ./ModuleSelectionDialog.test.tsx Unit Tests}
 * @see {@link ./ModuleSelectionDialog.stories.tsx Storybook}
 *
 * @category Components
 */

import type { TechTreeRowProps } from "../TechTreeRow/TechTreeRow";
import React from "react";
import { Cross2Icon, InfoCircledIcon } from "@radix-ui/react-icons";
import {
	Avatar,
	Badge,
	Blockquote,
	Button,
	Checkbox,
	CheckboxGroup,
	Code,
	Dialog,
	IconButton,
	Separator,
	Text,
} from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { usePlatformStore } from "../../store/app/platformStore";
import { useDialog } from "../../utils/system/dialogUtils";
import { MODULE_GROUP_ORDER, MODULE_RANK_ORDER } from "./constants";
import { useModuleSelectionDialog } from "./useModuleSelectionDialog";

import "./ModuleSelectionDialog.scss";

/** Path to the fallback technology icon. */
const fallbackImage = "/assets/img/grid/infra.webp";
/** Base path for grid module images. */
const baseImagePath = "/assets/img/grid/";

/**
 * Represents a simplified technology module definition used within the selection UI.
 */
export interface SelectionModule {
	/** Display name of the module. */
	label: string;
	/** Unique identifier for the module. */
	id: string;
	/** Icon filename. */
	image: string;
	/** Optional classification (e.g., 'upgrade'). */
	type?: string;
	/** Initial checked status. */
	checked?: boolean;
}

/**
 * A dictionary of module lists, keyed by their grouping category (e.g., 'Procedural Upgrades').
 */
export interface GroupedModules {
	[key: string]: SelectionModule[];
}

/**
 * Props for the `ModuleSelectionDialog` component.
 */
export interface ModuleSelectionDialogProps {
	/** Localized name of the technology being configured. */
	translatedTechName: string;
	/** Modules organized into categories for display. **Must be provided.** */
	groupedModules: GroupedModules;
	/** Array of IDs for currently selected modules. */
	currentCheckedModules: string[];
	/** Callback for individual module selection changes. */
	handleValueChange: (newValues: string[]) => void;
	/** Callback for the "Select All" toggle. */
	handleSelectAllChange: (checked: boolean | "indeterminate") => void;
	/** Asynchronous callback to trigger an optimization using the current selection. */
	handleOptimizeClick: () => Promise<void>;
	/** Whether all modules in the dialog are selected. */
	allModulesSelected: boolean;
	/** Whether the "Select All" checkbox is in an indeterminate state. */
	isIndeterminate: boolean;
	/** Theme color for the technology icon/avatar. */
	techColor: TechTreeRowProps["techColor"];
	/** Icon filename for the main technology. */
	techImage: string | null;
	/** The unique technology key. */
	tech?: string;
	/** Optional callback triggered when the dialog closes. */
	onClose?: () => void;
}

/**
 * Props for the `DialogHeader` component.
 */
export interface DialogHeaderProps {
	/** Localized name of the technology. **Must be provided.** */
	translatedTechName: string;
	/** Icon filename for the technology. `null` to use fallback. */
	techImage: string | null;
	/** Theme color for the technology avatar. */
	techColor: TechTreeRowProps["techColor"];
}

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
 * Props for the `DialogFooter` component.
 */
export interface DialogFooterProps {
	/** Asynchronous callback to trigger the optimization solver. **Must be provided.** */
	handleOptimizeClick: () => Promise<void>;
	/** Array of currently selected module IDs. Used to determine if the optimize button should be disabled. */
	currentCheckedModules: string[];
}

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
 * A header component for the module selection dialog.
 *
 * It displays the technology's avatar and localized title. It also provides
 * the primary close button for the dialog. It handles resolution-aware image
 * path generation for the technology icon.
 *
 * @param {DialogHeaderProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered dialog header.
 *
 * @example
 */
export const DialogHeader: React.FC<DialogHeaderProps> = ({
	translatedTechName,
	techImage,
	techColor,
}) => {
	const { t } = useTranslation();

	const techImagePath = techImage ? `/assets/img/tech/${techImage}` : fallbackImage;
	const techImagePath2x = techImage
		? `/assets/img/tech/${techImage.replace(/\.(webp|png|jpg|jpeg)$/, "@2x.$1")}`
		: fallbackImage.replace(/\.(webp|png|jpg|jpeg)$/, "@2x.$1");

	return (
		<>
			<Dialog.Title className="heading-styled flex items-start text-xl sm:text-2xl">
				<Avatar
					size="2"
					radius="full"
					alt={translatedTechName}
					fallback="IK"
					src={techImagePath}
					color={techColor}
					srcSet={`${techImagePath} 1x, ${techImagePath2x} 2x`}
				/>
				<span className="mt-0.5 mr-6 ml-2 text-xl sm:mt-0 sm:text-2xl">
					{t("moduleSelection.title", { techName: translatedTechName })}
				</span>
			</Dialog.Title>

			<Dialog.Close>
				<IconButton
					variant="ghost"
					size="1"
					className="dialog-close"
					aria-label={t("moduleSelection.closeDialogLabel")}
				>
					<Cross2Icon />
				</IconButton>
			</Dialog.Close>
		</>
	);
};

/**
 * Parses and styles parenthetical text fragments within a string.
 * @example
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
 * @example
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
 * A component that renders a single selectable module row.
 * @example
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
			<span className="flex-1">{formatLabel(module.label ?? module.id)}</span>
		</label>
	);
};

/**
 * A component that renders a titled group of selectable modules.
 * @example
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
		? [...modules].sort((a, b) => (a.label ?? "").localeCompare(b.label ?? ""))
		: modules;

	const dependencyMap = new Map<string, string>();

	if (["upgrade", "cosmetic", "reactor", "atlantid"].includes(groupName)) {
		const rankToModuleMap = new Map<string, string>();
		modules.forEach((module) => {
			if (!module.label) return;
			MODULE_RANK_ORDER.forEach((rank) => {
				if (module.label.includes(rank)) {
					rankToModuleMap.set(rank, module.id);
				}
			});
		});

		modules.forEach((module) => {
			if (!module.label) return;
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
				{modules.some((m) => m.label?.includes("[") && m.label?.includes("]")) && (
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

/**
 * The primary content component for the module selection dialog.
 * @example
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

/**
 * The action bar component for the module selection dialog.
 * @example
 */
export const DialogFooter: React.FC<DialogFooterProps> = ({
	handleOptimizeClick,
	currentCheckedModules,
}) => {
	const { t } = useTranslation();
	const isOptimizeDisabled = currentCheckedModules.length === 0;

	return (
		<div className="mt-4 mb-1 flex justify-end gap-2">
			<Dialog.Close>
				<Button variant="soft">{t("moduleSelection.cancelButton")}</Button>
			</Dialog.Close>
			<Button onClick={handleOptimizeClick} disabled={isOptimizeDisabled}>
				{t("moduleSelection.optimizeButton")}
			</Button>
		</div>
	);
};

/**
 * A dialog component that allows users to pick which specific modules to include in an optimization run.
 *
 * @remarks
 * It features categorical groupings, individual module checkboxes, resolution-aware
 * icons, and a "Select All" convenience toggle. It uses `useModuleSelectionDialog`
 * to manage the complex state of multi-select and property mapping.
 *
 * @param {ModuleSelectionDialogProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered module selection UI.
 *
 * @see {@link useModuleSelectionDialog}
 * @see {@link DialogBody}
 * @see {@link DialogHeader}
 * @see {@link DialogFooter}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ModuleSelectionDialog {...props} />
 * // renders technology configuration dialog
 * ```
 */
export const ModuleSelectionDialog: React.FC<ModuleSelectionDialogProps> = (props) => {
	const { headerProps, bodyProps, footerProps } = useModuleSelectionDialog(props);
	const { t } = useTranslation();

	return (
		<Dialog.Content size={{ initial: "1", sm: "2" }}>
			<DialogHeader {...headerProps} />

			<Dialog.Description className="sr-only">
				{t(
					"moduleSelection.description",
					"Select modules to include in the optimization calculation."
				)}
			</Dialog.Description>

			<DialogBody {...bodyProps} />

			<DialogFooter {...footerProps} />
		</Dialog.Content>
	);
};
