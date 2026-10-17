import "./TechTreeRow.scss";

import type { TechTreeRowProps } from "@/types/props";
import React from "react";
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

import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";
import { useTechTree } from "@/components/TechTree/useTechTreeContext";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useTechStore } from "@/store/tech/techStore";
import { useA11yStore, useModuleSelectionDialogStore } from "@/store/ui/uiStore";
import { isTouchDevice } from "@/utils/browser/environment";

import { TechTreeRowProvider } from "./TechTreeRowContext";
import { useTechTreeRowContext } from "./useTechTreeRowContext";

/**
 * Props for the `BonusStatusIcon` component.
 */
interface BonusStatusIconProps {
	/** Total count of modules in the technology group. If <= 1, no icon is rendered. */
	moduleCount?: number;
	/** Unique identifier for the technology. */
	tech: string;
	/** The actual bonus achieved in the most recent solve. */
	techSolvedBonus: number;
}

/**
 * Renders the appropriate Radix icon component based on the status type.
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
 * A component that displays a status icon representing the optimization quality of a technology.
 *
 * @remarks
 * Renders an optimization quality indicator based on solved bonus stats. Returns `null` if the
 * bonus score is non-positive, status data is unavailable, or the tech group has 1 or fewer modules.
 *
 * @param {BonusStatusIconProps} props - The component props.
 * @param {number} [props.moduleCount] - Total count of modules in the technology group.
 * @param {string} props.tech - Unique identifier for the technology.
 * @param {number} props.techSolvedBonus - The actual bonus achieved in the most recent solve.
 *
 * @returns {React.ReactNode} The rendered status icon, or null if bonus score is non-positive, moduleCount <= 1, or status is unavailable.
 *
 * @see {@link ./BonusStatusIcon.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <BonusStatusIcon moduleCount={4} tech="pulse" techSolvedBonus={100} />
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
			iconClassName = "mt-[7px] inline-block align-text-top";
			iconStyle = { color: "var(--gray-a10)" };
			tooltipContent = t("techTree.tooltips.validSolve");
			break;
		case "lightning":
			iconClassName = "mt-1.5 inline-block h-4 w-4 align-text-top";
			iconStyle = { color: "var(--amber-a8)" };
			tooltipContent = `${t("techTree.tooltips.boostedSolve")} +${percent}%`;
			break;
		case "warning":
			iconClassName = "mt-2 inline-block align-text-top";
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
 * Primary interaction buttons for a technology row.
 */
const TechTreeRowActions: React.FC = () => {
	const { t } = useTranslation();
	const { isGridFull, solving } = useTechTree();
	const {
		checkedModulesCount,
		handleOptimizeClick,
		handleReset,
		hasTechInGrid,
		isOptimizing,
		isResetting,
		tech,
		translatedTechName,
	} = useTechTreeRowContext();

	let tooltipLabel: string;

	if (isGridFull && !hasTechInGrid) {
		tooltipLabel = t("techTree.tooltips.gridFull");
	} else {
		tooltipLabel = hasTechInGrid ? t("techTree.tooltips.update") : t("techTree.tooltips.solve");
	}

	const OptimizeIconComponent = hasTechInGrid ? UpdateIcon : MagicWandIcon;
	const isOptimizeButtonDisabled =
		(isGridFull && !hasTechInGrid) || solving || isOptimizing || checkedModulesCount === 0;

	return (
		<>
			<ConditionalTooltip label={tooltipLabel}>
				<IconButton
					aria-label={`${tooltipLabel} ${translatedTechName}`}
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
		</>
	);
};

/**
 * Renders the localized technology name with responsive typography.
 */
const TechTreeRowLabel: React.FC = () => {
	const { translatedTechName } = useTechTreeRowContext();
	const isSmallAndUp = useBreakpoint("640px");

	return (
		<Text
			as="div"
			className="techRow__label block flex-1 leading-snug! sm:leading-tight!"
			size={isSmallAndUp ? "3" : "2"}
			trim={isSmallAndUp ? "normal" : "both"}
			weight="medium"
			wrap="balance"
		>
			{translatedTechName}
		</Text>
	);
};

/**
 * Status and configuration badges for a technology row.
 *
 * @remarks
 * The module count badge opens the shared `ModuleSelectionDialog` via the
 * Zustand store, rather than instantiating a per-row dialog instance.
 */
const TechTreeRowBadges: React.FC = () => {
	const { t } = useTranslation();
	const { a11yMode: _a11yMode } = useA11yStore();
	const { isGridFull, solving } = useTechTree();
	const openDialog = useModuleSelectionDialogStore((state) => state.openDialog);
	const [, startTransition] = React.useTransition();

	const {
		checkedModulesCount,
		hasTechInGrid,
		modules,
		tech,
		techColor,
		techImage,
		techSolvedBonus,
		translatedTechName,
	} = useTechTreeRowContext();

	const handleOpenDialog = () => {
		startTransition(() => {
			openDialog({ tech, techColor, techImage });
		});
	};

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
				mt="1"
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
		<>
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
		</>
	);
};

/**
 * Avatar component for a technology row.
 */
const TechTreeRowAvatar: React.FC = () => {
	const { imagePath, imagePath2x, techColor, translatedTechName } = useTechTreeRowContext();

	return (
		<Avatar
			alt={translatedTechName}
			color={techColor}
			fallback="IK"
			radius="full"
			size="2"
			src={imagePath}
			srcSet={`${imagePath} 1x, ${imagePath2x} 2x`}
		/>
	);
};

/**
 * A single row in the technology sidebar providing configuration and status.
 */
export const TechTreeRow = React.memo((props: TechTreeRowProps) => {
	return (
		<TechTreeRowProvider props={props}>
			<div className="optimizationButton mt-2 mb-2 ml-0 flex items-center gap-2 sm:ml-1 lg:mr-1">
				<TechTreeRowActions />
				<TechTreeRowAvatar />

				<div className="grid flex-1 grid-cols-[1fr_auto] items-center gap-2">
					<div className="flex items-center justify-start">
						<TechTreeRowLabel />
					</div>

					<div className="flex items-center justify-end gap-1">
						<TechTreeRowBadges />
					</div>
				</div>
			</div>
		</TechTreeRowProvider>
	);
});

TechTreeRow.displayName = "TechTreeRow";
