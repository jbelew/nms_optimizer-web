import type { GroupedShipType } from "./useShipSelectionContext";
import React, { useCallback, useMemo, useTransition } from "react";
import { Trans, useTranslation } from "react-i18next";

import { useRouteContext } from "@/context/RouteContext";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useFetchShipTypesSuspense } from "@/hooks/useShipTypes/useShipTypes";
import { useToast } from "@/hooks/useToast/useToast";
import { usePlatformStore } from "@/store/app/platformStore";
import { createGrid } from "@/store/grid/gridStore";
import { sessionCoordinator } from "@/store/sessionCoordinator";
import { Logger } from "@/utils/system/monitoring";

import { ShipSelectionContext } from "./useShipSelectionContext";

const DEFAULT_GRID_HEIGHT = 10;
const DEFAULT_GRID_WIDTH = 6;

/**
 * Provider for the ShipSelection component.
 *
 * @param {object} props - Component properties.
 * @param {React.ReactNode} props.children - Child elements.
 * @param {boolean} props.solving - True if an optimization is in progress.
 *
 * @returns {JSX.Element} The context provider.
 */
export const ShipSelectionProvider: React.FC<{
	children: React.ReactNode;
	solving: boolean;
}> = ({ children, solving }) => {
	const { t } = useTranslation();
	const shipTypes = useFetchShipTypesSuspense();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const setSelectedShipType = usePlatformStore((state) => state.setSelectedPlatform);
	const { sendDeferredEvent } = useAnalytics();
	const { showInfo } = useToast();
	const [isPending, startTransition] = useTransition();
	const { isKnownRoute } = useRouteContext();

	const shipTypeKeys = useMemo(() => Object.keys(shipTypes), [shipTypes]);

	const groupedShipTypes = useMemo(
		() =>
			Object.entries(shipTypes).reduce(
				(acc, [key, details]) => {
					const type = details.type;
					if (!acc[type]) acc[type] = [];
					acc[type].push({ details, key, label: t(`platforms.${key}`) });

					return acc;
				},
				{} as Record<string, GroupedShipType[]>
			),
		[shipTypes, t]
	);

	const handleOptionSelect = useCallback(
		(option: string) => {
			if (option !== usePlatformStore.getState().selectedPlatform) {
				Logger.info(`Platform selected: ${option}`, { platform: option });
				startTransition(() => {
					if (option === "corvette") {
						showInfo(
							t("shipSelection.corvetteWarning.title"),
							<Trans i18nKey="shipSelection.corvetteWarning.description" />
						);
					}

					setSelectedShipType(option, shipTypeKeys, true, isKnownRoute);
					const initialGrid = createGrid(DEFAULT_GRID_HEIGHT, DEFAULT_GRID_WIDTH);
					sessionCoordinator.switchPlatform(initialGrid);
				});

				sendDeferredEvent({
					action: "select_content",
					category: "ui",
					content_type: "platform",
					item_id: option,
					nonInteraction: false,
					value: 1,
				});
			}
		},
		[isKnownRoute, sendDeferredEvent, setSelectedShipType, shipTypeKeys, showInfo, t]
	);

	const value = useMemo(
		() => ({
			groupedShipTypes,
			handleOptionSelect,
			isPending: isPending || solving,
			selectedShipType,
		}),
		[groupedShipTypes, handleOptionSelect, isPending, solving, selectedShipType]
	);

	return <ShipSelectionContext.Provider value={value}>{children}</ShipSelectionContext.Provider>;
};
