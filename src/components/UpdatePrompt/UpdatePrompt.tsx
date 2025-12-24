import type { FC } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button, Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import AppDialog from "../AppDialog/AppDialog";

interface UpdatePromptProps {
	isOpen: boolean;
	onRefresh: () => void;
	onDismiss: () => void;
}

const UpdatePrompt: FC<UpdatePromptProps> = ({ isOpen, onRefresh, onDismiss }) => {
	const { t } = useTranslation();

	const content = (
		<>
			<Text size={{ initial: "2", sm: "3" }} as="p" mb="2">
				{t("dialogs.updatePrompt.description", {
					defaultValue:
						"A new version of the application is available. Refresh now to get the latest features and bug fixes.",
				})}
			</Text>

			<Flex gap="3" mt="6" mb="2" justify="end">
				<Dialog.Close asChild>
					<Button variant="soft" onClick={onDismiss}>
						{t("dialogs.updatePrompt.later", { defaultValue: "Later" })}
					</Button>
				</Dialog.Close>
				<Dialog.Close asChild>
					<Button onClick={onRefresh} autoFocus>
						{t("dialogs.updatePrompt.refreshNow", { defaultValue: "Refresh Now" })}
					</Button>
				</Dialog.Close>
			</Flex>
		</>
	);

	return (
		<AppDialog
			isOpen={isOpen}
			titleKey="dialogs.titles.updatePrompt"
			title={t("dialogs.titles.updatePrompt", { defaultValue: "Update Available" })}
			onClose={onDismiss}
			content={content}
		/>
	);
};

export default UpdatePrompt;
