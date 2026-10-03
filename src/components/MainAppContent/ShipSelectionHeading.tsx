import React, { Suspense } from "react";
import { Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import {
	ShipSelectionContent,
	ShipSelectionProvider,
	ShipSelectionRoot,
	ShipSelectionSkeleton,
	ShipSelectionTrigger,
} from "@/components/ShipSelection/ShipSelection";
import { useGridStore } from "@/store/grid/gridStore";

import { useMainAppGlobal, useMainAppLayout, useMainAppOptimization } from "./useMainAppContext";

/**
 * Set of platform types that do not have class ratings (e.g. Exocraft and Exosuits).
 */
const EXCLUDED_PLATFORM_TYPES = new Set([
	"colossus",
	"exosuit",
	"minotaur",
	"nautilon",
	"nomad",
	"pilgrim",
	"roamer",
]);

/**
 * Mapping of active supercharged slot count to class identifier.
 */
const CLASS_TIER_BY_SUPERCHARGED_COUNT: Record<number, string> = {
	1: "c",
	2: "b",
	3: "a",
	4: "s",
};

/**
 * A layout component that displays the current equipment platform, selection controls, and dynamic class icon.
 *
 * @remarks
 * Renders the platform trigger/dropdown and platform name, alongside a dynamic Class icon (C, B, A, S)
 * based on the active supercharged slot count in the grid. Excludes platform types without classes
 * (Exocraft and Exosuits).
 *
 * @returns {JSX.Element} The rendered equipment platform heading layout.
 *
 * @see {@link useMainAppGlobal}
 * @see {@link useGridStore}
 * @see {@link ./ShipSelectionHeading.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ShipSelectionHeading />
 * ```
 */
export const ShipSelectionHeading: React.FC = () => {
	const { t } = useTranslation();
	const { gridTableTotalWidth } = useMainAppLayout();
	const { isSharedGrid, selectedShipType } = useMainAppGlobal();
	const { solving } = useMainAppOptimization();
	const totalSuperchargedCells = useGridStore((state) => state.totalSuperchargedCells);

	const isClassEligible = !EXCLUDED_PLATFORM_TYPES.has(selectedShipType);
	const classKey = isClassEligible
		? CLASS_TIER_BY_SUPERCHARGED_COUNT[totalSuperchargedCells]
		: null;

	return (
		<Flex
			align="center"
			className="main-app__ship-selector heading-styled"
			gap="3"
			style={{
				maxWidth: gridTableTotalWidth ? `${gridTableTotalWidth}px` : undefined,
			}}
			wrap="wrap"
		>
			<span className="main-app__ship-selection">
				<Suspense fallback={<ShipSelectionSkeleton />}>
					<ShipSelectionProvider disabled={isSharedGrid} solving={solving}>
						<ShipSelectionRoot>
							<ShipSelectionTrigger />
							<ShipSelectionContent />
						</ShipSelectionRoot>
					</ShipSelectionProvider>
				</Suspense>
			</span>

			<Text
				className="main-app__ship-label"
				style={{ opacity: solving ? 0.365 : 1 }}
				trim="end"
			>
				{t("platformLabel")}
			</Text>
			<Text
				className="main-app__ship-name trim-text"
				style={{ opacity: solving ? 0.365 : 1 }}
				trim="end"
			>
				{t(`platforms.${selectedShipType}`)}
			</Text>
			{isClassEligible && (
				<span
					aria-hidden={!classKey}
					className="main-app__class-badge flex h-8 w-9 shrink-0 items-center justify-center sm:h-9 sm:w-10"
					data-testid="class-badge-container"
					style={{ alignSelf: "flex-end" }}
				>
					{classKey && (
						<img
							alt={t(`classes.${classKey}`, `Class ${classKey.toUpperCase()}`)}
							className="h-full w-auto object-contain"
							src={`/assets/img/class_icons/class-${classKey}.webp?v=${__APP_VERSION__}`}
							srcSet={`/assets/img/class_icons/class-${classKey}@2x.webp?v=${__APP_VERSION__} 2x`}
							style={{ opacity: solving ? 0.365 : 1 }}
						/>
					)}
				</span>
			)}
		</Flex>
	);
};
