import React from "react";
import PropTypes from "prop-types";
import { ScrollArea } from "@radix-ui/themes";

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
	({ handleOptimize, solving, techTree, scrollAreaHeight, selectedShipType, gridContainerRef, isLarge }) => {
		return (
			<>
				{isLarge ? (
					<>
						<ScrollArea
							className={`gridContainer__sidebar rounded-md p-4 shadow-md backdrop-blur-xl`}
							style={{
								height: scrollAreaHeight,
							}}
						>
							<TechTreeContent
								handleOptimize={handleOptimize}
								solving={solving}
								techTree={techTree}
								selectedShipType={selectedShipType}
							/>
						</ScrollArea>
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
					<aside
						className={`w-full flex-grow ${techTree.recommended_builds && techTree.recommended_builds.length > 0 ? "pt-4" : "pt-8"}`}
						style={{ minHeight: "550px" }}
					>
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
					</aside>
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
