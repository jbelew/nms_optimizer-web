import "./TechTreeSection.scss";

import type { TechTreeItem, TechTree as TechTreeType } from "@/hooks/useTechTree/useTechTree";
import React, { lazy, Suspense, useEffect, useMemo, useRef } from "react";
import { Box, ScrollArea, Separator } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@/components/EmptyState/EmptyState";
import { TechTreeRow } from "@/components/TechTreeRow/TechTreeRow";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useFetchTechTreeSuspense } from "@/hooks/useTechTree/useTechTree";
import { usePlatformStore } from "@/store/app/platformStore";
import { Logger } from "@/utils/system/monitoring";

import { TechTreePresetsCard } from "./TechTreePresetsCard";

export { TechTreeSkeleton } from "./TechTreeSkeleton";

/**
 * Lazy-loaded module for the shared Module Selection dialog.
 *
 * @remarks
 * This dynamic import extracts the Module Selection dialog and its Radix UI primitives
 * from the critical startup bundle, reducing initial JS payload and Total Blocking Time (TBT).
 */
const ModuleSelectionDialog = lazy(() =>
	import("@/components/ModuleSelectionDialog/ModuleSelectionDialog").then((m) => ({
		default: m.ModuleSelectionDialog,
	}))
);

/**
 * Registry of sidebar decorative icons indexed by Technology Section name.
 */
const sectionImageMap: Record<string, string> = {
	"Defensive Systems": "defensive.webp",
	"Fleet Upgrades": "upgrade.webp",
	"Hazard Protection": "hazard.webp",
	Hyperdrive: "hyperdrive.webp",
	"Life Support": "health.webp",
	Mining: "mining.webp",
	"Movement Systems": "movement.webp",
	Propulsion: "propulsion.webp",
	"Quest Rewards": "secondary2.webp",
	Scanners: "scanners.webp",
	"Secondary Weapons": "secondary.webp",
	"Upgrade Modules": "upgrade.webp",
	Utilities: "secondary.webp",
	Weaponry: "weaponry.webp",
};

/**
 * Properties for the {@link TechTree} component.
 */
export interface TechTreeProps {
	/** Optional pre-fetched technology tree data. */
	techTree?: TechTreeType;
}

/**
 * Renders a Technology Section header with its decorative icon and localized title.
 *
 * @param props - Component properties.
 * @param props.section - The Technology Section identifier (e.g., `"Weaponry"`).
 *
 * @returns The rendered Technology Section header.
 */
const TechTreeSectionHeader: React.FC<{ section: string }> = ({ section }) => {
	const { t } = useTranslation();
	const imageFile = sectionImageMap[section];
	const imagePath = imageFile ? `/assets/img/sidebar/${imageFile}?v=${__APP_VERSION__}` : null;

	return (
		<div className="flex items-start">
			{imagePath && (
				<img
					alt={section}
					className="mt-px mr-1 ml-1 opacity-35 sm:mt-1"
					height="24"
					src={imagePath}
					srcSet={`${imagePath.replace(".webp", "@2x.webp")} 2x`}
					width="36"
				/>
			)}
			<h2 className="heading-styled text-xl sm:text-2xl">
				{t(`techTree.categories.${section}`)}
			</h2>
		</div>
	);
};

/**
 * Renders the technology tree sidebar with Recommended Builds, categorized Technology Sections,
 * Technology Category rows, and the shared lazy-loaded Module Selection dialog.
 *
 * @remarks
 * Suspends via `useFetchTechTreeSuspense` for the active Platform Type (unless `techTree` is passed
 * directly), filters out top-level metadata keys (`grid_definition`, `recommended_builds`, `grid`),
 * sorts Technology Sections and Technology Categories alphabetically, and wraps the sidebar in a
 * desktop `ScrollArea` (`>= 1024px`, resetting scroll position on Platform Type switches) or a
 * mobile `Box`.
 *
 * @param props - Component properties.
 * @param [props.techTree] - Optional pre-fetched technology tree payload.
 *
 * @returns The rendered technology tree layout.
 *
 * @see {@link TechTreePresetsCard}
 * @see {@link TechTreeRow}
 * @see {@link ModuleSelectionDialog}
 * @see {@link ./TechTree.test.tsx Unit Tests}
 * @see {@link ./TechTree.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <TechTree />
 * // renders technology tree sections, rows, and shared module selection dialog
 * ```
 */
