import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button, Flex, Link, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

interface ErrorContentProps {
	onClose: () => void;
}

const ErrorContent: React.FC<ErrorContentProps> = ({ onClose }) => {
	const { t } = useTranslation();
	return (
		<>
			<span className="errorContent__title block pb-2 text-center text-xl font-semibold tracking-widest">
				{t("errorContent.signalDisruption")}
			</span>
			<Text size={{ initial: "2", sm: "3" }} as="p" mb="2">
				<Trans
					i18nKey="errorContent.serverErrorDetails"
					components={{
						1: (
							<Link
								href="https://github.com/jbelew/nms_optimizer-web/issues"
								target="_blank"
								rel="noopener noreferrer"
								underline="always"
							/>
						),
					}}
				/>
			</Text>
			<Flex gap="2" mt="6" justify="end">
				<Dialog.Close asChild>
					<Button variant="soft" onClick={onClose}>
						{t("dialogs.userStats.closeButton")}
					</Button>
				</Dialog.Close>
			</Flex>
		</>
	);
};

export default React.memo(ErrorContent);
