import type { TechTreeRowProps } from "../TechTreeRow/TechTreeRow";
import React from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Avatar, Dialog, IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

/** Path to the fallback technology icon. */
const fallbackImage = "/assets/img/grid/infra.webp";

/**
 * Props for the `DialogHeader` component.
 */
export interface DialogHeaderProps {
	/** Localized name of the technology. **Must be provided.** */
	translatedTechName: string;
	/** Icon filename for the technology. `null` to use fallback. */
	techImage: string | null;
	/** Theme color for the technology avatar. */
	techColor: TechTreeRowProps["techColor"];
}

/**
 * A header component for the module selection dialog.
 *
 * It displays the technology's avatar and localized title. It also provides
 * the primary close button for the dialog. It handles resolution-aware image
 * path generation for the technology icon.
 *
 * @param {DialogHeaderProps} props - Component properties.
 * @returns {JSX.Element} The rendered dialog header.
 *
 * @example
 * <DialogHeader translatedTechName="Hyperdrive" techImage="hyperdrive.webp" techColor="blue" />
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
