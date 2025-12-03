import React from "react";
import { createGrid, useGridStore } from "../src/store/GridStore";
import { usePlatformStore } from "../src/store/PlatformStore";
import { useTechTreeLoadingStore } from "../src/store/TechTreeLoadingStore";
import { useTechStore } from "../src/store/TechStore";

export const ThemeWrapper = ({
    children,
    theme,
}: {
    children: React.ReactNode;
    theme: string;
}) => {
    React.useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    return <>{children}</>;
};

export const StoreResetWrapper = ({ children }: { children: React.ReactNode }) => {
    React.useEffect(() => {
        // Reset GridStore
        useGridStore.setState({
            grid: createGrid(10, 6),
            result: null,
            isSharedGrid: false,
            gridFixed: false,
            superchargedFixed: false,
        });

        // Reset PlatformStore
        usePlatformStore.setState({ selectedPlatform: "standard" });

        // Reset TechTreeLoadingStore
        useTechTreeLoadingStore.setState({ isLoading: false });

        // Reset TechStore (basic reset, full reset might need more data if available)
        useTechStore.setState({
            techColors: {},
            techGroups: {},
            max_bonus: {},
            solved_bonus: {},
            solve_method: {},
            checkedModules: {},
            activeGroups: {},
        });
    }, []);

    return <>{children}</>;
};
