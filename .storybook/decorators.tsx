import React from "react";

import { usePlatformStore } from "../src/store/app/platformStore";
import { createGrid, useGridStore } from "../src/store/grid/gridStore";
import { useTechStore } from "../src/store/tech/techStore";
import { useUiStore } from "../src/store/ui/uiStore";

/**
 * A wrapper component that applies the dark/light theme class to the document root safely.
 *
 * @param {object} props - Component properties.
 * @param {React.ReactNode} props.children - Component subtree.
 * @param {string} props.theme - The active theme ('light' or 'dark').
 * @returns {JSX.Element} The rendered subtree.
 *
 * @example Storybook usage
 * ```tsx
 * <ThemeWrapper theme="dark"><MyComponent /></ThemeWrapper>
 * ```
 */
export const ThemeWrapper = ({ children, theme }: { children: React.ReactNode; theme: string }) => {
	React.useEffect(() => {
		if (theme === "dark") {
			document.documentElement.classList.add("dark", "dark-theme");
			document.documentElement.classList.remove("light", "light-theme");
		} else {
			document.documentElement.classList.add("light", "light-theme");
			document.documentElement.classList.remove("dark", "dark-theme");
		}
	}, [theme]);

	return <>{children}</>;
};

/**
 * Resets all global Zustand stores to their clean baseline states.
 *
 * @returns Side-effects only.
 */
const resetAllStores = (): void => {
	useGridStore.setState({
		activeTechs: new Set<string>(),
		grid: createGrid(10, 6),
		gridFixed: false,
		isGridFull: false,
		isSharedGrid: false,
		result: null,
		superchargedFixed: false,
	});

	usePlatformStore.setState({ selectedPlatform: "standard" });

	useUiStore.setState({
		isModuleSelectionDialogOpen: false,
		isTechTreeLoading: false,
		optimizeStatus: { type: "idle" },
		selectedTechData: null,
		shakeCount: 0,
	});

	useTechStore.setState({
		activeGroups: {},
		bonusStatus: {},
		checkedModules: {},
		maxBonus: {},
		solvedBonus: {},
		solveMethod: {},
		techColors: {},
		techGroups: {},
	});
};

/**
 * A utility component that resets all global Zustand stores synchronously before a story mounts.
 *
 * Performing the reset in a `useState` lazy initializer on mount (with `key={context.id}` on the
 * wrapper) ensures that stores are reset during the top-down render pass before any child story
 * decorators or component effects run.
 *
 * @param {object} props - Component properties.
 * @param {React.ReactNode} props.children - Component subtree.
 * @returns {JSX.Element} The rendered subtree.
 *
 * @example Storybook usage
 * ```tsx
 * <StoreResetWrapper key={context.id}><MyComponent /></StoreResetWrapper>
 * ```
 */
export const StoreResetWrapper = ({ children }: { children: React.ReactNode }) => {
	React.useState(() => {
		resetAllStores();

		return true;
	});

	return <>{children}</>;
};
