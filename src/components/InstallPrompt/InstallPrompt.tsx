import React from "react";
import { Share1Icon } from "@radix-ui/react-icons";
import { Button, Callout } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

interface InstallPromptProps {
	onDismiss: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ onDismiss }) => {
	const { t } = useTranslation();

	return (
		<Callout.Root
			variant="surface"
			size="1"
			className="fixed right-4 bottom-4 left-4 mx-auto max-w-md"
		>
			<Callout.Icon>
				<Share1Icon />
			</Callout.Icon>
			<Callout.Text>{t("installPrompt.iosInstructions")}</Callout.Text>
			<Button mt="1" mb="1" size="1" variant="solid" onClick={onDismiss}>
				{t("installPrompt.dismiss")}
			</Button>
		</Callout.Root>
	);
};
