/**
 * Interactive helper instructions module for touch users.
 *
 * @remarks
 * This module provides the `TapInstructions` component, which surfaces
 * device-specific usage tips to help touch-screen users navigate the grid.
 *
 * @see {@link TapInstructions}
 *
 * @category Components
 */

import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Callout } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useGridStore } from "../../store/grid/gridStore";
import { isTouchDevice } from "../../utils/browser/environment";
import { useDialog } from "../../utils/system/dialogUtils";

/**
 * A contextual help component that displays interaction instructions for touch-enabled devices.
 *
 * @remarks
 * It appears as a Radix UI `Callout` and informs the user about how to toggle
 * active and supercharged states on the grid. It is conditionally rendered based
 * on device type and user tutorial progress.
 *
 * @returns {JSX.Element | null} The rendered instructions callout, or `null` if hidden.
 *
 * @see {@link isTouchDevice}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <TapInstructions />
 * // renders callout if touch device and tutorial not finished
 * ```
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
		<Callout.Root variant="surface" size="1">
			<Callout.Icon>
				<InfoCircledIcon />
			</Callout.Icon>
			<Callout.Text style={{ color: "var(--gray-12)" }}>
				<span className="text-sm sm:text-base">{t("gridTable.tapInstructions")}</span>
			</Callout.Text>
		</Callout.Root>
	);
};
