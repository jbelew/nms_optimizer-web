import "./TechTreeRow.scss";

import type { TechTreeRowProps } from "@/types/props";
import React, { useCallback, useTransition } from "react";
import {
	Crosshair2Icon,
	ExclamationTriangleIcon,
	LightningBoltIcon,
	MagicWandIcon,
	OpenInNewWindowIcon,
	ResetIcon,
	UpdateIcon,
} from "@radix-ui/react-icons";
import { Avatar, Button, IconButton, Popover, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useOptimize } from "@/hooks/useOptimize/useOptimize";
import { useGridStore } from "@/store/grid/gridStore";
import { sessionCoordinator } from "@/store/sessionCoordinator";
import { getTechnologyTranslationKey, resolveActiveTechVariant } from "@/store/tech/techRules";
import { useTechStore } from "@/store/tech/techStore";
import { useModuleSelectionDialogStore } from "@/store/ui/uiStore";
import { isTouchDevice } from "@/utils/browser/environment";
import { Logger } from "@/utils/system/monitoring";

/** Default empty array for modules to ensure stable reference across renders. */
const EMPTY_MODULES_ARRAY: { id: string; image: string; label: string; type?: string }[] = [];

/**
 * Props for the {@link BonusStatusIcon} component.
 */
interface BonusStatusIconProps {
	/** Total count of modules in the Technology Variant. If <= 1, no icon is rendered. */
	moduleCount?: number;
	/** Unique identifier for the Technology Category. */
	tech: string;
	/** The actual bonus score achieved in the most recent solve. */
	techSolvedBonus: number;
}

/**
 * Renders the appropriate Radix icon element for a solved bonus status type.
 *
 * @param {string | null} iconType - Status icon key (`"check"`, `"lightning"`, or `"warning"`).
 * @param {string} className - CSS class names applied to the icon.
 * @param {React.CSSProperties} style - Inline color style applied to the icon.
 *
 * @returns {React.ReactNode} The rendered icon element, or `null` when unrecognized.
 */
function renderIcon(
	iconType: null | string,
	className: string,
	style: React.CSSProperties
): React.ReactNode {
	switch (iconType) {
		case "check":
			return <Crosshair2Icon className={className} style={style} />;
		case "lightning":
			return <LightningBoltIcon className={className} style={style} />;
		case "warning":
			return <ExclamationTriangleIcon className={className} style={style} />;
		default:
			return null;
	}
}

/**
 * Displays a status icon representing the optimization quality of a solved Technology Category.
 *
 * @remarks
 * Renders an optimization quality indicator based on solved bonus statistics in `useTechStore`.
 * Returns `null` if `techSolvedBonus` is non-positive, status data is unavailable, or the active
 * Technology Variant has 1 or fewer modules.
 *
 * @param {BonusStatusIconProps} props - Component properties.
 * @param {number} [props.moduleCount] - Total count of modules in the active Technology Variant.
 * @param {string} props.tech - Unique identifier for the Technology Category.
 * @param {number} props.techSolvedBonus - The actual bonus achieved in the most recent solve.
 *
 * @returns {React.ReactNode} The rendered status icon wrapped in a tooltip/popover, or `null`.
 *
 * @see {@link useTechStore}
 * @see {@link ./BonusStatusIcon.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <BonusStatusIcon moduleCount={4} tech="pulse" techSolvedBonus={100} />
 * // renders status icon button when solved bonus > 0 and moduleCount > 1
 * ```
 */
