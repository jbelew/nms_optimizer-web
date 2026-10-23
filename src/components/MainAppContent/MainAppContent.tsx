import "./MainAppContent.scss";

import React, { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import AppFooter from "@/components/AppFooter/AppFooter";
import AppHeader from "@/components/AppHeader/AppHeader";
import { GridTable } from "@/components/GridTable/GridTable";
import { MobileToolbar } from "@/components/MobileToolbar/MobileToolbar";
import { ShipSelection } from "@/components/ShipSelection/ShipSelection";
import { TechTree, TechTreeSkeleton } from "@/components/TechTree/TechTree";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useIdleMount } from "@/hooks/useIdleMount/useIdleMount";
import { useOptimize } from "@/hooks/useOptimize/useOptimize";
import { useToast } from "@/hooks/useToast/useToast";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useOptimizeStore, useUiStore } from "@/store/ui/uiStore";
import { lazyNamed } from "@/utils/system/lazyNamed";

/**
 * Lazy-loaded dialog warning when a technology layout hits a Pattern No Fit state.
 */
const OptimizationAlertDialog = lazyNamed(
	() => import("@/components/AppDialog/OptimizationAlert/OptimizationAlertDialog"),
);

/**
 * Lazy-loaded prompt encouraging PWA installation on supported browsers.
 */
const InstallPrompt = lazyNamed(
	() => import("@/components/InstallPrompt/InstallPrompt"),
	"InstallPrompt",
);

/**
 * Lazy-loaded renderer for active toast notifications.
 */
const ToastRenderer = lazyNamed(() => import("@/components/Toast/ToastRenderer"), "ToastRenderer");

/**
 * Deferred background dialogs and toast renderer mounted on browser idle.
 */
const MainAppBackgroundServices: React.FC = () => {
	const mount = useIdleMount();

	if (!mount) return null;

	return (
		<Suspense fallback={null}>
			<InstallPrompt />
			<OptimizationAlertDialog />
			<ToastRenderer />
		</Suspense>
	);
};

/**
 * Renders the mobile toolbar on viewports under 640px.
 */
const MainAppMobileToolbar: React.FC = () => {
	const isSmallScreen = !useBreakpoint("640px");

	if (!isSmallScreen) return null;

	return <MobileToolbar />;
};

/**
 * Renders the application footer for the active desktop or mobile breakpoint.
 */
const MainAppFooter: React.FC<{ position: "bottom-desktop" | "bottom-mobile" }> = ({
	position,
}) => {
	const isLargeScreen = useBreakpoint("1024px");

	if (position === "bottom-mobile" && isLargeScreen) return null;
	if (position === "bottom-desktop" && !isLargeScreen) return null;

	return (
		<div className={position === "bottom-mobile" ? "main-app__footer-wrapper" : ""}>
			<AppFooter />
		</div>
	);
};

/**
 * Renders the Platform Type selector heading and the technology grid table,
 * synchronizing container and table dimensions to {@link useUiStore} synchronously
 * before first paint and via `ResizeObserver` on subsequent resize events.
 */
