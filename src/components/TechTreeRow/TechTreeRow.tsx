// src/components/TechTreeRow/TechTreeRow.tsx
import "./TechTreeRow.css";

import {
	ChevronDownIcon,
	Crosshair2Icon,
	DoubleArrowLeftIcon,
	ExclamationTriangleIcon,
	LightningBoltIcon,
	ResetIcon,
	UpdateIcon,
} from "@radix-ui/react-icons";
import { Avatar, Badge, Checkbox, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { Accordion } from "radix-ui";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useGridStore } from "../../store/GridStore";
import { useShakeStore } from "../../store/ShakeStore";
import { useTechStore } from "../../store/TechStore";

/**
 * Props for the TechTreeRow component.
 */
export interface TechTreeRowProps {
	/** The unique identifier for the technology. */
	tech: string;
	/** Async function to handle the optimization process for a given technology. */
	handleOptimize: (tech: string) => Promise<void>;
	/** Boolean indicating if an optimization process is currently active. */
	solving: boolean;
	/** The filename of the image representing the technology (e.g., "hyperdrive.webp"). Null if no specific image. */
	techImage: string | null;
	/** Function to check if the grid is full. */
	isGridFull: boolean;
	/** Boolean indicating if there are any reward modules. */
	hasRewardModules: boolean;
	/** Filtered array of reward modules. */
	rewardModules: { label: string; id: string; image: string; type?: string }[];
	/** The currently selected ship type. */
	selectedShipType: string;
	/** The count of modules for the technology. */
	moduleCount: number;
	/** The color associated with the technology. */
	techColor:
		| "gray"
		| "gold"
		| "bronze"
		| "brown"
		| "yellow"
		| "amber"
		| "orange"
		| "tomato"
		| "red"
		| "ruby"
		| "crimson"
		| "pink"
		| "plum"
		| "purple"
		| "violet"
		| "iris"
		| "indigo"
		| "blue"
		| "cyan"
		| "teal"
		| "jade"
		| "green"
		| "grass"
		| "lime"
		| "mint"
		| "sky";
}

function round(value: number, decimals: number) {
	return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
}

/**
 * A forwardRef-wrapped Accordion.Trigger component to be used within the TechTreeRow.
 * This is defined outside the main component to prevent re-creation on every render of TechTreeRow.
 */
const AccordionTrigger = React.forwardRef(
	(
		{ children, className, ...props }: { children: React.ReactNode; className?: string },
		forwardedRef: React.Ref<HTMLButtonElement>
	) => (
		<Accordion.Header className="AccordionHeader">
			<Accordion.Trigger
				className={`AccordionTrigger ${className || ""}`}
				{...props}
				ref={forwardedRef}
			>
				{children}
				<ChevronDownIcon className="AccordionChevron" aria-hidden />
			</Accordion.Trigger>
		</Accordion.Header>
	)
);
AccordionTrigger.displayName = "AccordionTrigger";

/**
 * Props for the BonusStatusIcon component.
 */
interface BonusStatusIconProps {
	/** The maximum potential bonus for the technology. */
	techMaxBonus: number;
	/** The bonus achieved from the current solved state for the technology. */
	techSolvedBonus: number;
}

/**
 * Displays an icon indicating the status of the technology's bonus based on solved and max values.
 */
const BonusStatusIcon: React.FC<BonusStatusIconProps> = ({ techMaxBonus, techSolvedBonus }) => {
	const { t } = useTranslation();
	if (techSolvedBonus <= 0) {
		return null;
	}

	const roundedMaxBonus = round(techMaxBonus, 2);

	if (roundedMaxBonus < 100) {
		return (
			<Tooltip content={t("techTree.tooltips.insufficientSpace")}>
				<ExclamationTriangleIcon
					className="inline-block w-5 h-5 ml-1 align-text-bottom"
					style={{ color: "var(--red-a8)" }}
				/>
			</Tooltip>
		);
	}
	if (roundedMaxBonus === 100) {
		return (
			<Tooltip content={t("techTree.tooltips.validSolve")}>
				<Crosshair2Icon
					className="inline-block w-5 h-5 ml-1 align-text-bottom"
					style={{ color: "var(--gray-a10)" }}
				/>
			</Tooltip>
		);
	}
	// roundedMaxBonus > 100
	return (
		<Tooltip content={t("techTree.tooltips.boostedSolve")}>
			<LightningBoltIcon
				className="inline-block w-5 h-5 ml-1 align-text-bottom"
				style={{ color: "var(--amber-a8)" }}
			/>
		</Tooltip>
	);
};

/**
 * Renders a single row in the technology tree, allowing users to optimize, reset, and view module details.
 */
