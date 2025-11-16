import React, { useMemo } from "react";
import { Crosshair2Icon, ExclamationTriangleIcon, LightningBoltIcon } from "@radix-ui/react-icons";
import { Popover, Text, Tooltip } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

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
 * @property {number} techMaxBonus - The maximum potential bonus for the technology.
 * @property {number} techSolvedBonus - The bonus achieved from the current solved state for the technology.
 */
interface BonusStatusIconProps {
	techMaxBonus: number;
	techSolvedBonus: number;
}

/**
 * Displays an icon indicating the status of the technology's bonus based on solved and max values.
 *
 * @param {BonusStatusIconProps} props - The props for the component.
 * @returns {JSX.Element|null} The rendered icon or null.
 */
export const BonusStatusIcon: React.FC<BonusStatusIconProps> = ({
	techMaxBonus,
	techSolvedBonus,
}) => {
	const { t } = useTranslation();
	const [isTouchDevice, setIsTouchDevice] = React.useState(false);

	React.useEffect(() => {
		const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
		setIsTouchDevice(touch);
	}, []);

	const roundedMaxBonus = round(techMaxBonus, 2);

	const contentData = useMemo(() => {
		if (roundedMaxBonus < 100) {
			const percent = Math.round((100 - roundedMaxBonus) * 100) / 100;
			return {
				icon: ExclamationTriangleIcon,
				iconClassName: "mt-2 inline-block cursor-pointer align-text-top",
				iconStyle: { color: "var(--red-a8)" },
				tooltipContent: `${t("techTree.tooltips.insufficientSpace")} -${percent}%`,
				popoverMaxWidth: undefined,
			};
		}
		if (roundedMaxBonus === 100) {
			return {
				icon: Crosshair2Icon,
				iconClassName: "mt-[7px] inline-block cursor-pointer align-text-top",
				iconStyle: { color: "var(--gray-a10)" },
				tooltipContent: `${t("techTree.tooltips.validSolve")} `,
				popoverMaxWidth: "300px",
			};
		}
		// roundedMaxBonus > 100
		const percent = Math.round((roundedMaxBonus - 100) * 100) / 100;
		return {
			icon: LightningBoltIcon,
			iconClassName: "mt-1.5 inline-block h-4 w-4 cursor-pointer align-text-top",
			iconStyle: { color: "var(--amber-a8)" },
			tooltipContent: `${t("techTree.tooltips.boostedSolve")} +${percent}%`,
			popoverMaxWidth: "300px",
		};
	}, [roundedMaxBonus, t]);

	if (techSolvedBonus <= 0) {
		return null;
	}

	const IconComponent = contentData.icon;

	const icon = (
		<IconComponent className={contentData.iconClassName} style={contentData.iconStyle} />
	);

	if (isTouchDevice) {
		return (
			<Popover.Root>
				<Popover.Trigger>{icon}</Popover.Trigger>
				<Popover.Content size="1" maxWidth={contentData.popoverMaxWidth}>
					<Text as="p" trim="both" size="1">
						{contentData.tooltipContent}
					</Text>
				</Popover.Content>
			</Popover.Root>
		);
	}
	return <Tooltip content={contentData.tooltipContent}>{icon}</Tooltip>;
};
