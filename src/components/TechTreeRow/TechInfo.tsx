import React from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Checkbox, Text } from "@radix-ui/themes";
import { Accordion } from "radix-ui";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";

const AccordionTrigger = React.forwardRef(
	(
		{ children, className, ...props }: { children: React.ReactNode; className?: string },
		forwardedRef: React.Ref<HTMLButtonElement>
	) => (
		<Accordion.Header className="AccordionHeader">
			<Accordion.Trigger
				className={`AccordionTrigger ${className || ""}`}
				{...props}
				ref={forwardedRef}
			>
				{children}
				<ChevronDownIcon className="AccordionChevron" aria-hidden />
			</Accordion.Trigger>
		</Accordion.Header>
	)
);
AccordionTrigger.displayName = "AccordionTrigger";

interface TechInfoProps {
	tech: string;
	translatedTechName: string;
	hasRewardModules: boolean;
	rewardModules: { label: string; id: string; image: string; type?: string }[];
	currentCheckedModules: string[];
	handleCheckboxChange: (moduleId: string) => void;
}

export const TechInfo: React.FC<TechInfoProps> = ({
	translatedTechName,
	hasRewardModules,
	rewardModules,
	currentCheckedModules,
	handleCheckboxChange,
}) => {
	const { t } = useTranslation();
	const isSmallAndUp = useBreakpoint("640px");

	if (!hasRewardModules) {
		return (
			<Text
				as="div"
				wrap="balance"
				weight="medium"
				size={isSmallAndUp ? "3" : "2"}
				className="techRow__label block flex-1 pt-1"
			>
				{translatedTechName}
			</Text>
		);
	}

	return (
		<Accordion.Root
			className="AccordionRoot flex-1 border-b-1 pt-[3px] pb-[3px]"
			style={{ borderColor: "var(--accent-track)" }}
			type="single"
			collapsible
		>
			<Accordion.Item className="AccordionItem" value="item-1">
				<AccordionTrigger>
					<Text as="label" wrap="balance" weight="medium" size={isSmallAndUp ? "3" : "2"}>
						{translatedTechName}
					</Text>
				</AccordionTrigger>
				<Accordion.Content className="AccordionContent pl-1">
					{rewardModules.map((module) => (
						<div
							key={module.id}
							className="AccordionContentText flex items-start gap-2"
						>
							<Checkbox
								className="CheckboxRoot ml-1 !pt-1"
								variant="soft"
								id={module.id}
								checked={currentCheckedModules.includes(module.id)}
								onClick={() => handleCheckboxChange(module.id)}
							/>
							<Text
								as="label"
								wrap="balance"
								weight="medium"
								size={isSmallAndUp ? "3" : "2"}
								htmlFor={module.id}
							>
								{t(`modules.${module.id}`, {
									defaultValue: module.label,
								})}
							</Text>
						</div>
					))}
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	);
};
