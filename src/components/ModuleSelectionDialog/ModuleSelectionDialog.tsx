/**
 * Interactive technology module configuration dialog module.
 */

import React, { memo, Suspense } from "react";
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
import { ModuleSelectionProvider } from "./ModuleSelectionContext";
import { useModuleSelectionContext } from "./useModuleSelectionContext";

import "./ModuleSelectionDialog.scss";

import type { GroupedModules, ModuleSelectionDialogProps, SelectionModule } from "@/types/props";

import AppDialog from "@/components/AppDialog/Base/AppDialog";
import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";

export type { GroupedModules, ModuleSelectionDialogProps, SelectionModule };

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
const ModuleCheckbox: React.FC<{ isDisabled: boolean; module: SelectionModule }> = ({
	isDisabled,
	module,
}) => {
	const { techColor } = useModuleSelectionContext();
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
const ModuleGroup: React.FC<{
	groupName: string;
	modules: SelectionModule[];
	titleOverride?: string;
}> = ({ groupName, modules, titleOverride }) => {
	const { t } = useTranslation();
	const { openDialog } = useDialog();
	const { currentCheckedModules, onClose } = useModuleSelectionContext();

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

				return <ModuleCheckbox isDisabled={isDisabled} key={module.id} module={module} />;
			})}
		</div>
	);
};

/**
 * The primary content component for the module selection dialog.
 */
const DialogBody: React.FC = () => {
	const { t } = useTranslation();
	const {
		allModulesSelected,
		currentCheckedModules,
		groupedModules,
		handleSelectAllChange,
		handleValueChange,
		tech,
		techColor,
	} = useModuleSelectionContext();
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
				<CheckboxGroup.Root onValueChange={handleValueChange} value={currentCheckedModules}>
					{MODULE_GROUP_ORDER.filter((g) => g !== "core").map((groupName) => {
						if (!groupedModules[groupName]?.length) return null;

						let titleOverride: string | undefined;

						if (groupName === "bonus" && tech === "trails") {
							titleOverride = t("moduleSelection.trails");
						}

						return (
							<ModuleGroup
								groupName={groupName}
								key={groupName}
								modules={groupedModules[groupName]}
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
const DialogFooter: React.FC = () => {
	const { t } = useTranslation();
	const { currentCheckedModules, handleOptimizeClick, onClose } = useModuleSelectionContext();
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
	const { t } = useTranslation();
	const { isOpen, onClose, translatedTechName } = props;

	return (
		<ModuleSelectionProvider props={props}>
			<Suspense fallback={null}>
				<AppDialog.Root isOpen={isOpen} onClose={onClose}>
					<AppDialog.Title
						headerIcon={
							<CheckCircledIcon
								className="h-6 w-6"
								style={{ color: "var(--accent-11)" }}
							/>
						}
					>
						{t("moduleSelection.title", { techName: translatedTechName })}
					</AppDialog.Title>
					<AppDialog.Body>
						<DialogBody />
					</AppDialog.Body>
					<AppDialog.Footer>
						<DialogFooter />
					</AppDialog.Footer>
				</AppDialog.Root>
			</Suspense>
		</ModuleSelectionProvider>
	);
});

ModuleSelectionDialog.displayName = "ModuleSelectionDialog";
