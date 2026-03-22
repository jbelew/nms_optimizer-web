import type { BonusStatusData } from "../../store/TechBonusStore";
import type React from "react";
import { useEffect } from "react";
import { Crosshair2Icon, ExclamationTriangleIcon, LightningBoltIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

import { useTechBonusStore } from "../../store/TechBonusStore";
import { ConditionalTooltip } from "../ConditionalTooltip/ConditionalTooltip";

/**
 * Rounds a numerical value to a fixed number of decimal places.
 *
 * @param {number} value - The number to round.
 * @param {number} decimals - The target decimal precision. **Must be a positive integer.**
 * @returns {number} The rounded number.
 * @example
 */
function round(value: number, decimals: number) {
	return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
}

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
 *
 * @param {number} techMaxBonus - The raw maximum bonus value.
 * @param {function(string): string} t - Translation function.
 * @returns {BonusStatusData} Metadata including icon type and tooltip text.
 * @example
 */
function computeBonusStatusData(techMaxBonus: number, t: (key: string) => string): BonusStatusData {
	const roundedMaxBonus = round(techMaxBonus, 2);

	if (roundedMaxBonus < 100) {
		const percent = Math.round((100 - roundedMaxBonus) * 100) / 100;

		return {
			icon: "warning",
			percent,
			iconClassName: "mt-2 inline-block cursor-pointer align-text-top",
			iconStyle: { color: "var(--red-a8)" },
			tooltipContent: `${t("techTree.tooltips.insufficientSpace")} -${percent}%`,
		};
	}

	if (roundedMaxBonus === 100) {
		return {
			icon: "check",
			percent: 0,
			iconClassName: "mt-[7px] inline-block cursor-pointer align-text-top",
			iconStyle: { color: "var(--gray-a10)" },
			tooltipContent: `${t("techTree.tooltips.validSolve")} `,
		};
	}

	// roundedMaxBonus > 100
	const percent = Math.round((roundedMaxBonus - 100) * 100) / 100;

	return {
		icon: "lightning",
		percent,
		iconClassName: "mt-1.5 inline-block h-4 w-4 cursor-pointer align-text-top",
		iconStyle: { color: "var(--amber-a8)" },
		tooltipContent: `${t("techTree.tooltips.boostedSolve")} +${percent}%`,
	};
}

/**
 * Renders the appropriate Radix icon component based on the status type.
 *
 * @param {string | null} iconType - The identifier for the icon (warning, check, lightning).
 * @param {string} className - CSS classes.
 * @param {React.CSSProperties} style - Inline styles.
 * @returns {React.ReactNode} The rendered icon component.
 * @example
 */
function renderIcon(
	iconType: string | null,
	className: string,
	style: React.CSSProperties
): React.ReactNode {
	switch (iconType) {
		case "warning":
			return <ExclamationTriangleIcon className={className} style={style} />;
		case "check":
			return <Crosshair2Icon className={className} style={style} />;
		case "lightning":
			return <LightningBoltIcon className={className} style={style} />;
		default:
			return null;
	}
}

/**
 * A component that displays a status icon representing the optimization quality of a technology.
 *
 * It compares the achieved bonus against the target to show:
 * - ⚠️ **Warning**: Sub-optimal layout (under 100%).
 * - 🎯 **Checkmark**: Optimal standard layout (exactly 100%).
 * - ⚡ **Lightning**: Supercharged layout (over 100%).
 *
 * Statuses are persisted in `TechBonusStore` to maintain visual state across sessions.
 *
 * @param {BonusStatusIconProps} props - Component properties.
 * @returns {JSX.Element | null} The status icon with tooltip, or `null` if no bonus exists.
 *
 * @example
 * <BonusStatusIcon tech="pulse" techMaxBonus={145} techSolvedBonus={145} />
 */
export const BonusStatusIcon: React.FC<BonusStatusIconProps> = ({
	tech,
	techMaxBonus,
	techSolvedBonus,
}) => {
	const { t } = useTranslation();
	const { setBonusStatus, getBonusStatus } = useTechBonusStore();
	const cachedBonusStatus = getBonusStatus(tech);

	// Use fresh computed data if available, otherwise fall back to cached data
	const contentData =
		techMaxBonus === 0 && cachedBonusStatus
			? cachedBonusStatus
			: computeBonusStatusData(techMaxBonus, t);

	// Persist the computed bonus status whenever it changes (only if actually changed and techSolvedBonus > 0)
	useEffect(() => {
		// Don't persist bonus data if there's no solved bonus
		if (techSolvedBonus <= 0) {
			return;
		}

		const cached = getBonusStatus(tech);
		// Only update if the data has actually changed
		const hasChanged =
			!cached ||
			cached.icon !== contentData.icon ||
			cached.percent !== contentData.percent ||
			cached.tooltipContent !== contentData.tooltipContent;

		if (hasChanged) {
			setBonusStatus(tech, contentData);
		}
	}, [tech, contentData, setBonusStatus, getBonusStatus, techSolvedBonus]);

	// Only hide if no cached data AND no current bonus
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
			type="button"
			className="flex cursor-pointer appearance-none border-none bg-transparent p-0"
			aria-label={contentData.tooltipContent}
		>
			{icon}
		</button>
	);

	return <ConditionalTooltip label={contentData.tooltipContent}>{trigger}</ConditionalTooltip>;
};
