import React from "react";
import PropTypes from "prop-types";

import RecommendedBuild from "../RecommendedBuild/RecommendedBuild";
import { TechTreeContent } from "./TechTreeContent";

import { type TechTree } from "../../hooks/useTechTree";

interface TechTreeDisplayProps {
	handleOptimize: (tech: string) => Promise<void>;
	solving: boolean;
	techTree: TechTree;
	scrollAreaHeight: string;
	selectedShipType: string;
	gridContainerRef: React.RefObject<HTMLDivElement | null>;
	isLarge: boolean;
}

export const TechTreeDisplay: React.FC<TechTreeDisplayProps> = React.memo(
	({ handleOptimize, solving, techTree, selectedShipType, gridContainerRef, isLarge }) => {
		return (
			<>
				{isLarge ? (
					<>
						<TechTreeContent
							handleOptimize={handleOptimize}
							solving={solving}
							techTree={techTree}
							selectedShipType={selectedShipType}
						/>
						{techTree.recommended_builds && techTree.recommended_builds.length > 0 && (
							<div className="mt-1">
								<RecommendedBuild
									techTree={techTree}
									gridContainerRef={gridContainerRef}
									isLarge={isLarge}
								/>
							</div>
						)}
					</>
				) : (
					<>
						{techTree.recommended_builds && techTree.recommended_builds.length > 0 && (
							<RecommendedBuild
								techTree={techTree}
								gridContainerRef={gridContainerRef}
								isLarge={isLarge}
							/>

						)}
						<TechTreeContent
							handleOptimize={handleOptimize}
							solving={solving}
							techTree={techTree}
							selectedShipType={selectedShipType}
						/>
					</>
				)}
			</>
		);
	}
);

TechTreeDisplay.displayName = "TechTreeDisplay";
TechTreeDisplay.propTypes = {
	handleOptimize: PropTypes.func.isRequired,
	solving: PropTypes.bool.isRequired,
	techTree: PropTypes.object.isRequired,
	scrollAreaHeight: PropTypes.string.isRequired,
	selectedShipType: PropTypes.string.isRequired,
};
