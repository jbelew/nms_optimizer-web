import React, { useEffect, useRef } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import {
	Avatar,
	Button,
	Checkbox,
	CheckboxGroup,
	Dialog,
	IconButton,
	Separator,
	Text,
} from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { usePlatformStore } from "../../store/PlatformStore";
import { TechTreeRowProps } from "./TechTreeRow";

const groupOrder = ["core", "bonus", "upgrade", "reactor", "cosmetic"];
const baseImagePath = "/assets/img/grid/";
const fallbackImage = `${baseImagePath}infra.webp`;

interface ModuleSelectionDialogProps {
	translatedTechName: string;
	groupedModules: {
		[key: string]: {
			label: string;
			id: string;
			image: string;
			type?: string;
		}[];
	};
	currentCheckedModules: string[];
	handleValueChange: (newValues: string[]) => void;
	handleSelectAllChange: (checked: boolean | "indeterminate") => void;
	handleOptimizeClick: () => Promise<void>;
	allModulesSelected: boolean;
	isIndeterminate: boolean;
	techColor: TechTreeRowProps["techColor"];
	techImage: string | null;
}

/**
 * Renders the content of the module selection dialog.
 * This component is responsible for displaying the list of available modules,
 * allowing the user to select them, and triggering the optimization.
 *
 * @param props - The props for the component, containing module data and handlers.
 * @returns The rendered dialog content.
 */
export const ModuleSelectionDialog: React.FC<ModuleSelectionDialogProps> = ({
	translatedTechName,
	groupedModules,
	currentCheckedModules,
	handleValueChange,
	handleSelectAllChange,
	handleOptimizeClick,
	allModulesSelected,
	isIndeterminate,
	techColor,
	techImage,
}) => {
	const { t } = useTranslation();
	const selectAllCheckboxRef = useRef<HTMLButtonElement>(null);
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const isCorvette = selectedShipType === "corvette";

	const techImagePath = techImage ? `/assets/img/tech/${techImage}` : fallbackImage;
	const techImagePath2x = techImage
		? `/assets/img/tech/${techImage.replace(/\.(webp|png|jpg|jpeg)$/, "@2x.$1")}`
		: fallbackImage.replace(/\.(webp|png|jpg|jpeg)$/, "@2x.$1");

	useEffect(() => {
		if (selectAllCheckboxRef.current) {
			const inputElement =
				selectAllCheckboxRef.current.querySelector('input[type="checkbox"]');
			if (inputElement instanceof HTMLInputElement) {
				inputElement.indeterminate = isIndeterminate;
			}
		}
	}, [isIndeterminate]);

	return (
		<Dialog.Content size="2">
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
			<Dialog.Description>
				{isCorvette && (
					<Text
						className="text-sm sm:text-base"
						as="p"
						mb="3"
						dangerouslySetInnerHTML={{ __html: t("moduleSelection.warning") }}
					/>
				)}
				<Checkbox
					ref={selectAllCheckboxRef}
					checked={allModulesSelected}
					onCheckedChange={handleSelectAllChange}
				/>
				<Text ml="2" className="text-sm font-medium sm:text-base">
					{t("moduleSelection.selectAll")}
				</Text>
				<Separator className="mt-2 mb-4" size="4" />
			</Dialog.Description>
			<div className="flex flex-col gap-2">
				{!isCorvette && groupedModules["core"].length > 0 && (
					<div key="core">
						<div
							className="mb-2 font-bold capitalize"
							style={{ color: "var(--accent-a11)" }}
						>
							{t(`moduleSelection.core`)}
						</div>
						{groupedModules["core"].map((module) => {
							const imagePath = module.image
								? `${baseImagePath}${module.image}`
								: fallbackImage;
							return (
								<div
									key={module.id}
									className="mb-2 flex items-center gap-2 font-medium"
								>
									<Checkbox checked={true} disabled={true} />
									<Avatar
										size="1"
										radius="full"
										alt={module.label}
										fallback="IK"
										src={imagePath}
										color={techColor}
									/>
									{module.label}
								</div>
							);
						})}
					</div>
				)}
				<CheckboxGroup.Root value={currentCheckedModules} onValueChange={handleValueChange}>
					{(isCorvette ? groupOrder : groupOrder.filter((g) => g !== "core")).map(
						(groupName) =>
							groupedModules[groupName].length > 0 && (
								<div key={groupName}>
									<div
										className="mb-2 font-bold capitalize"
										style={{ color: "var(--accent-a11)" }}
									>
										{t(`moduleSelection.${groupName}`)}
									</div>
									{(groupName === "bonus"
										? [...groupedModules[groupName]].sort((a, b) =>
												a.label.localeCompare(b.label)
											)
										: groupedModules[groupName]
									).map((module) => {
										const imagePath = module.image
											? `${baseImagePath}${module.image}`
											: fallbackImage;
										let isDisabled = false;
										if (
											["upgrade", "cosmetic", "reactor"].includes(groupName)
										) {
											const label = module.label;
											const order = ["Theta", "Tau", "Sigma"];
											let rankIndex = -1;
											if (label.includes("Theta")) rankIndex = 0;
											else if (label.includes("Tau")) rankIndex = 1;
											else if (label.includes("Sigma")) rankIndex = 2;

											if (rankIndex > 0) {
												const prerequisiteRank = order[rankIndex - 1];
												const prerequisiteModule = groupedModules[
													groupName
												].find((m) => m.label.includes(prerequisiteRank));
												if (
													prerequisiteModule &&
													!currentCheckedModules.includes(
														prerequisiteModule.id
													)
												) {
													isDisabled = true;
												}
											}
										}
										return (
											<label
												key={module.id}
												className="mb-2 flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:text-[var(--accent-a12)] sm:text-base"
												style={{ cursor: "pointer" }}
											>
												<CheckboxGroup.Item
													value={module.id}
													disabled={isDisabled}
												/>
												<Avatar
													size="1"
													radius="full"
													alt={module.label}
													fallback={module.id}
													src={imagePath}
													color={techColor}
												/>
												{module.label}
											</label>
										);
									})}
								</div>
							)
					)}
				</CheckboxGroup.Root>
				{groupedModules["cosmetic"]?.length > 0 && (
					<Text
						className="text-sm sm:text-base"
						as="p"
						mb="2"
						dangerouslySetInnerHTML={{
							__html: t("moduleSelection.cosmeticInfo"),
						}}
					/>
				)}
			</div>
			<div className="flex justify-end">
				<Dialog.Close>
					<Button onClick={handleOptimizeClick}>
						{t("moduleSelection.optimizeButton")}
					</Button>
				</Dialog.Close>
			</div>
		</Dialog.Content>
	);
};
