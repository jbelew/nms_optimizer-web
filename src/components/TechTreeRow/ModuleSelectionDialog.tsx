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
} from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

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
}) => {
	const { t } = useTranslation();
	const selectAllCheckboxRef = useRef<HTMLButtonElement>(null);

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
		<Dialog.Content maxWidth="400px">
			<Dialog.Title className="heading__styled text-xl sm:text-2xl">
				{translatedTechName} SELECTION
			</Dialog.Title>

			<Dialog.Close>
				<IconButton
					variant="soft"
					size="1"
					className="appDialog__close"
					aria-label="Close dialog"
				>
					<Cross2Icon />
				</IconButton>
			</Dialog.Close>
			<Dialog.Description>
				<Checkbox
					ref={selectAllCheckboxRef}
					checked={allModulesSelected}
					onCheckedChange={handleSelectAllChange}
				/>
				<span className="ml-4">Select All</span>
				<Separator className="mt-2 mb-4" size="4" />
			</Dialog.Description>
			<div className="flex flex-col gap-2">
				{groupedModules["core"].length > 0 && (
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
										className="ml-1"
									/>
									{module.label}
								</div>
							);
						})}
					</div>
				)}
				<CheckboxGroup.Root value={currentCheckedModules} onValueChange={handleValueChange}>
					{groupOrder
						.filter((g) => g !== "core")
						.map(
							(groupName) =>
								groupedModules[groupName].length > 0 && (
									<div key={groupName}>
										<div
											className="mb-2 font-bold capitalize"
											style={{ color: "var(--accent-a11)" }}
										>
											{t(`moduleSelection.${groupName}`)}
										</div>
										{groupedModules[groupName].map((module) => {
											const imagePath = module.image
												? `${baseImagePath}${module.image}`
												: fallbackImage;
											let isDisabled = false;
											if (
												["upgrade", "cosmetic", "reactor"].includes(
													groupName
												)
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
													].find((m) =>
														m.label.includes(prerequisiteRank)
													);
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
													className="mb-2 flex items-center gap-2 font-medium transition-colors duration-200 hover:text-[var(--accent-a12)]"
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
														fallback="IK"
														src={imagePath}
														color={techColor}
														className="ml-1"
													/>
													{module.label}
												</label>
											);
										})}
									</div>
								)
						)}
				</CheckboxGroup.Root>
			</div>
			<div className="mt-4 flex justify-end">
				<Dialog.Close>
					<Button onClick={handleOptimizeClick}>Optimize</Button>
				</Dialog.Close>
			</div>
		</Dialog.Content>
	);
};
