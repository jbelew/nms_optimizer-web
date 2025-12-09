import React from "react";
import { HomeIcon } from "@radix-ui/react-icons";
import { Button, Card, Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

interface InstallPromptProps {
	onDismiss: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ onDismiss }) => {
	const { t } = useTranslation();

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-5">
			<Card size="1" className="pointer-events-auto max-w-md">
				<Flex direction="column" gap="3">
					<Flex gap="3" align="start">
						<HomeIcon
							width="24"
							height="24"
							className="mt-0.5 shrink-0"
							style={{ color: "var(--accent-track)" }}
						/>
						<Flex direction="column" flexGrow="1">
							<Text className="text-sm sm:text-base">
								{t("installPrompt.iosInstructions")}
							</Text>
						</Flex>
					</Flex>
					<Flex justify="end">
						<Button onClick={onDismiss}>{t("installPrompt.dismiss")}</Button>
					</Flex>
				</Flex>
			</Card>
		</div>
	);
};
