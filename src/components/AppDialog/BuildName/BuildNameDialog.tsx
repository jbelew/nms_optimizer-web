import type { FC } from "react";
import { useRef, useState } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Button, Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import AppDialog from "@/components/AppDialog/Base/AppDialog";
import { useDebouncedValidation } from "@/hooks/useValidation/useValidation";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { generateBuildNameWithType } from "@/utils/optimization/buildNameGenerator";
import { isValidFilename } from "@/utils/validation/dataValidation";

import "./BuildNameDialog.scss";

/**
 * Props for the {@link BuildNameDialog} component.
 *
 * @category Components
 */
interface BuildNameDialogProps {
	/** Whether the naming dialog is currently visible. */
	isOpen: boolean;
	/** Callback function triggered when the user cancels or dismisses the dialog. */
	onCancel: () => void;
	/** Callback function triggered when the user confirms the build name. **Receives the validated name as a string.** */
	onConfirm: (buildName: string) => void;
}

/**
 * A modal dialog that allows users to provide a custom name for their saved Build File.
 *
 * @remarks
 * Features a text field with debounced filename validation, a random NMS-themed build name
 * generator seeded by the active Platform Type, and keyboard handling for Enter and Escape keys,
 * rendered inside the standard {@link AppDialog} frame.
 *
 * @see {@link BuildNameDialogProps}
 * @see {@link AppDialog}
 * @see {@link useDebouncedValidation}
 * @see {@link usePlatformStore}
 * @see {@link useGridStore}
 * @see {@link generateBuildNameWithType}
 * @see {@link isValidFilename}
 * @see {@link ./BuildNameDialog.test.tsx Unit Tests}
 * @see {@link ./BuildNameDialog.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <BuildNameDialog
 *   isOpen={true}
 *   onConfirm={(name) => handleSave(name)}
 *   onCancel={() => setOpen(false)}
 * />
 * // mounts BuildNameDialog
 * ```
 */
const BuildNameDialog: FC<BuildNameDialogProps> = ({ isOpen, onCancel, onConfirm }) => {
	const { t } = useTranslation();
	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform);
	const persistedBuildName = useGridStore((state) => state.buildName);
	const [buildName, setBuildName] = useState(
		() => persistedBuildName || generateBuildNameWithType(selectedPlatform),
	);
	const inputRef = useRef<HTMLInputElement>(null);

	const validateBuildName = (value: string): null | string => {
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
		useDebouncedValidation(validateBuildName);

	const resetToGeneratedName = () => {
		const newName = generateBuildNameWithType(selectedPlatform);
		setBuildName(newName);
		handleDebouncedValidation(newName);
	};

	const handleGenerateName = () => {
		resetToGeneratedName();
		inputRef.current?.select();
	};

	const handleBuildNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setBuildName(newValue);
		handleDebouncedValidation(newValue);
	};

	const handleConfirm = () => {
		const trimmedName = buildName.trim();
		const error = validateBuildName(trimmedName);

		if (!error) {
			onConfirm(trimmedName);
		}
	};

	const handleCancel = () => {
		resetToGeneratedName();
		onCancel();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleConfirm();
		} else if (e.key === "Escape") {
			handleCancel();
		}
	};

	const content = (
		<Flex
			direction="column"
			gap="2"
		>
			<Text
				as="label"
				htmlFor="build-name-input"
				weight="medium"
			>
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
				<Text
					color="red"
					ml="1"
					size="1"
				>
					{validationError}
				</Text>
			)}
		</Flex>
	);

	const footer = (
		<>
			<Button
				onClick={handleCancel}
				variant="soft"
			>
				{t("buttons.cancel")}
			</Button>
			<Button onClick={handleConfirm}>{t("buttons.save")}</Button>
		</>
	);

	return (
		<AppDialog
			className="buildNameDialog__content"
			content={content}
			footer={footer}
			isOpen={isOpen}
			onClose={handleCancel}
			title={t("dialog.buildName.title")}
			titleKey="dialog.buildName.title"
		/>
	);
};

export default BuildNameDialog;