const TechTreeRowComponent: React.FC<TechTreeRowProps> = ({
	tech,
	handleOptimize,
	solving,
	techImage,
	isGridFull,
	hasRewardModules,
	rewardModules,
	moduleCount,
	techColor,
}) => {
	const { t } = useTranslation();
	const hasTechInGrid = useGridStore((state) => state.hasTechInGrid(tech));
	const handleResetGridTech = useGridStore((state) => state.resetGridTech);
	const {
		max_bonus,
		clearTechMaxBonus,
		solved_bonus,
		clearTechSolvedBonus,
		checkedModules,
		setCheckedModules,
		clearCheckedModules,
	} = useTechStore();
	const techMaxBonus = max_bonus?.[tech] ?? 0;
	const techSolvedBonus = solved_bonus?.[tech] ?? 0;

	// Use techImage to build a more descriptive translation key, falling back to the tech key if image is not available.
	const translationKeyPart = techImage ? techImage.replace(/\.\w+$/, "").replace(/\//g, ".") : tech;
	const translatedTechName = t(`technologies.${translationKeyPart}`);

	let tooltipLabel: string;

	if (isGridFull && !hasTechInGrid) {
		tooltipLabel = t("techTree.tooltips.gridFull");
	} else {
		tooltipLabel = hasTechInGrid ? t("techTree.tooltips.update") : t("techTree.tooltips.solve");
	}
	const OptimizeIconComponent = hasTechInGrid ? UpdateIcon : DoubleArrowLeftIcon;
	const { setShaking } = useShakeStore();

	useEffect(() => {
		return () => {
			clearCheckedModules(tech);
		};
	}, [tech, clearCheckedModules]);

	const isOptimizeButtonDisabled = (isGridFull && !hasTechInGrid) || solving;

	const handleReset = () => {
		handleResetGridTech(tech);
		clearTechMaxBonus(tech);
		clearTechSolvedBonus(tech);
	};

	const handleCheckboxChange = (moduleId: string) => {
		setCheckedModules(tech, (prevChecked = []) => {
			const isChecked = prevChecked.includes(moduleId);
			return isChecked ? prevChecked.filter((id) => id !== moduleId) : [...prevChecked, moduleId];
		});
	};

	const handleOptimizeClick = async () => {
		if (isGridFull && !hasTechInGrid) {
			setShaking(true); // Trigger the shake
			setTimeout(() => {
				// TODO: Consider making this a configurable constant or part of the shake store
				setShaking(false); // Stop the shake after a delay
			}, 500); // Adjust the duration as needed
		} else {
			handleResetGridTech(tech);
			clearTechMaxBonus(tech);
			clearTechSolvedBonus(tech);
			await handleOptimize(tech);
		}
	};

	const currentCheckedModules = checkedModules[tech] || [];

	const baseImagePath = "/assets/img/tech/";
	const fallbackImage = `${baseImagePath}infra.webp`;
	const imagePath = techImage ? `${baseImagePath}${techImage}` : fallbackImage;
	const imagePath2x = techImage
		? `${baseImagePath}${techImage.replace(/\.(webp|png|jpg|jpeg)$/, "@2x.$1")}`
		: fallbackImage.replace(/\.(webp|png|jpg|jpeg)$/, "@2x.$1"); // Also handle fallback

	return (
		<div className="flex gap-2 mt-2 mb-2 ml-0 sm:ml-1 items-top optimizationButton">
			{/* Optimize Button */}
			<Tooltip delayDuration={1000} content={tooltipLabel}>
				<IconButton
					onClick={() => {
						void handleOptimizeClick();
					}}
					disabled={isOptimizeButtonDisabled}
					aria-label={`${tooltipLabel} ${translatedTechName}`}
					id={tech}
					className={`techRow__resetButton !shadow-sm ${!isOptimizeButtonDisabled ? "!cursor-pointer" : ""}`.trim()}
				>
					<OptimizeIconComponent />
				</IconButton>
			</Tooltip>

			{/* Reset Button */}
			<Tooltip delayDuration={1000} content={t("techTree.tooltips.reset")}>
				<IconButton
					onClick={handleReset}
					disabled={!hasTechInGrid || solving}
					aria-label={`${t("techTree.tooltips.reset")} ${translatedTechName}`}
					className={`techRow__resetButton !shadow-sm ${hasTechInGrid && !solving ? "!cursor-pointer" : ""}`.trim()}
				>
					<ResetIcon />
				</IconButton>
			</Tooltip>

			{/* Avatar with srcSet */}
			<Avatar
				size="2"
				radius="full"
				alt={translatedTechName}
				fallback="IK"
				src={imagePath}
				color={techColor}
				srcSet={`${imagePath} 1x, ${imagePath2x} 2x`}
			/>
			{hasRewardModules ? (
				<Accordion.Root
					className="flex-1 pt-1 pb-1 text-sm font-medium sm:text-base border-b-1 AccordionRoot"
					style={{ borderColor: "var(--accent-track)" }}
					type="single"
					collapsible
				>
					<Accordion.Item className="AccordionItem" value="item-1">
						<AccordionTrigger>
							<Text className="techRow__label">
								{translatedTechName}
								<Badge
									ml="1"
									className="align-top"
									variant="soft"
									radius="medium"
									color={techColor}
								>
									{moduleCount + currentCheckedModules.length}
								</Badge>
								<BonusStatusIcon techMaxBonus={techMaxBonus} techSolvedBonus={techSolvedBonus} />
							</Text>
						</AccordionTrigger>
						<Accordion.Content className="pl-1 AccordionContent">
							{rewardModules.map((module) => (
								<div key={module.id} className="flex items-start gap-2 AccordionContentText">
									<Checkbox
										className="!pt-1 ml-1 CheckboxRoot"
										variant="soft"
										id={module.id}
										checked={currentCheckedModules.includes(module.id)}
										onClick={() => handleCheckboxChange(module.id)}
									/>
									<label className="Label" htmlFor={module.id}>
										{t(`modules.${module.id}`, { defaultValue: module.label })}
									</label>
								</div>
							))}
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
			) : (
				<Text
					as="label"
					htmlFor={tech}
					className="flex-1 block pt-1 text-sm font-medium sm:text-base techRow__label"
				>
					{translatedTechName}
					<Badge ml="1" className="align-top" variant="soft" radius="medium" color={techColor}>
						{moduleCount + currentCheckedModules.length}
					</Badge>
					<BonusStatusIcon techMaxBonus={techMaxBonus} techSolvedBonus={techSolvedBonus} />
				</Text>
			)}
		</div>
	);
};

/**
 * Memoized version of TechTreeRowComponent to prevent unnecessary re-renders.
 */
export const TechTreeRow = React.memo(TechTreeRowComponent);
