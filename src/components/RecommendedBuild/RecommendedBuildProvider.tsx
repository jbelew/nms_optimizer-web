import React, { useCallback, useMemo } from "react";

import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useRecommendedBuild } from "@/hooks/useRecommendedBuild/useRecommendedBuild";
import { type TechTree } from "@/hooks/useTechTree/useTechTree";
import { usePlatformStore } from "@/store/app/platformStore";
import { useDialog } from "@/utils/system/dialogUtils";

import { RecommendedBuildContext } from "./useRecommendedBuildContext";

/**
 * Provider for the RecommendedBuild component.
 *
 * @param {object} props - Component properties.
 * @param {React.ReactNode} props.children - Child elements.
 * @param {boolean} props.isLarge - True if the large screen breakpoint.
 * @param {TechTree} props.techTree - The technology tree data.
 *
 * @returns {JSX.Element} The context provider.
 */
export const RecommendedBuildProvider: React.FC<{
	children: React.ReactNode;
	isLarge: boolean;
	techTree: TechTree;
}> = ({ children, isLarge, techTree }) => {
	const { openDialog } = useDialog();
	const { applyRecommendedBuild } = useRecommendedBuild(techTree);
	const { sendEvent } = useAnalytics();
	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform);

	const handleApply = useCallback(
		(build: NonNullable<TechTree["recommended_builds"]>[number]) => {
			setTimeout(async () => {
				await applyRecommendedBuild(build);
				sendEvent({
					action: "apply_build",
					build: build.title,
					category: "build",
					nonInteraction: false,
					platform: selectedPlatform,
					value: 1,
				});
			}, 0);
		},
		[applyRecommendedBuild, sendEvent, selectedPlatform]
	);

	const handleOpenInstructions = useCallback(() => {
		openDialog("instructions", { section: "section-7" });
	}, [openDialog]);

	const value = useMemo(
		() => ({
			handleApply,
			handleOpenInstructions,
			isLarge,
			techTree,
		}),
		[handleApply, handleOpenInstructions, isLarge, techTree]
	);

	return (
		<RecommendedBuildContext.Provider value={value}>
			{children}
		</RecommendedBuildContext.Provider>
	);
};
