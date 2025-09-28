import React from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Dialog, IconButton } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";
import type { TechTreeRowProps } from "../TechTreeRow/TechTreeRow";

const fallbackImage = "/assets/img/grid/infra.webp";

/**
 * Props for the DialogHeader component.
 */
export interface DialogHeaderProps {
	translatedTechName: string;
	techImage: string | null;
	techColor: TechTreeRowProps["techColor"];
}

/**
 * Renders the header of the module selection dialog.
 * @param {DialogHeaderProps} props - The props for the component.
 * @returns {JSX.Element} The rendered dialog header.
 */
export const DialogHeader: React.FC<DialogHeaderProps> = ({
	translatedTechName,
	techImage,
	techColor,
}) => {
	const { t } = useTranslation();

	const techImagePath = techImage ? `/assets/img/tech/${techImage}` : fallbackImage;
	const techImagePath2x = techImage
		? `/assets/img/tech/${techImage.replace(/\.(webp|png|jpg|jpeg)$/, "@2x.$1")}`
		: fallbackImage.replace(/\.(webp|png|jpg|jpeg)$/, "@2x.$1");

	return (
		<>
			<Dialog.Title className="heading__styled flex items-start text-xl sm:text-2xl">
				<Avatar
					size="2"
					radius="full"
					alt={translatedTechName}
					fallback="IK"
					src={techImagePath}
					color={techColor}
					srcSet={`${techImagePath} 1x, ${techImagePath2x} 2x`}
				/>
				<span className="mt-[2px] ml-2 text-xl sm:mt-[0px] sm:text-2xl">
					{t("moduleSelection.title", { techName: translatedTechName })}
				</span>
			</Dialog.Title>

			<Dialog.Close>
				<IconButton
					variant="soft"
					size="1"
					className="appDialog__close"
					aria-label={t("moduleSelection.closeDialogLabel")}
				>
					<Cross2Icon />
				</IconButton>
			</Dialog.Close>
		</>
	);
};