import "./TechTreeRow.scss";

import type { BonusStatusData } from "@/store/tech/techBonusStore";
import type { TechTreeRowProps } from "@/types/props";
import React, { useCallback, useEffect, useRef, useState, useTransition } from "react";
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
import { ModuleSelectionDialog } from "@/components/ModuleSelectionDialog/ModuleSelectionDialog";
import { useTechTree } from "@/components/TechTree/createTechTreeContext";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useA11yStore } from "@/store/app/a11yStore";
import { useTechBonusStore } from "@/store/tech/techBonusStore";
import { isTouchDevice } from "@/utils/browser/environment";

import { TechTreeRowProvider } from "./TechTreeRowContext";
import { useTechTreeRowContext } from "./useTechTreeRowContext";

/**
 * Props for the `BonusStatusIcon` component.
 */
interface BonusStatusIconProps {
	/** Unique identifier for the technology. */
	tech: string;
	/** The theoretical maximum bonus for the current configuration. */
	techMaxBonus: number;
	/** The actual bonus achieved in the most recent solve. */
	techSolvedBonus: number;
}

/**
 * Core logic to determine the efficiency rating and icon metadata for a technology.
 */
function computeBonusStatusData(techMaxBonus: number, t: (key: string) => string): BonusStatusData {
	const roundedMaxBonus = round(techMaxBonus, 2);

	if (roundedMaxBonus < 100) {
		const percent = Math.round((100 - roundedMaxBonus) * 100) / 100;

		return {
			icon: "warning",
			iconClassName: "mt-2 inline-block cursor-pointer align-text-top",
			iconStyle: { color: "var(--red-a8)" },
			percent,
			tooltipContent: `${t("techTree.tooltips.insufficientSpace")} -${percent}%`,
		};
	}

	if (roundedMaxBonus === 100) {
		return {
			icon: "check",
			iconClassName: "mt-[7px] inline-block cursor-pointer align-text-top",
			iconStyle: { color: "var(--gray-a10)" },
			percent: 0,
			tooltipContent: `${t("techTree.tooltips.validSolve")} `,
		};
	}

	const percent = Math.round((roundedMaxBonus - 100) * 100) / 100;

	return {
		icon: "lightning",
		iconClassName: "mt-1.5 inline-block h-4 w-4 cursor-pointer align-text-top",
		iconStyle: { color: "var(--amber-a8)" },
		percent,
		tooltipContent: `${t("techTree.tooltips.boostedSolve")} +${percent}%`,
	};
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
 * Rounds a numerical value to a fixed number of decimal places.
 */
function round(value: number, decimals: number) {
	return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
}

/**
 * A component that displays a status icon representing the optimization quality of a technology.
 */
export const BonusStatusIcon: React.FC<BonusStatusIconProps> = ({
	tech,
	techMaxBonus,
	techSolvedBonus,
}) => {
	const { t } = useTranslation();
	const { getBonusStatus, setBonusStatus } = useTechBonusStore();
	const cachedBonusStatus = getBonusStatus(tech);

	const contentData = React.useMemo(() => {
		return techMaxBonus === 0 && cachedBonusStatus
			? {
					...cachedBonusStatus,
					tooltipContent:
						cachedBonusStatus.icon === "check"
							? t("techTree.tooltips.validSolve")
							: cachedBonusStatus.icon === "warning"
								? `${t("techTree.tooltips.insufficientSpace")} -${cachedBonusStatus.percent}%`
								: `${t("techTree.tooltips.boostedSolve")} +${cachedBonusStatus.percent}%`,
				}
			: computeBonusStatusData(techMaxBonus, t);
	}, [techMaxBonus, cachedBonusStatus, t]);

	useEffect(() => {
		if (techSolvedBonus <= 0) {
			return;
		}

		const cached = getBonusStatus(tech);
		const hasChanged =
			!cached ||
			cached.icon !== contentData.icon ||
			cached.percent !== contentData.percent ||
			cached.tooltipContent !== contentData.tooltipContent;

		if (hasChanged) {
			setBonusStatus(tech, contentData);
		}
	}, [tech, contentData, setBonusStatus, getBonusStatus, techSolvedBonus]);

	if (techSolvedBonus <= 0 && !cachedBonusStatus) {
		return null;
	}

	const icon = renderIcon(
		contentData.icon,
		contentData.iconClassName.replace("cursor-pointer", ""),
		contentData.iconStyle
	);

	if (!icon) {
		return null;
	}

	const trigger = (
		<button
			aria-label={contentData.tooltipContent}
			className="flex cursor-pointer appearance-none border-none bg-transparent p-0"
			type="button"
		>
			{icon}
		</button>
	);

	if (isTouchDevice()) {
		return (
			<Popover.Root>
				<Popover.Trigger>{trigger}</Popover.Trigger>
				<Popover.Content size="1">
					<Text as="p" size="1" trim="both">
						{contentData.tooltipContent}
					</Text>
				</Popover.Content>
			</Popover.Root>
		);
	}

	return <ConditionalTooltip label={contentData.tooltipContent}>{trigger}</ConditionalTooltip>;
};

/**
 * Primary interaction buttons for a technology row.
 */
const TechTreeRowActions: React.FC = () => {
	const { t } = useTranslation();
	const { isGridFull, solving } = useTechTree();
	const {
		currentCheckedModules,
		handleOptimizeClick,
		handleReset,
		hasTechInGrid,
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
		(isGridFull && !hasTechInGrid) || solving || currentCheckedModules.length === 0;

	return (
		<>
			<ConditionalTooltip label={tooltipLabel}>
				<IconButton
					aria-label={`${tooltipLabel} ${translatedTechName}`}
					className={`techRow__resetButton ${!isOptimizeButtonDisabled ? "cursor-pointer!" : ""}`.trim()}
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
					className={`techRow__resetButton ${hasTechInGrid && !solving ? "cursor-pointer!" : ""}`.trim()}
					disabled={!hasTechInGrid || solving || isResetting}
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
			className="techRow__label block flex-1 pt-1"
			size={isSmallAndUp ? "3" : "2"}
			weight="medium"
			wrap="balance"
		>
			{translatedTechName}
		</Text>
	);
};

/**
 * Status and configuration badges for a technology row.
 */
const TechTreeRowBadges: React.FC = () => {
	const { t } = useTranslation();
	const { a11yMode } = useA11yStore();
	const { sendDeferredEvent } = useAnalytics();
	const { isGridFull, solving } = useTechTree();
	const [isOpen, setIsOpen] = useState(false);
	const [initialModules, setInitialModules] = useState<string[]>([]);
	const optimizeClickedRef = useRef(false);
	const [, startTransition] = useTransition();

	const {
		allModulesSelected,
		currentCheckedModules,
		groupedModules,
		handleAllCheckboxesChange,
		handleOptimizeClick,
		handleSelectAllChange,
		handleValueChange,
		hasTechInGrid,
		isIndeterminate,
		modules,
		tech,
		techColor,
		techImage,
		techMaxBonus,
		techSolvedBonus,
		translatedTechName,
	} = useTechTreeRowContext();

	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (open) {
				setInitialModules(currentCheckedModules);
				optimizeClickedRef.current = false;
				startTransition(() => {
					setIsOpen(open);
				});

				sendDeferredEvent({
					action: "page_view",
					category: "engagement",
					nonInteraction: true,
					page: `${window.location.pathname}${window.location.search}#module-selection-${tech}`,
					page_location: window.location.href,
					page_title: `NMS Optimizer: ${translatedTechName} Selection`,
				});
			} else {
				startTransition(() => {
					if (!optimizeClickedRef.current) {
						handleAllCheckboxesChange(initialModules);
					}

					setIsOpen(open);
				});
			}
		},
		[
			currentCheckedModules,
			handleAllCheckboxesChange,
			initialModules,
			sendDeferredEvent,
			tech,
			translatedTechName,
		]
	);

	const handleOptimizeWrapper = useCallback(async () => {
		optimizeClickedRef.current = true;
		await handleOptimizeClick();
		handleOpenChange(false);
	}, [handleOptimizeClick, handleOpenChange]);

	const handleOnClose = useCallback(() => handleOpenChange(false), [handleOpenChange]);

	const badgeContent = (
		<div>
			<Button
				aria-label={t("moduleSelection.tooltip", {
					count: currentCheckedModules.length,
					techName: translatedTechName,
				})}
				className="ml-1! align-top font-mono! tabular-nums"
				color={hasTechInGrid ? "gray" : techColor}
				disabled={modules.length === 1 || (isGridFull && !hasTechInGrid) || solving}
				highContrast={a11yMode}
				mt="1"
				onClick={() => handleOpenChange(true)}
				radius="medium"
				size="1"
				variant={modules.length === 1 ? "surface" : "solid"}
			>
				x{currentCheckedModules.length}
				<OpenInNewWindowIcon />
			</Button>
			<ModuleSelectionDialog
				allModulesSelected={allModulesSelected}
				currentCheckedModules={currentCheckedModules}
				groupedModules={groupedModules}
				handleOptimizeClick={handleOptimizeWrapper}
				handleSelectAllChange={handleSelectAllChange}
				handleValueChange={handleValueChange}
				isIndeterminate={isIndeterminate}
				isOpen={isOpen}
				onClose={handleOnClose}
				tech={tech}
				techColor={techColor}
				techImage={techImage}
				translatedTechName={translatedTechName}
			/>
		</div>
	);

	return (
		<>
			{hasTechInGrid && (
				<BonusStatusIcon
					tech={tech}
					techMaxBonus={techMaxBonus}
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
			<div className="items-top optimizationButton mt-2 mb-2 ml-0 flex gap-2 sm:ml-1 lg:mr-1">
				<TechTreeRowActions />
				<TechTreeRowAvatar />

				<div className="grid flex-1 grid-cols-[1fr_auto] items-start gap-2">
					<div className="flex justify-start">
						<TechTreeRowLabel />
					</div>

					<div className="flex items-start justify-end gap-1">
						<TechTreeRowBadges />
					</div>
				</div>
			</div>
		</TechTreeRowProvider>
	);
});

TechTreeRow.displayName = "TechTreeRow";
