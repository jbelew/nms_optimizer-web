import type { FC } from "react";
import { useCallback, useState } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Button, Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { usePlatformStore } from "../../store/PlatformStore";
import { generateBuildNameWithType } from "../../utils/buildNameGenerator";

interface BuildNameContentProps {
	onConfirm: (buildName: string) => void;
	onCancel: () => void;
}

export const BuildNameContent: FC<BuildNameContentProps> = ({ onConfirm, onCancel }) => {
	const { t } = useTranslation();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const [buildName, setBuildName] = useState(() => generateBuildNameWithType(selectedShipType));

	const handleGenerateName = useCallback(() => {
		setBuildName(generateBuildNameWithType(selectedShipType));
	}, [selectedShipType]);

	const handleConfirm = useCallback(() => {
		const trimmedName = buildName.trim();
		if (trimmedName) {
			onConfirm(trimmedName);
		}
	}, [buildName, onConfirm]);

	const handleCancel = useCallback(() => {
		setBuildName(generateBuildNameWithType(selectedShipType));
		onCancel();
	}, [onCancel, selectedShipType]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				handleConfirm();
			} else if (e.key === "Escape") {
				handleCancel();
			}
		},
		[handleConfirm, handleCancel]
	);

	return (
		<>
			<Flex direction="column" gap="2">
				<Text as="label" ml="1" size="2" weight="medium">
					{t("dialog.buildName.description") || "Enter a name for your build"}
				</Text>
				<Flex gap="2">
					<TextField.Root
						placeholder={t("dialog.buildName.placeholder") || "Build name"}
						value={buildName}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setBuildName(e.target.value)
						}
						onKeyDown={handleKeyDown}
						style={{ flex: 1 }}
					/>
					<IconButton
						variant="soft"
						onClick={handleGenerateName}
						aria-label={t("buttons.generateName") || "Generate name"}
						title={t("buttons.generateName") || "Generate name"}
					>
						<ReloadIcon />
					</IconButton>
				</Flex>
			</Flex>

			<Flex gap="2" mt="6" mb="2" justify="end">
				<Button variant="soft" onClick={handleCancel}>
					{t("buttons.cancel") || "Cancel"}
				</Button>
				<Button onClick={handleConfirm} disabled={!buildName.trim()}>
					{t("buttons.save") || "Save"}
				</Button>
			</Flex>
		</>
	);
};
