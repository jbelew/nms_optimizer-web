// src/components/TechTree/TechTree.tsx
import "./TechTree.css";

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Separator } from "@radix-ui/themes";
import PropTypes from "prop-types";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { usePlatformStore } from "../../store/PlatformStore";
import { useFetchTechTreeSuspense } from "../../hooks/useTechTree";
import { selectHasModulesInGrid, useGridStore } from "../../store/GridStore"; // Import useGridStore
import MessageSpinner from "../MessageSpinner/MessageSpinner";
import { TechTreeRow } from "../TechTreeRow/TechTreeRow";

import { type TechTreeItem } from "../../hooks/useTechTree";

// --- Image Map (This is the key part) ---
type TypeImageMap = {
	[key: string]: string;
};

const typeImageMap: TypeImageMap = {
	Weaponry: "weaponry.webp",
	"Defensive Systems": "defensive.webp",
	Hyperdrive: "hyperdrive.webp",
	Mining: "mining.webp",
	"Secondary Weapons": "secondary.webp",
	"Fleet Upgrades": "upgrade.webp",
	Scanners: "scanners.webp",
	Utilities: "secondary.webp",
	Propulsion: "propulsion.webp",
	"Hazard Protection": "hazard.webp",
	"Life Support": "health.webp",
	"Movement Systems": "movement.webp",
};

interface TechTreeComponentProps {
	handleOptimize: (tech: string) => Promise<void>;
	solving: boolean;
}

/**
 * TechTreeSection component renders a section of the tech tree.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.type - The type of technology.
 * @param {TechTreeItem[]} props.technologies - Array of technology items.
 * @param {number} props.index - The index of the section.
 * @param {(tech: string) => Promise<void>} props.handleOptimize - Function to handle optimization.
 * @param {boolean} props.solving - Indicates whether solving is in progress.
 * @param {string} props.selectedShipType - The selected ship type.
 *
 * @returns {JSX.Element} - The rendered component.
 */
interface TechTreeSectionProps {
	type: string;
	technologies: TechTreeItem[];
	index: number;
	handleOptimize: (tech: string) => Promise<void>;
	solving: boolean;
	isGridFull: () => boolean; // Add isGridFull prop
	selectedShipType: string; // Add selectedShipType prop
}

const TechTreeSection: React.FC<TechTreeSectionProps> = React.memo(
	({ type, technologies, handleOptimize, solving, isGridFull, selectedShipType }) => {
		// selectedShipType is kept here if TechTreeSection needs it for other things
		const { t } = useTranslation();
		// Determine the image path from the typeImageMap
		const imagePath = typeImageMap[type] ? `/assets/img/sidebar/${typeImageMap[type]}` : null;
		return (
			<div className="mb-6 lg:mb-6 last:mb-0 sidebar__section">
				<div className="flex items-start">
					{/* Conditionally render the image if imagePath is available */}
					{imagePath &&
						typeImageMap[type] && ( // Ensure type exists in map before rendering image
							<img
								src={imagePath}
								alt={type}
								className="sm:mt-1 ml-1 h-[24] w-[32] mr-2 opacity-25"
							/>
						)}
					<h2 className="text-xl sm:text-2xl heading-styled">
						{t(`techTree.categories.${type}`).toUpperCase()}
					</h2>
				</div>

				<Separator orientation="horizontal" size="4" className="mt-2 mb-4 sidebar__separator" />

				{/* Render each technology as a TechTreeRow */}
				{technologies.map((tech) => {
					const rewardModules = tech.modules.filter((module) => module.type === "reward");
					const hasRewardModules = rewardModules.length > 0;
					return (
						<TechTreeRow
							key={tech.key}
							tech={tech.key}
							handleOptimize={handleOptimize}
							solving={solving}
							techImage={tech.image} // Pass the tech.image here
							isGridFull={isGridFull()} // Pass isGridFull down
							hasRewardModules={hasRewardModules} // Pass hasRewardModules
							rewardModules={rewardModules} // Pass rewardModules
							selectedShipType={selectedShipType} // Pass selectedShipType
							moduleCount={tech.module_count} // Pass module_count
							techColor={tech.color} // Pass tech.color
						/>
					);
				})}
			</div>
		);
	}
);

TechTreeSection.displayName = "TechTreeSection";
TechTreeSection.propTypes = {
	type: PropTypes.string.isRequired,
	technologies: PropTypes.array.isRequired,
	index: PropTypes.number.isRequired,
	handleOptimize: PropTypes.func.isRequired,
	solving: PropTypes.bool.isRequired,
};

