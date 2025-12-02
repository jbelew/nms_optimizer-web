import type { FC } from "react";
import { useCallback, useRef, useState } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Button, Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useDebouncedValidation } from "../../hooks/useDebouncedValidation/useDebouncedValidation";
import { usePlatformStore } from "../../store/PlatformStore";
import { generateBuildNameWithType } from "../../utils/buildNameGenerator";
import { isValidFilename } from "../../utils/filenameValidation";

interface BuildNameContentProps {
	onConfirm: (buildName: string) => void;
	onCancel: () => void;
}

export const BuildNameContent: FC<BuildNameContentProps> = ({ onConfirm, onCancel }) => {
	const { t } = useTranslation();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const [buildName, setBuildName] = useState(() => generateBuildNameWithType(selectedShipType));
	const inputRef = useRef<HTMLInputElement>(null);

	const createValidator = useCallback(
		(value: string): string | null => {
			const trimmed = value.trim();

			if (!trimmed) {
				return t("dialog.buildName.validation.empty");
			}

			if (!isValidFilename(trimmed)) {
				return t("dialog.buildName.validation.invalid");
			}

			return null;
		},
		[t]
	);

	const { error: validationError, handleChange: handleDebouncedValidation } =
		useDebouncedValidation(createValidator);

	const handleGenerateName = useCallback(() => {
		const newName = generateBuildNameWithType(selectedShipType);
		setBuildName(newName);
		handleDebouncedValidation(newName);
		inputRef.current?.select();
	}, [selectedShipType, handleDebouncedValidation]);

	const handleBuildNameChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			setBuildName(newValue);
			handleDebouncedValidation(newValue);
		},
		[handleDebouncedValidation]
	);

	const handleConfirm = useCallback(() => {
		const trimmedName = buildName.trim();
		const error = createValidator(trimmedName);

		if (!error) {
			onConfirm(trimmedName);
		}
	}, [buildName, onConfirm, createValidator]);

	const handleCancel = useCallback(() => {
		const newName = generateBuildNameWithType(selectedShipType);
		setBuildName(newName);
		handleDebouncedValidation(newName);
		onCancel();
	}, [onCancel, selectedShipType, handleDebouncedValidation]);

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
				<Text as="label" htmlFor="build-name-input" ml="1" size="2" weight="medium">
					{t("dialog.buildName.description")}
				</Text>
				<Flex gap="2">
					<TextField.Root
						ref={inputRef}
						id="build-name-input"
						name="buildName"
						placeholder={t("dialog.buildName.placeholder")}
						value={buildName}
						onChange={handleBuildNameChange}
						onKeyDown={handleKeyDown}
						style={{ flex: 1, fontSize: "16px" }}
					/>
					<IconButton
						variant="soft"
						onClick={handleGenerateName}
						aria-label={t("buttons.generateName")}
						title={t("buttons.generateName")}
					>
						<ReloadIcon />
					</IconButton>
				</Flex>
				{validationError && (
					<Text size="1" color="red" ml="1">
						{validationError}
					</Text>
				)}
			</Flex>

			<Flex gap="2" mt="6" mb="2" justify="end">
				<Button variant="soft" onClick={handleCancel}>
					{t("buttons.cancel")}
				</Button>
				<Button onClick={handleConfirm} disabled={!buildName.trim() || !!validationError}>
					{t("buttons.save")}
				</Button>
			</Flex>
		</>
	);
};
