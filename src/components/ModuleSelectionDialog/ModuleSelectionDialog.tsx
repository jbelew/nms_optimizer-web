/**
 * Store-connected Module Selection dialog module.
 *
 * @remarks
 * Subscribes to {@link useModuleSelectionDialogStore}, {@link useTechStore},
 * and {@link usePlatformStore} to render a single shared dialog instance for configuring a
 * Technology Category's Module Selection. Delegates all Module Group classification, alphabetical
 * sorting, and Module Rank Order prerequisite rules to {@link groupModules},
 * {@link getModulePrerequisites}, and {@link resolveActiveTechVariant}.
 *
 * @see {@link ./ModuleSelectionDialog.test.tsx Unit Tests}
 * @see {@link ./ModuleSelectionDialog.stories.tsx Storybook}
 *
 * @module components/ModuleSelectionDialog/ModuleSelectionDialog
 */

import React, { memo, Suspense, useCallback, useEffect, useRef, useTransition } from "react";
import { CheckCircledIcon, InfoCircledIcon, MagicWandIcon } from "@radix-ui/react-icons";
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
import { Trans, useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { shallow } from "zustand/shallow";

import type { GroupedModules, SelectionModule } from "@/types/props";
import AppDialog from "@/components/AppDialog/Base/AppDialog";
import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useOptimize } from "@/hooks/useOptimize/useOptimize";
import { usePlatformStore } from "@/store/app/platformStore";
import {
	areAllModulesSelected,
	getModulePrerequisites,
	getSelectAllModuleIds,
	getTechnologyTranslationKey,
	groupModules,
	MODULE_GROUP_ORDER,
	resolveActiveTechVariant,
} from "@/store/tech/techRules";
import { useTechStore } from "@/store/tech/techStore";
import { useModuleSelectionDialogStore } from "@/store/ui/uiStore";
import { determineWindowDimensions } from "@/utils/optimization/windowDimensions";
import { useDialog } from "@/utils/system/dialogUtils";
import { formatDocumentTitle } from "@shared/page-metadata.js";

/**
 * Shared types for module grouping and selection items.
 * @category Components
 */
export type { GroupedModules, SelectionModule };

/** Default empty array for modules to ensure stable reference when dialog is closed. */
const EMPTY_MODULES_ARRAY: SelectionModule[] = [];
/** Path to the fallback technology icon. */
const fallbackImage = "/assets/img/grid/infra.webp";
/** Base path for grid module images. */
const baseImagePath = "/assets/img/grid/";

/**
 * Props for the {@link ModuleCheckbox} component.
 *
 * @category Components
 */
interface ModuleCheckboxProps {
	/** Whether the module is an immutable Core Module rendered outside the interactive checkbox group. */
	isCore?: boolean;
	/** Whether the checkbox is disabled due to missing Module Rank Order prerequisites. */
	isDisabled: boolean;
	/** The module data to display. */
	module: SelectionModule;
	/** Accent color for the module avatar. */
	techColor: React.ComponentProps<typeof Avatar>["color"];
}

/**
 * Props for the {@link ModuleGroup} component.
 *
 * @category Components
 */
interface ModuleGroupProps {
	/** Currently checked module IDs. */
	currentCheckedModules: string[];
	/** The unique key of the Module Group. */
	groupName: string;
	/** Pre-sorted list of modules in this group. */
	modules: SelectionModule[];
	/** Callback to close the dialog when opening instructions. */
	onClose: () => void;
	/** Accent color for module avatars. */
	techColor: React.ComponentProps<typeof Avatar>["color"];
	/** Optional display title override for the group. */
	titleOverride?: string;
}

/**
 * Props for the {@link SafeParagraph} component.
 *
 * @category Components
 */
interface SafeParagraphProps extends Omit<React.ComponentPropsWithoutRef<"p">, "style"> {
	/** Optional style prop stripped from i18n `<Trans>` interpolation. */
	style?: unknown;
}

/**
 * Resolves the versioned asset path for a module's icon, falling back to the default grid icon.
 *
 * @param image - Relative module image path within `/assets/img/grid/`.
 *
 * @returns The resolved versioned image path or fallback icon path.
 *
 * @category Utilities
 */
const resolveModuleImagePath = (image?: null | string): string =>
	image ?
		`${baseImagePath}${image}?v=${typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "1.0"}`
	:	fallbackImage;

