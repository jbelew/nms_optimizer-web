import React from "react";
import { createGrid, useGridStore } from "../src/store/grid/gridStore";
import { usePlatformStore } from "../src/store/app/platformStore";
import { useTechTreeLoadingStore } from "../src/store/tech/techTreeLoadingStore";
import { useTechStore } from "../src/store/tech/techStore";

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
export const ThemeWrapper = ({
    children,
    theme,
}: {
    children: React.ReactNode;
    theme: string;
}) => {
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
 * A utility component that resets all global Zustand stores to their initial states.
 *
 * This ensures that Storybook stories start with a clean state and do not bleed
 * data between different components or variations.
 *
 * @param {object} props - Component properties.
 * @param {React.ReactNode} props.children - Component subtree.
 * @returns {JSX.Element} The rendered subtree.
 *
 * @example Storybook usage
 * ```tsx
 * <StoreResetWrapper><MyComponent /></StoreResetWrapper>
 * ```
 */
export const StoreResetWrapper = ({ children }: { children: React.ReactNode }) => {
    React.useEffect(() => {
        // Reset GridStore
        useGridStore.setState({
            grid: createGrid(10, 6),
            gridFixed: false,
            isSharedGrid: false,
            result: null,
            superchargedFixed: false,
        });

        // Reset PlatformStore
        usePlatformStore.setState({ selectedPlatform: "standard" });

        // Reset TechTreeLoadingStore
        useTechTreeLoadingStore.setState({ isLoading: false });

        // Reset TechStore (basic reset, full reset might need more data if available)
        useTechStore.setState({
            activeGroups: {},
            checkedModules: {},
            max_bonus: {},
            solve_method: {},
            solved_bonus: {},
            techColors: {},
            techGroups: {},
        });
    }, []);

    return <>{children}</>;
};
