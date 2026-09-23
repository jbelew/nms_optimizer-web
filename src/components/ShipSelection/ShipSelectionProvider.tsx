import type { GroupedShipType } from "./useShipSelectionContext";
import React, { useCallback, useMemo, useTransition } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

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
 * Props for the `ShipSelectionProvider` component.
 */
export interface ShipSelectionProviderProps {
	/** Child elements. */
	children: React.ReactNode;
	/** Whether the selector is disabled. */
	disabled?: boolean;
	/** Whether an optimization solve is currently active. */
	solving: boolean;
}

/**
 * Provider for the ShipSelection component.
 *
 * @param {ShipSelectionProviderProps} props - Component properties.
 *
 * @returns {JSX.Element} The context provider.
 */
export const ShipSelectionProvider: React.FC<ShipSelectionProviderProps> = ({
	children,
	disabled = false,
	solving,
}) => {
	const { t } = useTranslation();
	const shipTypes = useFetchShipTypesSuspense();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const setSelectedShipType = usePlatformStore((state) => state.setSelectedPlatform);
	const { sendDeferredEvent } = useAnalytics();
	const { showInfo } = useToast();
	const [isPending, startTransition] = useTransition();
	const { isKnownRoute } = useRouteContext();
	const navigate = useNavigate();

	const shipTypeKeys = Object.keys(shipTypes);

	const groupedShipTypes = useMemo(() => {
		return Object.entries(shipTypes).reduce(
			(acc, [key, details]) => {
				const type = details.type;
				if (!acc[type]) acc[type] = [];
				acc[type].push({ details, key, label: t(`platforms.${key}`) });

				return acc;
			},
			{} as Record<string, GroupedShipType[]>
		);
	}, [shipTypes, t]);

	const handleOptionSelect = useCallback(
		(option: string) => {
			if (option !== selectedShipType) {
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

				if (isKnownRoute) {
					const searchParams = new URLSearchParams(window.location.search);
					searchParams.set("platform", option);
					searchParams.delete("grid");
					const search = searchParams.toString();
					const hash = window.location.hash;
					navigate(`${window.location.pathname}${search ? `?${search}` : ""}${hash}`);
				}

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
		[
			selectedShipType,
			showInfo,
			t,
			setSelectedShipType,
			shipTypeKeys,
			isKnownRoute,
			navigate,
			sendDeferredEvent,
		]
	);

	const value = useMemo(
		() => ({
			disabled,
			groupedShipTypes,
			handleOptionSelect,
			isPending: isPending || solving,
			selectedShipType,
		}),
		[disabled, groupedShipTypes, handleOptionSelect, isPending, selectedShipType, solving]
	);

	return <ShipSelectionContext.Provider value={value}>{children}</ShipSelectionContext.Provider>;
};
