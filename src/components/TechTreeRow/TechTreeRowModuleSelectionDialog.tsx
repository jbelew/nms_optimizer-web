import { Badge, Button, Dialog, Flex, Text } from "@radix-ui/themes";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { TechTreeRowProps } from "./TechTreeRow";

interface ModuleSelectionDialogProps {
	modules: { label: string; id: string; image: string; type?: string }[];
	currentCheckedModules: string[];
	handleCheckboxChange: (moduleId: string) => void;
	handleAllCheckboxesChange: (moduleIds: string[]) => void;
	translatedTechName: string;
    moduleCount: number;
    currentCheckedModulesLength: number;
    techColor: TechTreeRowProps["techColor"];
    hasTechInGrid: boolean;
}

export const TechTreeRowModuleSelectionDialog: React.FC<ModuleSelectionDialogProps> = ({
	modules,
	currentCheckedModules,
	handleCheckboxChange,
	handleAllCheckboxesChange,
	translatedTechName,
    moduleCount,
    currentCheckedModulesLength,
    techColor,
    hasTechInGrid,
}) => {
	const { t } = useTranslation();

	const allModuleIds = modules.map((m) => m.id);
	const areAllModulesSelected =
		currentCheckedModules.length === allModuleIds.length;

	const handleSelectAll = () => {
		if (areAllModulesSelected) {
			handleAllCheckboxesChange([]);
		} else {
			handleAllCheckboxesChange(allModuleIds);
		}
	};

    const groupedModules = useMemo(() => {
		const groups: { [key: string]: typeof modules } = {
			core: [],
			bonus: [],
			upgrade: [],
			reactor: [],
			cosmetic: [],
		};

		modules.forEach((module) => {
			const type = module.type || "upgrade"; // Default to upgrade if type is not specified
			if (groups[type]) {
				groups[type].push(module);
			} else {
				groups.upgrade.push(module); // Or handle unknown types
			}
		});

		return groups;
	}, [modules]);

    const groupOrder = ["core", "bonus", "upgrade", "reactor", "cosmetic"];

	return (
		<Dialog.Root>
			<Dialog.Trigger>
				<Badge
					color="gray"
					variant="soft"
					radius="full"
					className={
						"cursor-pointer transition-all hover:bg-[var(--gray-a6)]"
					}
				>
					{currentCheckedModulesLength} / {moduleCount}
				</Badge>
			</Dialog.Trigger>

			{moduleCount > 0 && (
				<Dialog.Content style={{ maxWidth: 450 }}>
					<Dialog.Title>
						{t("dialogs.module_selection.title", {
							tech: translatedTechName,
						})}
					</Dialog.Title>
					<Dialog.Description size="2" mb="4">
						{t("dialogs.module_selection.description")}
					</Dialog.Description>

					<Flex direction="column" gap="3">
						{groupOrder.map(
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
                                            let isDisabled = false;

                                            if (
                                                groupName === "upgrade" ||
                                                groupName === "cosmetic" ||
                                                groupName === "reactor"
                                            ) {
                                                const label = module.label;
                                                const order = ["Sigma", "Tau", "Theta"];

                                                let rankIndex = -1;
                                                if (label.includes("Sigma")) rankIndex = 0;
                                                else if (label.includes("Tau")) rankIndex = 1;
                                                else if (label.includes("Theta")) rankIndex = 2;

                                                if (rankIndex > 0) {
                                                    const prerequisiteRank =
                                                        order[rankIndex - 1];
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
                                                <Text as="label" size="2" key={module.id} htmlFor={module.id}>
                                                    <Flex gap="2">
                                                        <input
                                                            type="checkbox"
                                                            id={module.id}
                                                            className="radix-accent-color"
                                                            value={module.id}
                                                            checked={currentCheckedModules.includes(module.id)}
                                                            onChange={() => handleCheckboxChange(module.id)}
                                                            disabled={isDisabled}
                                                        />{" "}
                                                        {module.label}
                                                    </Flex>
                                                </Text>
                                            );
                                        })}
                                    </div>
                                )
                        )}
					</Flex>

					<Flex gap="3" mt="4" justify="end">
						<Button variant="soft" color="gray" onClick={handleSelectAll}>
							{areAllModulesSelected
								? t("buttons.unselect_all")
								: t("buttons.select_all")}
						</Button>
						<Dialog.Close>
							<Button>{t("buttons.close")}</Button>
						</Dialog.Close>
					</Flex>
				</Dialog.Content>
			)}
		</Dialog.Root>
	);
};
