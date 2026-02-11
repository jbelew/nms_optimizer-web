import type { TechTreeRowProps } from "../TechTreeRow/TechTreeRow";
import React from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Avatar, Dialog, IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

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
 *
 * @param props - The props for the component.
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
			<Dialog.Title className="heading-styled flex items-start text-xl sm:text-2xl">
				<Avatar
					size="2"
					radius="full"
					alt={translatedTechName}
					fallback="IK"
					src={techImagePath}
					color={techColor}
					srcSet={`${techImagePath} 1x, ${techImagePath2x} 2x`}
				/>
				<span className="mt-0.5 mr-6 ml-2 text-xl sm:mt-0 sm:text-2xl">
					{t("moduleSelection.title", { techName: translatedTechName })}
				</span>
			</Dialog.Title>

			<Dialog.Close>
				<IconButton
					variant="soft"
					size="1"
					className="dialog-close"
					aria-label={t("moduleSelection.closeDialogLabel")}
				>
					<Cross2Icon />
				</IconButton>
			</Dialog.Close>
		</>
	);
};
