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

import React, { lazy, memo, Suspense } from "react";
import { CheckCircledIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import {
	Avatar,
	Badge,
	Blockquote,
	Button,
	Checkbox,
	CheckboxGroup,
	Code,
	Separator,
	Text,
} from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { usePlatformStore } from "@/store/app/platformStore";
import { useDialog } from "@/utils/system/dialogUtils";

import { MODULE_GROUP_ORDER, MODULE_RANK_ORDER } from "./constants";
import { useModuleSelectionDialog } from "./useModuleSelectionDialog";

import "./ModuleSelectionDialog.scss";

import type {
	GroupedModules,
	ModuleDialogBodyProps,
	ModuleDialogFooterProps,
	ModuleSelectionDialogProps,
	SelectionModule,
} from "@/types/props";

import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";

export type { GroupedModules, ModuleSelectionDialogProps, SelectionModule };

const AppDialog = lazy(() => import("@/components/AppDialog/Base/AppDialog"));

/** Path to the fallback technology icon. */
const fallbackImage = "/assets/img/grid/infra.webp";
/** Base path for grid module images. */
const baseImagePath = "/assets/img/grid/";

/**
 * Parses and styles parenthetical text fragments within a string.
 *
 * @remarks
 * Fragments matching `(text)` are wrapped in a `Badge` component for visual distinction.
 *
 * @param {string} text - The input string to parse.
 *
 * @returns {React.ReactNode} The parsed content with React components.
 *
 * @example
 * ```tsx
 * formatParentheses("Item (New)");
 * // returns [ "Item ", <Badge>New</Badge> ]
 * ```
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
				<Badge className="hidden! font-mono! sm:inline!" ml="1">
					{matches[index].slice(1, -1)}
				</Badge>
			)}
		</React.Fragment>
	));
};

/**
 * Parses and styles bracketed text fragments within a technology label.
 *
 * @remarks
 * Fragments matching `[text]` are wrapped in a `Code` component. It also calls
 * `formatParentheses` for nested formatting.
 *
 * @param {string} label - The label string to parse.
 *
 * @returns {React.ReactNode} The formatted React tree.
 *
 * @example
 * ```tsx
 * formatLabel("Tech [v1]");
 * // returns [ "Tech ", <Code>v1</Code> ]
 * ```
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
 * Individual module selection checkbox with icon and label.
 *
 * @remarks
 * Renders a checkbox item with a associated technology icon and a formatted label.
 *
 * @param {ModuleCheckboxProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered checkbox item.
 *
 * @category Components
 */
interface ModuleCheckboxProps {
	/** Whether the module is disabled due to missing prerequisites. */
	isDisabled: boolean;
	/** Metadata for the technology module. */
	module: SelectionModule;
	/** Color theme derived from the technology category. */
	techColor: ModuleSelectionDialogProps["techColor"];
}

const ModuleCheckbox: React.FC<ModuleCheckboxProps> = ({ isDisabled, module, techColor }) => {
	const imagePath = module.image
		? `${baseImagePath}${module.image}?v=${typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "1.0"}`
		: fallbackImage;

	return (
		<label
			className="mb-2 flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:text-(--accent-a12) sm:text-base"
			key={module.id}
			style={{ cursor: "pointer" }}
		>
			<CheckboxGroup.Item disabled={isDisabled} value={module.id} />
			<Avatar
				alt={module.label}
				color={techColor}
				fallback={module.id}
				radius="full"
				size="1"
				src={imagePath}
			/>
			<span className="flex-1">{formatLabel(module.label ?? module.id)}</span>
		</label>
	);
};

/**
 * Categorized group of module checkboxes.
 *
 * @remarks
 * Handles sorting of modules within a group (e.g., alphabetically for figurines)
 * and enforces prerequisite dependencies (e.g., higher-tier upgrades).
 *
 * @param {ModuleGroupProps} props - Component properties.
 *
 * @returns {JSX.Element | null} The rendered module group or null if empty.
 *
 * @category Components
 */
interface ModuleGroupProps {
	/** List of currently selected module IDs. */
	currentCheckedModules: string[];
	/** Semantic name of the group (e.g., 'upgrade', 'bonus'). */
	groupName: string;
	/** List of modules belonging to this group. */
	modules: SelectionModule[];
	/** Optional closure handler for the parent dialog. */
	onClose?: () => void;
	/** Color theme for the group icons. */
	techColor: ModuleSelectionDialogProps["techColor"];
	/** Optional title to display instead of the i18n lookup. */
	titleOverride?: string;
}

const ModuleGroup: React.FC<ModuleGroupProps> = ({
	currentCheckedModules,
	groupName,
	modules,
	onClose,
	techColor,
	titleOverride,
}) => {
	const { t } = useTranslation();
	const { openDialog } = useDialog();

	const sortedModules = ["bonus", "figurines", "trails"].includes(groupName)
		? [...modules].sort((a, b) => (a.label ?? "").localeCompare(b.label ?? ""))
		: modules;

	const dependencyMap = new Map<string, string>();

	if (["atlantid", "cosmetic", "reactor", "upgrade"].includes(groupName)) {
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
					<ConditionalTooltip label={t("moduleSelection.aboutUpgradeLabelsTooltip")}>
						<InfoCircledIcon
							className="shrink-0 cursor-pointer opacity-70 transition-opacity hover:opacity-100"
							onClick={() => {
								onClose?.();
								openDialog("instructions", { section: "section-5" });
							}}
						/>
					</ConditionalTooltip>
				)}
			</div>

			{groupName === "cosmetic" && (
				<Blockquote
					className="text-sm sm:text-base"
					dangerouslySetInnerHTML={{
						__html: t("moduleSelection.cosmeticInfo"),
					}}
					mb="3"
					mt="1"
				/>
			)}
			{sortedModules.map((module) => {
				const prerequisiteId = dependencyMap.get(module.id);
				const isDisabled = prerequisiteId
					? !currentCheckedModules.includes(prerequisiteId)
					: false;

				return (
					<ModuleCheckbox
						isDisabled={isDisabled}
						key={module.id}
						module={module}
						techColor={techColor}
					/>
				);
			})}
		</div>
	);
};

