import React from "react";
import { Share1Icon } from "@radix-ui/react-icons";
import { Button, Card, Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

interface InstallPromptProps {
	onDismiss: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ onDismiss }) => {
	const { t } = useTranslation();

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-4">
			<Card size="1" variant="classic" className="pointer-events-auto max-w-md">
				<Flex gap="3" align="center">
					<Share1Icon width="24" height="24" />
					<Flex direction="column" flexGrow="1">
						<Text size="2">{t("installPrompt.iosInstructions")}</Text>
					</Flex>
					<Button size="1" variant="soft" onClick={onDismiss}>
						{t("installPrompt.dismiss")}
					</Button>
				</Flex>
			</Card>
		</div>
	);
};
