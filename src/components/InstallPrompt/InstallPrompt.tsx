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
			size="2"
			style={{ backgroundColor: "-var(--cyan-11)" }}
			className="fixed right-4 bottom-4 left-4 mx-auto max-w-md"
		>
			<Callout.Icon>
				<Share1Icon />
			</Callout.Icon>
			<Callout.Text>{t("installPrompt.iosInstructions")}</Callout.Text>
			<Button size="1" variant="solid" onClick={onDismiss}>
				{t("installPrompt.dismiss")}
			</Button>
		</Callout.Root>
	);
};