/**
 * The primary content component for the module selection dialog.
 *
 * @remarks
 * Renders warnings, the "Select All" toggle, and groups of module checkboxes.
 *
 * @param {Object} props - Component properties.
 *
 * @returns {JSX.Element} The rendered dialog body.
 *
 * @category Components
 */
const DialogBody: React.FC<
	ModuleDialogBodyProps & {
		/** Whether all modules in the current view are checked. */
		allModulesSelected: boolean;
		/** Handler for the "Select All" checkbox state change. */
		handleSelectAllChange: (checked: "indeterminate" | boolean) => void;
		/** Handler for individual checkbox value changes. */
		handleValueChange: (v: string[]) => void;
		/** Callback to close the parent dialog. */
		onClose: () => void;
		/** The identifier for the technology being configured. */
		tech?: string;
		/** Color theme for icons and badges. */
		techColor: ModuleSelectionDialogProps["techColor"];
	}
> = ({
	allModulesSelected,
	groupedModules,
	handleSelectAllChange,
	handleValueChange,
	onClose,
	selectedModules,
	tech,
	techColor,
}) => {
	const { t } = useTranslation();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const isCorvette = selectedShipType === "corvette";

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
					aria-label="selectAll"
					checked={allModulesSelected}
					onCheckedChange={handleSelectAllChange}
				/>
				<Text className="text-sm font-medium sm:text-base" ml="2">
					{t("moduleSelection.selectAll")}
				</Text>
			</label>
			<Separator className="mt-2" mb="3" size="4" />
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
									className="mb-2 flex items-center gap-2 text-sm font-medium sm:text-base"
									key={module.id}
								>
									<Checkbox checked={true} disabled={true} />
									<Avatar
										alt={module.label}
										color={techColor}
										fallback="IK"
										radius="full"
										size="1"
										src={imagePath}
									/>
									{module.label}
								</label>
							);
						})}
					</div>
				)}
				<CheckboxGroup.Root onValueChange={handleValueChange} value={selectedModules}>
					{MODULE_GROUP_ORDER.filter((g) => g !== "core").map((groupName) => {
						if (!groupedModules[groupName]?.length) return null;

						let titleOverride: string | undefined;

						if (groupName === "bonus" && tech === "trails") {
							titleOverride = t("moduleSelection.trails");
						}

						return (
							<ModuleGroup
								currentCheckedModules={selectedModules}
								groupName={groupName}
								key={groupName}
								modules={groupedModules[groupName]}
								onClose={onClose}
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

/**
 * The action bar component for the module selection dialog.
 *
 * @remarks
 * Provides "Cancel" and "Optimize" buttons. The "Optimize" button is disabled
 * if no modules are selected.
 *
 * @param {Object} props - Component properties.
 *
 * @returns {JSX.Element} The rendered footer.
 *
 * @category Components
 */
const DialogFooter: React.FC<ModuleDialogFooterProps & { onClose: () => void }> = ({
	currentCheckedModules,
	handleOptimizeClick,
	onClose,
}) => {
	const { t } = useTranslation();
	const isOptimizeDisabled = currentCheckedModules.length === 0;

	return (
		<div className="mb-1 flex justify-end gap-2">
			<Button onClick={onClose} variant="soft">
				{t("moduleSelection.cancelButton")}
			</Button>
			<Button
				aria-label="optimizeButton"
				disabled={isOptimizeDisabled}
				onClick={handleOptimizeClick}
			>
				{t("moduleSelection.optimizeButton")}
			</Button>
		</div>
	);
};

/**
 * Interactive dialog for selecting specific technology modules for optimization.
 *
 * @remarks
 * This component allows users to pick exactly which upgrades and core components
 * are considered by the solver. It provides:
 * - Localized technology names.
 * - Tier-based prerequisite enforcement.
 * - Categorical grouping (Core, Upgrade, Bonus, etc.).
 * - "Select All" functionality.
 *
 * @param {ModuleSelectionDialogProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered selection dialog.
 *
 * @see {@link useModuleSelectionDialog} for the underlying state management.
 * @see {@link AppDialog} for the base modal component.
 * @see {@link ./ModuleSelectionDialog.test.tsx Unit Tests}
 * @see {@link ./ModuleSelectionDialog.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ModuleSelectionDialog
 *   isOpen={true}
 *   tech="pulse"
 *   translatedTechName="Pulse Engine"
 *   techColor="blue"
 *   onClose={() => {}}
 * />
 * ```
 */
export const ModuleSelectionDialog: React.FC<ModuleSelectionDialogProps> = memo((props) => {
	const { bodyProps, footerProps } = useModuleSelectionDialog(props);
	const { t } = useTranslation();

	const {
		allModulesSelected,
		handleSelectAllChange,
		handleValueChange,
		isOpen,
		onClose,
		tech,
		techColor,
		translatedTechName,
	} = props;

	return (
		<Suspense fallback={null}>
			<AppDialog
				content={
					<DialogBody
						{...bodyProps}
						allModulesSelected={allModulesSelected}
						handleSelectAllChange={handleSelectAllChange}
						handleValueChange={handleValueChange}
						onClose={onClose}
						tech={tech}
						techColor={techColor}
					/>
				}
				footer={<DialogFooter {...footerProps} onClose={onClose} />}
				headerIcon={
					<CheckCircledIcon className="h-6 w-6" style={{ color: "var(--accent-11)" }} />
				}
				isOpen={isOpen}
				onClose={onClose}
				title={t("moduleSelection.title", { techName: translatedTechName })}
			/>
		</Suspense>
	);
});