export const TechTree: React.FC<TechTreeProps> = ({ techTree: techTreeProp }) => {
	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform) || "standard";
	const fetchedTechTree = useFetchTechTreeSuspense(selectedPlatform);
	const techTree = techTreeProp || fetchedTechTree;
	const isLarge = useBreakpoint("1024px");
	const viewportRef = useRef<HTMLDivElement>(null);
	const prevPlatformRef = useRef(selectedPlatform);

	useEffect(() => {
		if (prevPlatformRef.current !== selectedPlatform) {
			prevPlatformRef.current = selectedPlatform;

			if (isLarge && viewportRef.current) {
				if (typeof viewportRef.current.scrollTo === "function") {
					viewportRef.current.scrollTo({ top: 0 });
				}

				viewportRef.current.scrollTop = 0;
			}
		}
	}, [isLarge, selectedPlatform]);

	const technologySections = useMemo(() => {
		const groups: Record<string, TechTreeItem[]> = {};

		Object.entries(techTree).forEach(([key, value]) => {
			if (key === "grid_definition" || key === "recommended_builds" || key === "grid") return;

			if (Array.isArray(value)) {
				const validItems = value.filter(
					(item) =>
						item && typeof item === "object" && "label" in item && "modules" in item
				) as TechTreeItem[];

				if (validItems.length > 0 || value.length === 0) {
					groups[key] = [...validItems].sort((a, b) => a.label.localeCompare(b.label));
				}
			}
		});

		return groups;
	}, [techTree]);

	const sections = useMemo(() => Object.keys(technologySections).sort(), [technologySections]);

	const hasPresets = Boolean(techTree.recommended_builds?.length);

	const content =
		sections.length === 0 ? (
			(() => {
				Logger.warn("TechTree: No technology categories found to render.", {
					techTreeKeys: Object.keys(techTree),
				});

				return (
					<EmptyState
						description="Unable to connect to the Solver API endpoint."
						title="No Technologies Found"
					/>
				);
			})()
		) : (
			<div className={`tech-tree-content ${hasPresets ? "" : "mt-4 lg:mt-0"}`.trim()}>
				<TechTreePresetsCard techTree={techTree} />

				{sections.map((section) => (
					<div className="sidebar__section mb-6 last:mb-0 lg:mb-6" key={section}>
						<TechTreeSectionHeader section={section} />

						<Separator
							className="sidebar__separator mt-2 mb-4"
							orientation="horizontal"
							size="4"
						/>

						{technologySections[section].map((tech: TechTreeItem) => (
							<TechTreeRow
								key={tech.key}
								tech={tech.key}
								techColor={tech.color}
								techImage={tech.image}
							/>
						))}
					</div>
				))}
			</div>
		);

	return (
		<>
			{isLarge ? (
				<ScrollArea
					className="main-app__tech-tree-sidebar shadow-sm"
					ref={viewportRef}
					scrollbars="vertical"
					style={{
						borderRadius: "var(--radius-3)",
						flexGrow: 1,
						minHeight: 0,
						padding: "var(--space-4)",
						paddingRight: "var(--space-5)",
					}}
					type="always"
				>
					{content}
				</ScrollArea>
			) : (
				<Box mt="4">{content}</Box>
			)}
			<Suspense fallback={null}>
				<ModuleSelectionDialog />
			</Suspense>
		</>
	);
};

TechTree.displayName = "TechTree";
