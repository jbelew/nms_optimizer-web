import React from "react";
import { Crosshair2Icon, ExclamationTriangleIcon, LightningBoltIcon } from "@radix-ui/react-icons";
import { Popover, Text } from "@radix-ui/themes";
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
	if (techSolvedBonus <= 0) {
		return null;
	}

	const roundedMaxBonus = round(techMaxBonus, 2);

	if (roundedMaxBonus < 100) {
		return (
			<Popover.Root>
				<Popover.Trigger>
					<ExclamationTriangleIcon
						className="mt-[8px] inline-block cursor-pointer align-text-top"
						style={{ color: "var(--red-a8)" }}
					/>
				</Popover.Trigger>
				<Popover.Content size="1" maxWidth="300px">
					<Text as="p" trim="both" size="1">
						{t("techTree.tooltips.insufficientSpace") +
							" -" +
							Math.round((100 - roundedMaxBonus) * 100) / 100 +
							"%"}
					</Text>
				</Popover.Content>
			</Popover.Root>
		);
	}
	if (roundedMaxBonus === 100) {
		return (
			<Popover.Root>
				<Popover.Trigger>
					<Crosshair2Icon
						className="mt-[7px] inline-block cursor-pointer align-text-top"
						style={{ color: "var(--gray-a10)" }}
					/>
				</Popover.Trigger>
				<Popover.Content size="1" maxWidth="300px">
					<Text
						as="p"
						trim="both"
						size="1"
					>{`${t("techTree.tooltips.validSolve")} `}</Text>
				</Popover.Content>
			</Popover.Root>
		);
	}
	// roundedMaxBonus > 100
	return (
		<Popover.Root>
			<Popover.Trigger>
				<LightningBoltIcon
					className="mt-[6px] inline-block h-4 w-4 cursor-pointer align-text-top"
					style={{ color: "var(--amber-a8)" }}
				/>
			</Popover.Trigger>
			<Popover.Content size="1" maxWidth="300px">
				<Text as="p" trim="both" size="1">
					{`${t("techTree.tooltips.boostedSolve")} +${
						Math.round((roundedMaxBonus - 100) * 100) / 100
					}%`}
				</Text>
			</Popover.Content>
		</Popover.Root>
	);
};
