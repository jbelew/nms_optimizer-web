import type { FC } from "react";
import { useRef, useState } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Button, Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useDebouncedValidation } from "../../../hooks/useDebouncedValidation/useDebouncedValidation";
import { usePlatformStore } from "../../../store/PlatformStore";
import { generateBuildNameWithType } from "../../../utils/buildNameGenerator";
import { isValidFilename } from "../../../utils/filenameValidation";

/**
 * Props for the `BuildNameContent` component.
 */
interface BuildNameContentProps {
	/** Callback function triggered when the user confirms the build name. **Receives the validated name.** */
	onConfirm: (buildName: string) => void;
	/** Callback function triggered when the user cancels the input process. */
	onCancel: () => void;
}

/**
 * A component providing the UI for entering and validating a build name.
 *
 * @remarks
 * It features a text field with debounced validation against filename standards,
 * a random name generator for NMS-themed build names, and keyboard handling
 * for Enter and Escape keys. This component is typically used within a dialog
 * to name a user's technology layout before saving.
 *
 * @param {BuildNameContentProps} props - Component properties.
 * @returns {JSX.Element} The rendered build name input UI.
 *
 * @see {@link isValidFilename}
 * @see {@link generateBuildNameWithType}
 * @see {@link ./BuildNameDialog.stories.tsx Storybook}
 * @category Components
 *
 * @example
 * ```tsx
 * <BuildNameContent onConfirm={(name) => handleSave(name)} onCancel={() => setOpen(false)} />
 * ```
 */
export const BuildNameContent: FC<BuildNameContentProps> = ({ onConfirm, onCancel }) => {
	const { t } = useTranslation();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const [buildName, setBuildName] = useState(() => generateBuildNameWithType(selectedShipType));
	const inputRef = useRef<HTMLInputElement>(null);

	/**
	 * Validates the input string for empty or illegal characters.
	 *
	 * @param {string} value - The build name to validate.
	 * @returns {string | null} Error message if invalid, otherwise `null`.
	 * @example
	 * ```typescript
	 * const error = createValidator("Invalid/Name"); // returns "Invalid filename" (localized)
	 * ```
	 */
	const createValidator = (value: string): string | null => {
		const trimmed = value.trim();

		if (!trimmed) {
			return t("dialog.buildName.validation.empty");
		}

		if (!isValidFilename(trimmed)) {
			return t("dialog.buildName.validation.invalid");
		}

		return null;
	};

	const { error: validationError, handleChange: handleDebouncedValidation } =
		useDebouncedValidation(createValidator);

	/**
	 * Generates a random themed name and updates the input state.
	 *
	 * @example
	 * ```tsx
	 * handleGenerateName();
	 * // returns void, side-effect: updates buildName and triggers validation
	 * ```
	 */
	const handleGenerateName = () => {
		const newName = generateBuildNameWithType(selectedShipType);
		setBuildName(newName);
		handleDebouncedValidation(newName);
		inputRef.current?.select();
	};

	/**
	 * Updates local state and triggers validation on input change.
	 *
	 * @param {import("react").ChangeEvent<HTMLInputElement>} e - The change event.
	 * @example
	 * ```tsx
	 * <input onChange={handleBuildNameChange} />
	 * ```
	 */
	const handleBuildNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setBuildName(newValue);
		handleDebouncedValidation(newValue);
	};

	/**
	 * Validates and submits the current build name.
	 *
	 * @example
	 * ```tsx
	 * handleConfirm();
	 * // returns void, side-effect: calls onConfirm if valid
	 * ```
	 */
	const handleConfirm = () => {
		const trimmedName = buildName.trim();
		const error = createValidator(trimmedName);

		if (!error) {
			onConfirm(trimmedName);
		}
	};

	/**
	 * Resets state and notifies the parent of cancellation.
	 *
	 * @example
	 * ```tsx
	 * handleCancel();
	 * // returns void, side-effect: resets state and calls onCancel
	 * ```
	 */
	const handleCancel = () => {
		const newName = generateBuildNameWithType(selectedShipType);
		setBuildName(newName);
		handleDebouncedValidation(newName);
		onCancel();
	};

	/**
	 * Dispatches actions based on keyboard input.
	 *
	 * @param {import("react").KeyboardEvent<HTMLInputElement>} e - The keyboard event.
	 * @example
	 * ```tsx
	 * <input onKeyDown={handleKeyDown} />
	 * ```
	 */
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleConfirm();
		} else if (e.key === "Escape") {
			handleCancel();
		}
	};

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
						ml="1"
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
