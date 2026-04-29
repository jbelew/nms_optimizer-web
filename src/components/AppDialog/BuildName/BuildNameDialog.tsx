import type { BuildNameContentRef } from "./BuildNameContent";
import type { FC } from "react";
import { lazy, Suspense, useRef } from "react";
import { Button } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { BuildNameContent } from "./BuildNameContent";

import "./BuildNameDialog.scss";

const AppDialog = lazy(() => import("../Base/AppDialog"));

/**
 * Props for the `BuildNameDialog` component.
 *
 * @category Components
 */
interface BuildNameDialogProps {
	/** Whether the naming dialog is currently visible. */
	isOpen: boolean;
	/** Callback function triggered when the user confirms the build name. **Receives the name as a string.** */
	onConfirm: (buildName: string) => void;
	/** Callback function triggered when the user cancels or dismisses the dialog. */
	onCancel: () => void;
}

/**
 * A modal dialog that allows users to provide a custom name for their saved build.
 *
 * @remarks
 * It wraps the `BuildNameContent` within a standard `AppDialog`, providing a
 * localized title and specific styling for the naming input workflow.
 *
 * @param {BuildNameDialogProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered build naming dialog.
 *
 * @see {@link AppDialog}
 * @see {@link BuildNameContent}
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
 * // mounts a modal dialog with a text input for naming the build
 * ```
 */
const BuildNameDialog: FC<BuildNameDialogProps> = ({ isOpen, onConfirm, onCancel }) => {
	const { t } = useTranslation();
	const contentRef = useRef<BuildNameContentRef>(null);

	const footer = (
		<div className="flex justify-end gap-2">
			<Button variant="soft" onClick={onCancel}>
				{t("buttons.cancel")}
			</Button>
			<Button onClick={() => contentRef.current?.handleConfirm()}>{t("buttons.save")}</Button>
		</div>
	);

	return (
		<Suspense fallback={null}>
			<AppDialog
				isOpen={isOpen}
				onClose={onCancel}
				titleKey="dialog.buildName.title"
				title={t("dialog.buildName.title") || "Save Build"}
				footer={footer}
				content={
					<BuildNameContent onConfirm={onConfirm} onCancel={onCancel} ref={contentRef} />
				}
				className="buildNameDialog__content"
			/>
		</Suspense>
	);
};

export default BuildNameDialog;