export const BonusStatusIcon: React.FC<BonusStatusIconProps> = ({
	moduleCount,
	tech,
	techSolvedBonus,
}) => {
	const { t } = useTranslation();
	const getBonusStatus = useTechStore((s) => s.getBonusStatus);
	const status = getBonusStatus(tech);

	if ((typeof moduleCount === "number" && moduleCount <= 1) || techSolvedBonus <= 0 || !status) {
		return null;
	}

	const { icon, percent } = status;

	let iconClassName: string;
	let iconStyle: React.CSSProperties;
	let tooltipContent: string;

	switch (icon) {
		case "check":
			iconClassName = "inline-block ";
			iconStyle = { color: "var(--gray-a10)" };
			tooltipContent = t("techTree.tooltips.validSolve");
			break;
		case "lightning":
			iconClassName = "inline-block";
			iconStyle = { color: "var(--amber-a8)" };
			tooltipContent = `${t("techTree.tooltips.boostedSolve")} +${percent}%`;
			break;
		case "warning":
			iconClassName = "inline-block";
			iconStyle = { color: "var(--red-a8)" };
			tooltipContent = `${t("techTree.tooltips.insufficientSpace")} -${percent}%`;
			break;
		default:
			return null;
	}

	const renderedIcon = renderIcon(icon, iconClassName, iconStyle);

	if (!renderedIcon) {
		return null;
	}

	const trigger = (
		<button
			aria-label={tooltipContent}
			className="flex cursor-pointer appearance-none border-none bg-transparent p-0"
			type="button"
		>
			{renderedIcon}
		</button>
	);

	if (isTouchDevice()) {
		return (
			<Popover.Root>
				<Popover.Trigger>{trigger}</Popover.Trigger>
				<Popover.Content size="1">
					<Text as="p" size="1" trim="both">
						{tooltipContent}
					</Text>
				</Popover.Content>
			</Popover.Root>
		);
	}

	return <ConditionalTooltip label={tooltipContent}>{trigger}</ConditionalTooltip>;
};

/**
 * Renders a single Technology Category row in the technology sidebar with solve, Technology Reset,
 * status indicator, and Module Selection dialog controls.
 *
 * @remarks
 * Connects directly to `useGridStore`, `useTechStore`, `useModuleSelectionDialogStore`,
 * `useOptimize`, and `sessionCoordinator.resetTechnology` without intermediate Context pass-throughs.
 *
 * @param {TechTreeRowProps} props - Component properties.
 * @param {string} props.tech - Unique Technology Category identifier (e.g., `"pulse"`).
 * @param {TechTreeRowProps["techColor"]} props.techColor - Radix UI accent color for the avatar and badge.
 * @param {string | null} props.techImage - Filename of the technology icon under `/assets/img/tech/`.
 *
 * @returns {JSX.Element} The rendered technology row.
 *
 * @see {@link BonusStatusIcon}
 * @see {@link useOptimize}
 * @see {@link sessionCoordinator}
 * @see {@link ./TechTreeRow.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <TechTreeRow tech="pulse" techColor="blue" techImage="pulse.webp" />
 * // renders solve/reset buttons, technology avatar, label, and Module Selection badge
 * ```
 */