const MainAppGridSection: React.FC = () => {
	const { t } = useTranslation();
	const containerRef = useRef<HTMLDivElement>(null);
	const gridTableRef = useRef<HTMLDivElement>(null);

	const gridTableTotalWidth = useUiStore((state) => state.gridTableWidth);
	const setGridHeight = useUiStore((state) => state.setGridSectionHeight);
	const setGridTableWidth = useUiStore((state) => state.setGridTableWidth);
	const isLarge = useBreakpoint("1024px");

	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform);
	const solving = useOptimizeStore((state) => state.status.type === "solving");

	useLayoutEffect(() => {
		const containerElement = containerRef.current;
		const gridTableElement = gridTableRef.current;

		if (containerElement) {
			if (isLarge) {
				const initialHeight = Math.round(containerElement.getBoundingClientRect().height);

				if (initialHeight > 0) {
					setGridHeight(initialHeight);
				}
			} else {
				setGridHeight(null);
			}
		}

		if (gridTableElement) {
			const initialWidth = Math.round(gridTableElement.getBoundingClientRect().width);

			if (initialWidth > 0) {
				setGridTableWidth(initialWidth);
			}
		}

		const observer = new ResizeObserver((entries) => {
			window.requestAnimationFrame(() => {
				for (const entry of entries) {
					if (entry.target === containerElement) {
						if (isLarge) {
							setGridHeight(Math.round(entry.contentRect.height));
						} else {
							setGridHeight(null);
						}
					} else if (entry.target === gridTableElement) {
						setGridTableWidth(Math.round(entry.contentRect.width));
					}
				}
			});
		});

		if (containerElement) {
			observer.observe(containerElement);
		}

		if (gridTableElement) {
			observer.observe(gridTableElement);
		}

		return () => {
			observer.disconnect();
		};
	}, [isLarge, setGridHeight, setGridTableWidth]);

	return (
		<Box
			className="main-app__grid-section relative"
			flexShrink={{ initial: "1", md: "0" }}
			ref={containerRef}
		>
			<Flex
				align="center"
				className="main-app__ship-selector heading-styled"
				gap="3"
				style={{
					maxWidth: gridTableTotalWidth ? `${gridTableTotalWidth}px` : undefined,
				}}
				wrap="wrap"
			>
				<span className="main-app__ship-selection">
					<ShipSelection
						disabled={isSharedGrid}
						solving={solving}
					/>
				</span>

				<Text
					className="main-app__ship-label"
					style={{ opacity: solving ? 0.365 : 1 }}
					trim={{ initial: "end", md: "normal" }}
				>
					{t("platformLabel")}
				</Text>
				<Text
					className="main-app__ship-name trim-text"
					style={{ opacity: solving ? 0.365 : 1 }}
					trim={{ initial: "end", md: "normal" }}
				>
					{t(`platforms.${selectedPlatform}`)}
				</Text>
			</Flex>

			<GridTable
				ref={gridTableRef}
				solving={solving}
			/>
		</Box>
	);
};

/**
 * Renders the technology tree sidebar section, or `null` when viewing a Shared Grid.
 */
const MainAppSidebarSection: React.FC = () => {
	const gridHeight = useUiStore((state) => state.gridSectionHeight);
	const gridTableTotalWidth = useUiStore((state) => state.gridTableWidth);
	const isLargeScreen = useBreakpoint("1024px");
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);

	if (isSharedGrid) return null;

	return (
		<Flex
			className="main-app__tech-tree-section"
			direction="column"
			minHeight="0"
			ml={{ md: "5" }}
			mt="0"
			style={{
				height: isLargeScreen && gridHeight ? `${gridHeight}px` : undefined,
			}}
			width={!isLargeScreen && gridTableTotalWidth ? `${gridTableTotalWidth}px` : "100%"}
		>
			<Suspense fallback={<TechTreeSkeleton height={gridHeight} />}>
				<Flex
					direction="column"
					height="100%"
					minHeight="0"
				>
					<TechTree />
				</Flex>
			</Suspense>
		</Flex>
	);
};

/**
 * Primary workspace layout module for the application's main functional area.
 *
 * @remarks
 * Coordinates workspace-level lifecycle effects (Shared Grid notifications and `ResizeObserver`
 * layout measurements), triggers initial Platform Type loading via Suspense, and renders the
 * header, Platform Type selector, technology grid, sidebar, and footers.
 *
 * @returns The orchestrated main application workspace.
 *
 * @see {@link ./MainAppContent.test.tsx Unit Tests}
 * @see {@link ./MainAppContent.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <MainAppContent />
 * // mounts MainAppContent workspace
 * ```
 */
export const MainAppContent: React.FC = () => {
	const { t } = useTranslation();
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const { showInfo } = useToast();
	const { gridContainerRef } = useOptimize();

	useEffect(() => {
		if (isSharedGrid) {
			showInfo(
				t("common.information", "Information"),
				<Trans
					components={{ strong: <strong /> }}
					i18nKey="mainApp.viewingSharedBuild"
				/>,
			);
		}
	}, [isSharedGrid, showInfo, t]);

	return (
		<>
			<MainAppMobileToolbar />

			<Button
				asChild
				className="main-app__skip-link pt-3"
				size="2"
				variant="soft"
			>
				<a href="#main-content">Skip to Main Content</a>
			</Button>
			<div className="main-app__container">
				<div className="main-app__card lg:shadow-lg">
					<div className="main-app__background-wrapper">
						<AppHeader />

						<Flex
							align={{ initial: "center", md: "start" }}
							asChild
							className="main-app__content"
							direction={{ initial: "column", md: "row" }}
							ref={gridContainerRef}
						>
							<main id="main-content">
								<MainAppGridSection />
								<MainAppSidebarSection />
							</main>
						</Flex>
					</div>

					<MainAppFooter position="bottom-mobile" />
				</div>

				<MainAppFooter position="bottom-desktop" />

				<MainAppBackgroundServices />
			</div>
		</>
	);
};
