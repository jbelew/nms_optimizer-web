// src/components/RecommendedBuild/RecommendedBuild.tsx
import type { TechTree } from "@/hooks/useTechTree/useTechTree";
import React from "react";

import { RecommendedBuildButton } from "./RecommendedBuildButton";
import { RecommendedBuildInfo } from "./RecommendedBuildInfo";
import { RecommendedBuildProvider } from "./RecommendedBuildProvider";
import { RecommendedBuildRoot } from "./RecommendedBuildRoot";

export { RecommendedBuildProvider } from "./RecommendedBuildProvider";

/**
 * Props for the `RecommendedBuild` component.
 */
interface RecommendedBuildProps {
	/** Whether the screen matches the 'large' (desktop) breakpoint. */
	isLarge: boolean;
	/** The technology tree data. */
	techTree: TechTree;
}

/**
 * The default composite RecommendedBuild component.
 */
export const RecommendedBuild: React.FC<RecommendedBuildProps> = ({ isLarge, techTree }) => {
	return (
		<RecommendedBuildProvider isLarge={isLarge} techTree={techTree}>
			<RecommendedBuildRoot>
				<RecommendedBuildButton mb={isLarge ? "0" : "1"} />
				<RecommendedBuildInfo />
			</RecommendedBuildRoot>
		</RecommendedBuildProvider>
	);
};