export const TechTreeRow = React.memo(({ tech, techColor, techImage }: TechTreeRowProps) => {
	const { t } = useTranslation();
	const { handleOptimize, solving } = useOptimize();
	const [isResetting, startResetTransition] = useTransition();
	const [isOptimizing, startOptimizeTransition] = useTransition();
	const [, startDialogTransition] = useTransition();
	const isSmallAndUp = useBreakpoint("640px");
	const openDialog = useModuleSelectionDialogStore((state) => state.openDialog);

	const hasTechInGrid = useGridStore((state) => Boolean(state.activeTechs?.has?.(tech)));
	const isGridFull = useGridStore((state) => Boolean(state.isGridFull));

	const { activeGroupType, checkedModulesCount, techGroup, techSolvedBonus } = useTechStore(
		useShallow((state) => ({
			activeGroupType: state.activeGroups?.[tech] || "normal",
			checkedModulesCount: state.checkedModules?.[tech]?.length ?? 0,
			techGroup: state.techGroups?.[tech],
			techSolvedBonus: state.solvedBonus?.[tech] ?? 0,
		}))
	);

	const activeGroup = resolveActiveTechVariant(techGroup, activeGroupType);
	const modules = activeGroup?.modules || EMPTY_MODULES_ARRAY;

	const handleReset = useCallback(() => {
		performance.mark("reset-start");
		startResetTransition(() => {
			try {
				sessionCoordinator.resetTechnology(tech);
			} catch (error) {
				Logger.error("Failed to reset technology in grid:", error);
			}
		});
		performance.mark("reset-end");
		performance.measure("reset-duration", "reset-start", "reset-end");
	}, [tech]);

	const handleOptimizeClick = useCallback(() => {
		startOptimizeTransition(async () => {
			try {
				await handleOptimize(tech);
			} catch (error) {
				Logger.error("Failed to optimize technology:", error);
			}
		});
	}, [handleOptimize, tech]);

	const handleOpenDialog = useCallback(() => {
		startDialogTransition(() => {
			openDialog({ tech, techColor, techImage });
		});
	}, [openDialog, tech, techColor, techImage]);

	const translationKeyPart = getTechnologyTranslationKey(tech, techImage);
	const translatedTechName = t(`technologies.${translationKeyPart}`);

	const baseImagePath = "/assets/img/tech/";
	const versionParam = `?v=${__APP_VERSION__}`;
	const resolvedImage = techImage || "infra.webp";
	const imagePath = `${baseImagePath}${resolvedImage}${versionParam}`;
	const imagePath2x = `${baseImagePath}${resolvedImage.replace(/\.(webp|png|jpg|jpeg)$/, "@2x.$1")}${versionParam}`;

	const optimizeTooltipLabel =
		isGridFull && !hasTechInGrid
			? t("techTree.tooltips.gridFull")
			: hasTechInGrid
				? t("techTree.tooltips.update")
				: t("techTree.tooltips.solve");

	const OptimizeIconComponent = hasTechInGrid ? UpdateIcon : MagicWandIcon;
	const isOptimizeButtonDisabled =
		(isGridFull && !hasTechInGrid) || solving || isOptimizing || checkedModulesCount === 0;

	const badgeContent = (
		<div>
			<Button
				aria-label={`x${checkedModulesCount} - ${t("moduleSelection.tooltip", {
					count: checkedModulesCount,
					techName: translatedTechName,
				})}`}
				className="ml-1! align-top font-mono! tabular-nums"
				color={hasTechInGrid ? "gray" : techColor}
				disabled={modules.length === 1 || (isGridFull && !hasTechInGrid) || solving}
				onClick={handleOpenDialog}
				radius="medium"
				size="1"
				variant={modules.length === 1 ? "surface" : "solid"}
			>
				x{checkedModulesCount}
				<OpenInNewWindowIcon />
			</Button>
		</div>
	);

	return (
		<div className="optimizationButton mb-3 flex items-center gap-2">
			<ConditionalTooltip label={optimizeTooltipLabel}>
				<IconButton
					aria-label={`${optimizeTooltipLabel} ${translatedTechName}`}
					className={`techRow__resetButton ${!isOptimizeButtonDisabled ? "cursor-pointer!" : ""}`}
					disabled={isOptimizeButtonDisabled}
					id={tech}
					onClick={handleOptimizeClick}
				>
					<OptimizeIconComponent />
				</IconButton>
			</ConditionalTooltip>

			<ConditionalTooltip label={t("techTree.tooltips.reset")}>
				<IconButton
					aria-label={`${t("techTree.tooltips.reset")} ${translatedTechName}`}
					className={`techRow__resetButton ${hasTechInGrid && !solving ? "cursor-pointer!" : ""}`}
					disabled={!hasTechInGrid || solving || isResetting || isOptimizing}
					onClick={handleReset}
				>
					<ResetIcon />
				</IconButton>
			</ConditionalTooltip>

			<Avatar
				alt={translatedTechName}
				color={techColor}
				fallback="IK"
				radius="full"
				size="2"
				src={imagePath}
				srcSet={`${imagePath} 1x, ${imagePath2x} 2x`}
			/>

			<div className="grid flex-1 grid-cols-[1fr_auto] items-center gap-2">
				<div className="flex items-center justify-start">
					<Text
						as="div"
						className="techRow__label block flex-1 leading-snug! sm:[transform:scaleY(0.95)]"
						size={isSmallAndUp ? "3" : "2"}
						trim="both"
						weight="medium"
						wrap="balance"
					>
						{translatedTechName}
					</Text>
				</div>

				<div className="flex items-center justify-end gap-1">
					{hasTechInGrid && modules.length > 1 && (
						<BonusStatusIcon
							moduleCount={modules.length}
							tech={tech}
							techSolvedBonus={techSolvedBonus}
						/>
					)}
					{modules.length > 1 ? (
						<ConditionalTooltip
							label={t("moduleSelection.tooltip", { techName: translatedTechName })}
						>
							{badgeContent}
						</ConditionalTooltip>
					) : (
						badgeContent
					)}
				</div>
			</div>
		</div>
	);
});

TechTreeRow.displayName = "TechTreeRow";