/**
 * Parses and styles parenthetical text fragments within a string.
 *
 * @param text - The input text containing parentheses.
 *
 * @returns Formatted React nodes with styled badges.
 *
 * @category Utilities
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
				<Badge
					className="hidden! font-mono! sm:inline!"
					ml="1"
				>
					{matches[index].slice(1, -1)}
				</Badge>
			)}
		</React.Fragment>
	));
};

/**
 * Parses and styles bracketed text fragments within a technology label.
 *
 * @param label - The input label string.
 *
 * @returns Formatted React nodes with code blocks.
 *
 * @category Utilities
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
 * @param {ModuleCheckboxProps} props - Component properties.
 * @param {boolean} [props.isCore] - Whether the module is an immutable Core Module rendered outside the interactive checkbox group.
 * @param {boolean} props.isDisabled - Whether the checkbox is disabled due to missing Module Rank Order prerequisites.
 * @param {SelectionModule} props.module - The module data to display.
 * @param {React.ComponentProps<typeof Avatar>["color"]} props.techColor - Accent color for the module avatar.
 *
 * @returns {JSX.Element} The rendered checkbox label.
 *
 * @component
 *
 * @category Components
 */
const ModuleCheckbox: React.FC<ModuleCheckboxProps> = memo(
	({ isCore = false, isDisabled, module, techColor }) => {
		const imagePath = resolveModuleImagePath(module.image);

		return (
			<label
				className={`mb-2 flex items-center gap-2 text-sm font-medium sm:text-base ${
					isCore ? "" : (
						"cursor-pointer transition-colors duration-200 hover:text-(--accent-a12)"
					)
				}`}
				key={module.id}
				style={isCore ? undefined : { cursor: "pointer" }}
			>
				{isCore ?
					<Checkbox
						checked={true}
						disabled={true}
					/>
				:	<CheckboxGroup.Item
						disabled={isDisabled}
						value={module.id}
					/>
				}
				<Avatar
					alt={module.label}
					color={techColor}
					fallback={isCore ? "IK" : module.id}
					radius="medium"
					size="1"
					src={imagePath}
				/>
				<span className="flex-1">{formatLabel(module.label ?? module.id)}</span>
			</label>
		);
	},
);

ModuleCheckbox.displayName = "ModuleCheckbox";

