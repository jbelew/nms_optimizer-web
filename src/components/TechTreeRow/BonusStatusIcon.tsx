import type { BonusStatusData } from "../../store/TechBonusStore";
import type React from "react";
import { useEffect, useMemo } from "react";
import { Crosshair2Icon, ExclamationTriangleIcon, LightningBoltIcon } from "@radix-ui/react-icons";
import { Popover, Text, Tooltip } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useTechBonusStore } from "../../store/TechBonusStore";
import { isTouchDevice } from "../../utils/isTouchDevice";

/**
 * Rounds a number to a specified number of decimal places.
 * @param {number} value - The number to round.
 * @param {number} decimals - The number of decimal places.
 * @returns {number} The rounded number.
 */
function round(value: number, decimals: number) {
	return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
}

/**
 * @interface BonusStatusIconProps
 * @property {string} tech - The technology identifier.
 * @property {number} techMaxBonus - The maximum potential bonus for the technology.
 * @property {number} techSolvedBonus - The bonus achieved from the current solved state for the technology.
 */
interface BonusStatusIconProps {
	tech: string;
	techMaxBonus: number;
	techSolvedBonus: number;
}

/**
 * Computes the bonus status data from raw bonus values.
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
 * Renders the icon based on the icon type.
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
 * Displays an icon indicating the status of the technology's bonus based on solved and max values.
 *
 * @param {BonusStatusIconProps} props - The props for the component.
 * @returns {JSX.Element|null} The rendered icon or null.
 */
export const BonusStatusIcon: React.FC<BonusStatusIconProps> = ({
	tech,
	techMaxBonus,
	techSolvedBonus,
}) => {
	const { t } = useTranslation();
	const isTouch = isTouchDevice();
	const { setBonusStatus, getBonusStatus } = useTechBonusStore();
	const cachedBonusStatus = getBonusStatus(tech);

	// Use fresh computed data if available, otherwise fall back to cached data
	const contentData = useMemo(() => {
		// If techMaxBonus is 0, use cached data if available
		if (techMaxBonus === 0 && cachedBonusStatus) {
			return cachedBonusStatus;
		}
		return computeBonusStatusData(techMaxBonus, t);
	}, [techMaxBonus, t, cachedBonusStatus]);

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

	const icon = renderIcon(contentData.icon, contentData.iconClassName, contentData.iconStyle);
	if (!icon) {
		return null;
	}

	if (isTouch) {
		return (
			<Popover.Root>
				<Popover.Trigger>{icon}</Popover.Trigger>
				<Popover.Content size="1">
					<Text as="p" trim="both" size="1">
						{contentData.tooltipContent}
					</Text>
				</Popover.Content>
			</Popover.Root>
		);
	}
	return <Tooltip content={contentData.tooltipContent}>{icon}</Tooltip>;
};
