import React, { useMemo } from "react";
import PropTypes from "prop-types";

import { useFetchTechTreeSuspense } from "../../hooks/useTechTree";
import { usePlatformStore } from "../../store/PlatformStore";
import { TechTreeDisplay } from "./TechTreeDisplay";

interface TechTreeComponentProps {
	handleOptimize: (tech: string) => Promise<void>;
	solving: boolean;
		gridContainerRef: React.RefObject<HTMLDivElement | null>;
	isLarge: boolean;
}

const TechTreeContainer: React.FC<TechTreeComponentProps> = ({ handleOptimize, solving, gridContainerRef, isLarge }) => {
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform) || "standard";
	const techTree = useFetchTechTreeSuspense(selectedShipType);

	const DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT = "524px";
	
	const scrollAreaHeight = useMemo(() => {
		const baseHeight = parseInt(DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT, 10);
		if (techTree.recommended_builds && techTree.recommended_builds.length > 0) {
			return `${baseHeight - 52}px`;
		}
		return DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT;
	}, [techTree.recommended_builds]);

	return (
		<TechTreeDisplay
			handleOptimize={handleOptimize}
			solving={solving}
			gridContainerRef={gridContainerRef}
			isLarge={isLarge}
			techTree={techTree}
			scrollAreaHeight={scrollAreaHeight}
			selectedShipType={selectedShipType}
		/>
	);
};

TechTreeContainer.propTypes = {
	handleOptimize: PropTypes.func.isRequired,
	solving: PropTypes.bool.isRequired,
	gridContainerRef: PropTypes.object.isRequired,
	isLarge: PropTypes.bool.isRequired,
};

export default TechTreeContainer;
