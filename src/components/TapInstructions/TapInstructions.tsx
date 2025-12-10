import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Callout } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useDialog } from "../../context/dialog-utils";
import { useGridStore } from "../../store/GridStore";
import { isTouchDevice } from "../../utils/isTouchDevice";

/**
 * TapInstructions component displays a callout with instructions for touch device users.
 * Only shown on touch devices when the tutorial hasn't been finished and supercharged is not fixed.
 *
 * @returns {JSX.Element | null} The tap instructions callout or null if conditions aren't met
 */
export const TapInstructions: React.FC = () => {
	const { t } = useTranslation();
	const { tutorialFinished } = useDialog();
	const superchargedFixed = useGridStore((state) => state.superchargedFixed);
	const isTouch = isTouchDevice();

	// Don't show if not touch device, tutorial is finished, or supercharged is fixed
	if (!isTouch || tutorialFinished || superchargedFixed) {
		return null;
	}

	return (
		<Callout.Root color="gray" variant="surface" size="1">
			<Callout.Icon>
				<InfoCircledIcon />
			</Callout.Icon>
			<Callout.Text>
				<span className="text-sm sm:text-base">{t("gridTable.tapInstructions")}</span>
			</Callout.Text>
		</Callout.Root>
	);
};
