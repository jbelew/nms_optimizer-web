import React from "react";
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

	if (techSolvedBonus <= 0) {
		return null;
	}

	const roundedMaxBonus = round(techMaxBonus, 2);

	if (roundedMaxBonus < 100) {
		const icon = (
			<ExclamationTriangleIcon
				className="mt-2 inline-block cursor-pointer align-text-top"
				style={{ color: "var(--red-a8)" }}
			/>
		);
		const tooltipContent = (
			<>
				{t("techTree.tooltips.insufficientSpace") +
					" -" +
					Math.round((100 - roundedMaxBonus) * 100) / 100 +
					"%"}
			</>
		);

		if (isTouchDevice) {
			return (
				<Popover.Root>
					<Popover.Trigger>{icon}</Popover.Trigger>
					<Popover.Content size="1">
						<Text as="p" trim="both" size="1">
							{tooltipContent}
						</Text>
					</Popover.Content>
				</Popover.Root>
			);
		}
		return <Tooltip content={tooltipContent}>{icon}</Tooltip>;
	}
	if (roundedMaxBonus === 100) {
		const icon = (
			<Crosshair2Icon
				className="mt-[7px] inline-block cursor-pointer align-text-top"
				style={{ color: "var(--gray-a10)" }}
			/>
		);

		const tooltipContent = `${t("techTree.tooltips.validSolve")} `;

		if (isTouchDevice) {
			return (
				<Popover.Root>
					<Popover.Trigger>{icon}</Popover.Trigger>
					<Popover.Content size="1" maxWidth="300px">
						<Text as="p" trim="both" size="1">
							{tooltipContent}
						</Text>
					</Popover.Content>
				</Popover.Root>
			);
		}
		return <Tooltip content={tooltipContent}>{icon}</Tooltip>;
	}
	// roundedMaxBonus > 100
	const icon = (
		<LightningBoltIcon
			className="mt-1.5 inline-block h-4 w-4 cursor-pointer align-text-top"
			style={{ color: "var(--amber-a8)" }}
		/>
	);
	const tooltipContent = (
		<>
			{`${t("techTree.tooltips.boostedSolve")} +${
				Math.round((roundedMaxBonus - 100) * 100) / 100
			}%`}
		</>
	);

	if (isTouchDevice) {
		return (
			<Popover.Root>
				<Popover.Trigger>{icon}</Popover.Trigger>
				<Popover.Content size="1" maxWidth="300px">
					<Text as="p" trim="both" size="1">
						{tooltipContent}
					</Text>
				</Popover.Content>
			</Popover.Root>
		);
	}
	return <Tooltip content={tooltipContent}>{icon}</Tooltip>;
};
