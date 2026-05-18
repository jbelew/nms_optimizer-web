import React from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Callout, Link, Strong } from "@radix-ui/themes";
import { Trans } from "react-i18next";

import { useRecommendedBuildContext } from "./useRecommendedBuildContext";

/**
 * Root layout component for RecommendedBuild.
 */
export const RecommendedBuildRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { handleOpenInstructions, isLarge } = useRecommendedBuildContext();

	if (isLarge) {
		return <div className="mt-4 flex items-center justify-center gap-2">{children}</div>;
	}

	return (
		<Callout.Root size="1">
			<Callout.Icon>
				<InfoCircledIcon className="shrink-0" />
			</Callout.Icon>
			<Callout.Text>
				<span className="text-sm sm:text-base">
					<Trans
						components={{
							1: <Strong />,
							3: <Strong />,
							5: (
								<Link
									href="#"
									onClick={(e) => {
										e.preventDefault();
										handleOpenInstructions();
									}}
									underline="always"
									weight="medium"
								/>
							),
						}}
						i18nKey="techTree.recommendedBuilds.summary"
					/>
				</span>
			</Callout.Text>
			<div className="flex flex-wrap items-center">{children}</div>
		</Callout.Root>
	);
};
