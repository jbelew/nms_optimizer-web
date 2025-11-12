import React from "react";
import { Button, Dialog, Flex } from "@radix-ui/themes";

interface UpdatePromptProps {
	isOpen: boolean;
	onRefresh: () => void;
	onDismiss: () => void;
}

const UpdatePrompt: React.FC<UpdatePromptProps> = ({ isOpen, onRefresh, onDismiss }) => {
	return (
		<Dialog.Root open={isOpen}>
			<Dialog.Content style={{ maxWidth: 450 }}>
				<Dialog.Title>Update Available</Dialog.Title>
				<Dialog.Description size="2" mb="4">
					A new version of the application is available. Refresh now to get the latest
					features and bug fixes.
				</Dialog.Description>

				<Flex gap="3" mt="4" justify="end">
					<Dialog.Close>
						<Button variant="soft" onClick={onDismiss}>
							Later
						</Button>
					</Dialog.Close>
					<Button onClick={onRefresh}>Refresh Now</Button>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
};

export default UpdatePrompt;
