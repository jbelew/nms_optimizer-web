import "./ShipSelection.scss";

import React, { Suspense, useCallback, useMemo, useTransition } from "react";
import { GearIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu, IconButton, Separator, Spinner } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import type { PlatformDetail } from "@/store/app/platformStore";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useToast } from "@/hooks/useToast/useToast";
import { usePlatformsSuspense, usePlatformStore } from "@/store/app/platformStore";
import { sessionCoordinator } from "@/store/sessionCoordinator";
import { Logger } from "@/utils/system/monitoring";

/**
 * Props for the {@link ShipSelection} component.
 */
export interface ShipSelectionProps {
	/**
	 * Whether the selector is disabled (e.g., when viewing a Shared Grid).
	 *
	 * @default false
	 */
	disabled?: boolean;
	/** Whether an optimization solve is currently active. */
	solving: boolean;
}

/**
 * Details for a grouped Platform Type entry within the dropdown menu.
 */
interface GroupedPlatformType {
	details: PlatformDetail;
	key: string;
	label: string;
}

/**
 * Skeleton placeholder that mimics the `ShipSelection` trigger button while platform definitions suspend.
 */
const ShipSelectionSkeleton: React.FC = () => {
	const { t } = useTranslation();
	const isSmallAndUp = useBreakpoint("640px");

	return isSmallAndUp ?
			<Button
				aria-label={t("shipSelection.ariaLabel") ?? ""}
				className="p-2!"
				disabled
				size="2"
				variant="soft"
			>
				<Spinner size="3" />
				<Separator
					color="gray"
					decorative
					orientation="vertical"
				/>
				<DropdownMenu.TriggerIcon />
			</Button>
		:	<IconButton
				aria-label={t("shipSelection.ariaLabel") ?? ""}
				className="mt-1!"
				disabled
				size="2"
				variant="soft"
			>
				<Spinner size="3" />
			</IconButton>;
};

/**
 * Internal Suspense-enabled dropdown menu for selecting the active Platform Type.
 */
const ShipSelectionMenu: React.FC<ShipSelectionProps> = ({ disabled = false, solving }) => {
	const { t } = useTranslation();
	const { showInfo } = useToast();
	const platformCatalog = usePlatformsSuspense();
	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform);
	const { sendDeferredEvent } = useAnalytics();
	const [isPending, startTransition] = useTransition();
	const navigate = useNavigate();

	const groupedPlatformTypes = useMemo(() => {
		return Object.entries(platformCatalog).reduce<Record<string, GroupedPlatformType[]>>(
			(acc, [key, details]) => {
				const type = details.type;
				if (!acc[type]) acc[type] = [];
				acc[type].push({ details, key, label: t(`platforms.${key}`) });

				return acc;
			},
			{},
		);
	}, [platformCatalog, t]);

	const handleOptionSelect = useCallback(
		(option: string) => {
			if (option !== selectedPlatform) {
				Logger.info(`Platform selected: ${option}`, { platform: option });
				startTransition(() => {
					if (option === "corvette") {
						showInfo(
							t("shipSelection.corvetteWarning.title"),
							<Trans i18nKey="shipSelection.corvetteWarning.description" />,
						);
					}

					sessionCoordinator.switchPlatform(option);
				});

				const searchParams = new URLSearchParams(window.location.search);
				searchParams.set("platform", option);
				searchParams.delete("grid");
				const search = searchParams.toString();
				const hash = window.location.hash;
				navigate(`${window.location.pathname}${search ? `?${search}` : ""}${hash}`);

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
		[selectedPlatform, showInfo, t, navigate, sendDeferredEvent],
	);

	const isDisabled = disabled || isPending || solving;

	return (
		<DropdownMenu.Root modal={false}>
			<DropdownMenu.Trigger disabled={isDisabled}>
				<Button
					aria-label={t("shipSelection.ariaLabel") ?? ""}
					className="p-2!"
					size="2"
					variant="soft"
				>
					<GearIcon className="h-4 w-4 sm:h-5 sm:w-5" />
					<Separator
						color={isDisabled ? "gray" : "cyan"}
						decorative
						orientation="vertical"
					/>
					<DropdownMenu.TriggerIcon />
				</Button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Content className="ShipSelection__dropdownMenu">
				<DropdownMenu.Label className="ShipSelection__header heading-styled">
					{t("shipSelection.selectPlatform", "Select Platform")}
				</DropdownMenu.Label>
				<DropdownMenu.RadioGroup
					onValueChange={handleOptionSelect}
					value={selectedPlatform}
				>
					{Object.entries(groupedPlatformTypes).map(([type, items], groupIndex) => (
						<React.Fragment key={type}>
							{groupIndex > 0 && <DropdownMenu.Separator />}
							{items.map(({ key, label }) => (
								<DropdownMenu.RadioItem
									className="font-medium"
									key={key}
									value={key}
								>
									{label}
								</DropdownMenu.RadioItem>
							))}
						</React.Fragment>
					))}
				</DropdownMenu.RadioGroup>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	);
};

/**
 * Dropdown control for selecting the active Platform Type (Starship, Multi-Tool, Exosuit, Freighter, Corvette, etc.).
 *
 * @remarks
 * Self-contained Platform Type selector that suspends while platform definitions load, renders grouped
 * radio options, coordinates platform switching via {@link sessionCoordinator.switchPlatform}, updates
 * URL query parameters, and emits analytics telemetry.
 *
 * @param props - Component properties.
 *
 * @returns The rendered platform selection dropdown wrapped in Suspense.
 *
 * @see {@link sessionCoordinator}
 * @see {@link usePlatformStore}
 * @see {@link ./ShipSelection.test.tsx Unit Tests}
 * @see {@link ./ShipSelection.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ShipSelection disabled={false} solving={false} />
 * // renders platform selection dropdown menu
 * ```
 */
export const ShipSelection: React.FC<ShipSelectionProps> = ({ disabled = false, solving }) => {
	return (
		<Suspense fallback={<ShipSelectionSkeleton />}>
			<ShipSelectionMenu
				disabled={disabled}
				solving={solving}
			/>
		</Suspense>
	);
};
