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

import { usePlatformStore } from "../../store/app/platformStore";
import { useDialog } from "../../utils/system/dialogUtils";
import { MODULE_GROUP_ORDER, MODULE_RANK_ORDER } from "./constants";
import { useModuleSelectionDialog } from "./useModuleSelectionDialog";

import "./ModuleSelectionDialog.scss";

import type {
	GroupedModules,
	ModuleDialogBodyProps,
	ModuleDialogFooterProps,
	ModuleSelectionDialogProps,
	SelectionModule,
} from "../../types/props";

import { ConditionalTooltip } from "../ConditionalTooltip/ConditionalTooltip";

export type { GroupedModules, ModuleSelectionDialogProps, SelectionModule };

const AppDialog = lazy(() => import("../AppDialog/Base/AppDialog"));

/** Path to the fallback technology icon. */
const fallbackImage = "/assets/img/grid/infra.webp";
/** Base path for grid module images. */
const baseImagePath = "/assets/img/grid/";

/**
 * Parses and styles parenthetical text fragments within a string.
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
 */
interface ModuleCheckboxProps {
	isDisabled: boolean;
	module: SelectionModule;
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
 */
interface ModuleGroupProps {
	currentCheckedModules: string[];
	groupName: string;
	modules: SelectionModule[];
	onClose?: () => void;
	techColor: ModuleSelectionDialogProps["techColor"];
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
 */
const DialogBody: React.FC<
	ModuleDialogBodyProps & {
		allModulesSelected: boolean;
		handleSelectAllChange: (checked: "indeterminate" | boolean) => void;
		handleValueChange: (v: string[]) => void;
		onClose: () => void;
		tech?: string;
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