const TechTreeContent: React.FC<TechTreeComponentProps> = React.memo(
	({ handleOptimize, solving }) => {
		const selectedShipType = usePlatformStore((state) => state.selectedPlatform); // Get selectedShipType from the store
		const techTree = useFetchTechTreeSuspense(selectedShipType); // Pass selectedShipType to useFetchTechTreeSuspense
		const isGridFull = useGridStore((state) => state.isGridFull); // Calculate isGridFull once here
		const { setGridDefinitionAndApplyModules } = useGridStore.getState();
		const hasModulesInGrid = useGridStore(selectHasModulesInGrid);

		const stringifiedGridDefinition = useMemo(() => {
			return techTree.grid_definition ? JSON.stringify(techTree.grid_definition) : null;
		}, [techTree.grid_definition]);

		const initialGridApplied = React.useRef(false);

		useEffect(() => {
			// Only apply the initial grid definition if it hasn't been applied yet
			// and if the grid is currently empty (no modules have been placed by the user).
			// Also, ensure the grid_definition exists and has actually changed content-wise.
			if (techTree.grid_definition && !hasModulesInGrid && !initialGridApplied.current) {
				// console.log("TechTree: Applying grid from API response:", techTree.grid_definition);
				setGridDefinitionAndApplyModules(techTree.grid_definition);
				initialGridApplied.current = true;
			}
		}, [
			stringifiedGridDefinition,
			hasModulesInGrid,
			setGridDefinitionAndApplyModules,
			techTree.grid_definition,
		]);

		const processedTechTree = useMemo(() => {
			const result: { [key: string]: TechTreeItem[] } = {};
			Object.entries(techTree).forEach(([category, technologies]) => {
				if (
					category === "recommended_builds" ||
					category === "grid" ||
					category === "grid_definition"
				)
					return;

				const safeTechnologies = Array.isArray(technologies) ? technologies : [];
				if (!Array.isArray(technologies)) {
					console.warn(
						`TechTree: Expected 'technologies' to be an array for category '${category}', but received:`,
						technologies
					);
				}

				const mappedAndSortedTechnologies = safeTechnologies
					.filter(
						(tech): tech is TechTreeItem =>
							typeof tech === "object" && tech !== null && "key" in tech
					)
					.map((tech: TechTreeItem) => ({
						...tech,
						modules: tech.modules || [],
						image: tech.image || null,
					}))
					.sort((a, b) => a.label.localeCompare(b.label));

				result[category] = mappedAndSortedTechnologies;
			});
			return result;
		}, [techTree]);

		const renderedTechTree = useMemo(
			() =>
				Object.entries(processedTechTree).map(([type, technologies], index) => (
					<TechTreeSection
						key={type}
						type={type}
						technologies={technologies as TechTreeItem[]}
						handleOptimize={handleOptimize}
						solving={solving}
						index={index}
						isGridFull={isGridFull} // Pass isGridFull down
						selectedShipType={selectedShipType} // Pass selectedShipType down
					/>
				)),
			[processedTechTree, handleOptimize, solving, isGridFull, selectedShipType]
		);

		return <>{renderedTechTree}</>;
	}
);
TechTreeContent.displayName = "TechTreeContent";
TechTreeContent.propTypes = {
	handleOptimize: PropTypes.func.isRequired,
	solving: PropTypes.bool.isRequired,
};

const TechTreeComponent: React.FC<TechTreeComponentProps> = (props) => {
	const [error, setError] = useState<Error | null>(null);
	const isLarge = useBreakpoint("1024px");
	const { t } = useTranslation();

	useEffect(() => {
		setError(null);
	}, [props]);

	return (
		<Suspense
			fallback={
				<MessageSpinner isInset={isLarge} isVisible={true} initialMessage={t("techTree.loading")} />
			}
		>
			{error ? (
				<div className="flex flex-col items-center justify-center h-full">
					<ExclamationTriangleIcon className="shadow-md w-14 h-14 errorContent__icon" />
					<h2 className="pb-2 text-2xl font-semibold tracking-widest text-center errorContent__title">
						{t("techTree.error.title")}
					</h2>
					<p className="font-bold text-center sidebar__error">{t("techTree.error.message")}</p>
					<p>{t("techTree.error.details", { details: error.message })}</p>
				</div>
			) : (
				<ErrorBoundary onError={setError}>
					<TechTreeContent {...props} />
				</ErrorBoundary>
			)}
		</Suspense>
	);
};

TechTreeComponent.propTypes = {
	handleOptimize: PropTypes.func.isRequired,
	solving: PropTypes.bool.isRequired,
};

interface ErrorBoundaryProps {
	onError: (error: Error) => void;
	children: React.ReactNode;
}

interface ErrorBoundaryState {
	error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error: Error) {
		return { error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		this.props.onError(error);
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	render() {
		if (this.state.error) {
			return null; // Render nothing, error is handled by parent
		}
		return this.props.children;
	}
}

export default TechTreeComponent;