/**
 * Categorized Module Group of checkboxes.
 *
 * @param props - Component properties.
 * @param props.currentCheckedModules - Currently checked module IDs.
 * @param props.groupName - The unique key of the Module Group.
 * @param props.modules - Pre-sorted list of modules in this group.
 * @param props.onClose - Callback to close the dialog when opening instructions.
 * @param props.techColor - Accent color for module avatars.
 * @param [props.titleOverride] - Optional display title override for the group.
 *
 * @returns The rendered group of checkboxes, or `null` if no modules are present.
 *
 * @component
 *
 * @category Components
 */
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

	if (!modules || modules.length === 0) {
		return null;
	}

	const dependencyMap = getModulePrerequisites(groupName, modules);

	return (
		<div className="mb-1">
			<div
				className={`heading-styled flex items-center gap-1 ${
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
								onClose();
								openDialog("instructions", { section: "section-4" });
							}}
						/>
					</ConditionalTooltip>
				)}
			</div>

			{groupName === "cosmetic" && (
				<Blockquote
					className="text-sm sm:text-base"
					mb="3"
					mt="1"
				>
					<Trans
						components={{ p: <p /> }}
						i18nKey="moduleSelection.cosmeticInfo"
					/>
				</Blockquote>
			)}
			{modules.map((module) => {
				const prerequisiteId = dependencyMap.get(module.id);
				const isDisabled =
					prerequisiteId ? !currentCheckedModules.includes(prerequisiteId) : false;

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
 * A paragraph component that strips the i18n style attribute to prevent runtime errors
 * in React 19 and replaces it with the equivalent Tailwind class.
 *
 * @param props - Component props including style override.
 *
 * @returns A clean paragraph element.
 */
const SafeParagraph: React.FC<SafeParagraphProps> = ({ style, ...props }) => (
	<p
		{...props}
		className={style ? "mt-2" : undefined}
	/>
);

/**
 * Store-connected dialog for configuring a Technology Category's Module Selection.
 *
 * @remarks
 * Renders a single shared dialog instance driven by {@link useModuleSelectionDialogStore}.
 * Snapshots initial selections on open so canceling or clicking the backdrop reverts
 * uncommitted checkbox changes, and displays a live Solver Window dimension badge in the footer.
 *
 * @returns {JSX.Element | null} The rendered dialog when a Technology Category is selected, or `null`.
 *
 * @see {@link useModuleSelectionDialogStore}
 * @see {@link useTechStore}
 * @see {@link groupModules}
 * @see {@link getModulePrerequisites}
 * @see {@link determineWindowDimensions}
 * @see {@link ./ModuleSelectionDialog.test.tsx Unit Tests}
 * @see {@link ./ModuleSelectionDialog.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example Rendering the shared Module Selection dialog
 * ```tsx
 * <ModuleSelectionDialog />
 * // renders null when closed, or the active Technology Category's Module Selection dialog when open
 * ```
 */
export const ModuleSelectionDialog: React.FC = memo(() => {
	const { t } = useTranslation();
	const { handleOptimize } = useOptimize();
	const { sendDeferredEvent } = useAnalytics();
	const isSmall = !useBreakpoint("640px");
	const [, startTransition] = useTransition();

	const { closeDialog, isOpen, selectedTechData } = useModuleSelectionDialogStore(
		useShallow((state) => ({
			closeDialog: state.closeDialog,
			isOpen: state.isOpen,
			selectedTechData: state.selectedTechData,
		})),
	);

	const activeTech = selectedTechData?.tech ?? "";
	const techColor = selectedTechData?.techColor ?? "blue";
	const techImage = selectedTechData?.techImage ?? null;

	const setCheckedModules = useTechStore((state) => state.setCheckedModules);
	const currentCheckedModules = useTechStore(
		useShallow((state) => state.checkedModules[activeTech] || []),
	);
	const { activeGroupType, techGroup } = useTechStore(
		useShallow((state) => ({
			activeGroupType: state.activeGroups?.[activeTech] || "normal",
			techGroup: state.techGroups?.[activeTech],
		})),
	);

	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform);
	const isCorvette = selectedPlatform === "corvette";

	const activeVariant = resolveActiveTechVariant(techGroup, activeGroupType);
	const modules = activeVariant?.modules || EMPTY_MODULES_ARRAY;
	const groupedModules = groupModules(modules);
	const allModulesSelected = areAllModulesSelected(modules, currentCheckedModules);

	const initialModulesRef = useRef<string[]>([]);
	const lastOpenedTechRef = useRef<null | string>(null);
	const optimizeClickedRef = useRef(false);

	const translationKeyPart = getTechnologyTranslationKey(activeTech, techImage);
	const translatedTechName = activeTech ? t(`technologies.${translationKeyPart}`) : "";

	const currentCheckedModulesRef = useRef(currentCheckedModules);
	useEffect(() => {
		currentCheckedModulesRef.current = currentCheckedModules;
	}, [currentCheckedModules]);

	useEffect(() => {
		if (!isOpen || !activeTech) {
			lastOpenedTechRef.current = null;

			return;
		}

		if (lastOpenedTechRef.current === activeTech) {
			return;
		}

		lastOpenedTechRef.current = activeTech;
		initialModulesRef.current = currentCheckedModulesRef.current;
		optimizeClickedRef.current = false;

		const appName = t("appName", { defaultValue: "NMS Optimizer" });
		const pageTitle = formatDocumentTitle(`${translatedTechName} Selection`, appName);

		sendDeferredEvent({
			action: "page_view",
			category: "engagement",
			nonInteraction: true,
			page: `${window.location.pathname}${window.location.search}#module-selection-${activeTech}`,
			page_location: window.location.href,
			page_title: pageTitle,
		});
	}, [activeTech, isOpen, sendDeferredEvent, t, translatedTechName]);

	const handleValueChange = useCallback(
		(moduleIds: string[]) => {
			setCheckedModules(activeTech, () => moduleIds);
		},
		[activeTech, setCheckedModules],
	);

	const handleSelectAllChange = (checked: "indeterminate" | boolean) => {
		handleValueChange(getSelectAllModuleIds(modules, checked));
	};

	const handleOptimizeClick = useCallback(async () => {
		optimizeClickedRef.current = true;
		await handleOptimize(activeTech);
		closeDialog();
	}, [activeTech, closeDialog, handleOptimize]);

	const handleClose = useCallback(() => {
		startTransition(() => {
			if (
				!optimizeClickedRef.current
				&& !shallow(currentCheckedModulesRef.current, initialModulesRef.current)
			) {
				handleValueChange(initialModulesRef.current);
			}

			closeDialog();
		});
	}, [closeDialog, handleValueChange]);

	if (!selectedTechData) {
		return null;
	}

	const isOptimizeDisabled = currentCheckedModules.length === 0;
	const windowDimensions = determineWindowDimensions(
		currentCheckedModules.length,
		activeVariant?.window_rules,
	);
	const windowBadgeText =
		isSmall ?
			windowDimensions ? `W: ${windowDimensions[0]}×${windowDimensions[1]}`
			:	"—"
		: windowDimensions ?
			t("moduleSelection.solverWindow", {
				height: windowDimensions[1],
				width: windowDimensions[0],
			})
		:	t("moduleSelection.solverWindowEmpty");

	const content = (
		<>
			{isCorvette && activeTech !== "trails" && (
				<Text
					as="div"
					className="block text-sm sm:text-base"
				>
					<Trans
						components={{
							i: <i />,
							p: <SafeParagraph />,
							strong: <strong className="font-bold" />,
						}}
						i18nKey="moduleSelection.warning"
					/>
				</Text>
			)}
			{activeTech === "trails" && (
				<Text
					as="div"
					className="block text-sm sm:text-base"
				>
					<Trans
						components={{
							p: <SafeParagraph />,
							strong: <strong className="font-bold" />,
						}}
						i18nKey="moduleSelection.trailsInfo"
					/>
				</Text>
			)}
			{!isCorvette && activeTech !== "trails" && (
				<Text
					as="p"
					className="block text-sm sm:text-base"
				>
					<Trans
						components={{ strong: <strong className="font-bold" /> }}
						i18nKey="moduleSelection.description"
					/>
				</Text>
			)}
			<label className="flex cursor-pointer items-center text-sm font-medium transition-colors duration-200 hover:text-(--accent-a12) sm:text-base">
				<Checkbox
					aria-label={t("moduleSelection.selectAll")}
					checked={allModulesSelected}
					onCheckedChange={handleSelectAllChange}
				/>
				<Text
					className="text-sm font-medium sm:text-base"
					ml="2"
				>
					{t("moduleSelection.selectAll")}
				</Text>
			</label>
			<Separator
				decorative
				orientation="horizontal"
				size="4"
			/>
			<div className="flex flex-col">
				{groupedModules["core"]?.length > 0 && (
					<div
						className="mb-2"
						key="core"
					>
						<div
							className="heading-styled mb-2"
							style={{ color: "var(--accent-a11)" }}
						>
							{t(`moduleSelection.core`)}
						</div>
						{groupedModules["core"].map((module) => (
							<ModuleCheckbox
								isCore={true}
								isDisabled={true}
								key={module.id}
								module={module}
								techColor={techColor}
							/>
						))}
					</div>
				)}
				<CheckboxGroup.Root
					onValueChange={handleValueChange}
					value={currentCheckedModules}
				>
					{MODULE_GROUP_ORDER.filter((g) => g !== "core").map((groupName) => {
						if (!groupedModules[groupName]?.length) return null;

						let titleOverride: string | undefined;

						if (groupName === "bonus" && activeTech === "trails") {
							titleOverride = t("moduleSelection.trails");
						}

						return (
							<ModuleGroup
								currentCheckedModules={currentCheckedModules}
								groupName={groupName}
								key={groupName}
								modules={groupedModules[groupName]}
								onClose={handleClose}
								techColor={techColor}
								titleOverride={titleOverride}
							/>
						);
					})}
				</CheckboxGroup.Root>
			</div>
		</>
	);

	const footer = (
		<div className="mb-1 flex w-full items-center justify-between gap-2">
			<Badge
				className="font-mono! text-xs! tabular-nums sm:text-sm!"
				color={isOptimizeDisabled ? "gray" : techColor}
				radius="medium"
				size="2"
				variant="surface"
			>
				{windowBadgeText} (x{currentCheckedModules.length})
			</Badge>
			<div className="flex items-center gap-2">
				<Button
					onClick={handleClose}
					variant="soft"
				>
					{t("moduleSelection.cancelButton")}
				</Button>
				<Button
					aria-label={t("moduleSelection.optimizeButton")}
					disabled={isOptimizeDisabled}
					onClick={handleOptimizeClick}
				>
					<MagicWandIcon />
					{t("moduleSelection.optimizeButton")}
				</Button>
			</div>
		</div>
	);

	return (
		<Suspense fallback={null}>
			<AppDialog
				content={content}
				footer={footer}
				headerIcon={
					<CheckCircledIcon
						className="h-6 w-6"
						style={{ color: "var(--accent-11)" }}
					/>
				}
				isOpen={isOpen}
				onClose={handleClose}
				title={t("moduleSelection.title", { techName: translatedTechName })}
			/>
		</Suspense>
	);
});

ModuleSelectionDialog.displayName = "ModuleSelectionDialog";
