import type { TechTree as TechTreeType } from "@/hooks/useTechTree/useTechTree";
import React from "react";

import {
	RecommendedBuildButton,
	RecommendedBuildInfo,
	RecommendedBuildProvider,
	RecommendedBuildRoot,
} from "@/components/RecommendedBuild/RecommendedBuild";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";

/**
 * Recommended build section component.
 */
export const TechTreeRecommended: React.FC<{ techTree: TechTreeType }> = ({ techTree }) => {
	const isLarge = useBreakpoint("1024px");
	const hasRecommendedBuilds =
		!!techTree?.recommended_builds && techTree.recommended_builds.length > 0;

	if (!hasRecommendedBuilds) return null;

	return (
		<RecommendedBuildProvider isLarge={isLarge} techTree={techTree}>
			<RecommendedBuildRoot>
				<RecommendedBuildButton mb={isLarge ? "0" : "1"} />
				<RecommendedBuildInfo />
			</RecommendedBuildRoot>
		</RecommendedBuildProvider>
	);
};
