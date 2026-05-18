import { useImperativeHandle, useRef, useState } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useDebouncedValidation } from "@/hooks/useValidation/useValidation";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { generateBuildNameWithType } from "@/utils/optimization/buildNameGenerator";
import { isValidFilename } from "@/utils/validation/dataValidation";

/**
 * Reference interface for the BuildNameContent component.
 */
export interface BuildNameContentRef {
	handleConfirm: () => void;
}

/**
 * Props for the `BuildNameContent` component.
 *
 * @category Components
 */
interface BuildNameContentProps {
	/** Callback function triggered when the user cancels the input process. */
	onCancel: () => void;
	/** Callback function triggered when the user confirms the build name. **Receives the validated name.** */
	onConfirm: (buildName: string) => void;
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
 * @param {BuildNameContentProps & { ref?: React.Ref<BuildNameContentRef> }} props - Component properties including optional ref.
 *
 * @returns {JSX.Element} The rendered build name input UI.
 *
 * @see {@link isValidFilename}
 * @see {@link generateBuildNameWithType}
 * @see {@link ./BuildNameDialog.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <BuildNameContent
 *   onConfirm={(name) => console.log('Saved:', name)}
 *   onCancel={() => console.log('Cancelled')}
 * />
 * // mounts the build name input UI with a generated default name
 * ```
 */
export const BuildNameContent = ({
	onCancel,
	onConfirm,
	ref,
}: BuildNameContentProps & { ref?: React.Ref<BuildNameContentRef> }) => {
	const { t } = useTranslation();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const persistedBuildName = useGridStore((state) => state.buildName);
	const [buildName, setBuildName] = useState(
		() => persistedBuildName || generateBuildNameWithType(selectedShipType)
	);
	const inputRef = useRef<HTMLInputElement>(null);

	/**
	 * Validates the input string for empty or illegal characters.
	 *
	 * @param {string} value - The build name to validate.
	 *
	 * @returns {string | null} Error message if invalid, otherwise null.
	 *
	 * @example Logic usage
	 * ```typescript
	 * createValidator("cool-build");
	 * ```
	 */
	const createValidator = (value: string): null | string => {
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
	 * @returns {void}
	 *
	 * @example Interaction handler
	 * ```typescript
	 * handleGenerateName();
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
	 * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
	 *
	 * @returns {void}
	 *
	 * @example Interaction handler
	 * ```typescript
	 * handleBuildNameChange(event);
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
	 * @returns {void}
	 *
	 * @example Interaction handler
	 * ```typescript
	 * handleConfirm();
	 * ```
	 */
	const handleConfirm = () => {
		const trimmedName = buildName.trim();
		const error = createValidator(trimmedName);

		if (!error) {
			onConfirm(trimmedName);
		}
	};

	useImperativeHandle(ref, () => ({
		handleConfirm,
	}));

	/**
	 * Resets state and notifies the parent of cancellation.
	 *
	 * @returns {void}
	 *
	 * @example Interaction handler
	 * ```typescript
	 * handleCancel();
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
	 * @param {React.KeyboardEvent<HTMLInputElement>} e - The keyboard event.
	 *
	 * @returns {void}
	 *
	 * @example Interaction handler
	 * ```typescript
	 * handleKeyDown(event);
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
			<Flex direction="column" gap="2" mb="2">
				<Text as="label" htmlFor="build-name-input" size="2" weight="medium">
					{t("dialog.buildName.description")}
				</Text>
				<Flex gap="2">
					<TextField.Root
						id="build-name-input"
						name="buildName"
						onChange={handleBuildNameChange}
						onKeyDown={handleKeyDown}
						placeholder={t("dialog.buildName.placeholder")}
						ref={inputRef}
						style={{ flex: 1, fontSize: "16px" }}
						value={buildName}
					/>
					<IconButton
						aria-label={t("buttons.generateName")}
						onClick={handleGenerateName}
						title={t("buttons.generateName")}
						variant="soft"
					>
						<ReloadIcon />
					</IconButton>
				</Flex>
				{validationError && (
					<Text color="red" ml="1" size="1">
						{validationError}
					</Text>
				)}
			</Flex>
		</>
	);
};

BuildNameContent.displayName = "BuildNameContent";
