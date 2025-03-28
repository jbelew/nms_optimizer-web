// src/components/GridContainer/GridContainer.tsx
import React, { useState, useEffect, useRef } from "react";
import GridTable from "../GridTable/GridTable";
import TechTreeComponent from "../TechTree/TechTree";
import { useGridStore } from "../../store/useGridStore";
import { useOptimize } from "../../hooks/useOptimize";
import { Box, Flex, ScrollArea } from "@radix-ui/themes";
import { useBreakpoint } from "../../hooks/useBreakpoint"; // Import useBreakpoint

interface GridContainerProps {
  setShowChangeLog: React.Dispatch<React.SetStateAction<boolean>>;
  setShowInstructions: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * GridContainer component responsible for rendering the grid and its associated sidebar.
 * It displays the grid and tech tree components while managing layout and responsive behavior.
 *
 * @param {GridContainerProps} props - The properties passed to the component.
 * @param {function} props.setShowChangeLog - Function to toggle the change log visibility.
 * @param {function} props.setShowInstructions - Function to toggle the instructions visibility.
 * @returns {JSX.Element} The rendered GridContainer component.
 */
const GridContainer: React.FC<GridContainerProps> = ({ setShowChangeLog, setShowInstructions }) => {
  const { solving, handleOptimize, gridContainerRef } = useOptimize(); // Get gridContainerRef from useOptimize hook
  const { grid, result, activateRow, deActivateRow, resetGrid } = useGridStore(); // Get grid-related actions and data

  const gridRef = useRef<HTMLDivElement>(null); // Ref for the grid element

  const [gridHeight, setGridHeight] = useState<number | null>(null); // State for storing the grid height
  const isLarge = useBreakpoint("1024px"); // Check if the viewport is large based on a breakpoint

  useEffect(() => {
    // Effect to update grid height on mount and when grid changes
    const updateGridHeight = () => {
      const gridElement = document.querySelector(".gridContainer__grid");
      if (gridElement) {
        setGridHeight(gridElement.getBoundingClientRect().height);
      }
    };

    updateGridHeight(); // Initial calculation
    window.addEventListener("resize", updateGridHeight); // Update on window resize
    return () => window.removeEventListener("resize", updateGridHeight); // Cleanup listener on unmount
  }, [grid]);

  const handleOptimizeWrapper = (tech: string) => {
    return handleOptimize(tech);
  };
  
  return (
    <Box className="pt-1 md:pt-2 gridContainer" ref={gridContainerRef}>
      <Flex className="flex-col items-start gridContainer__layout lg:flex-row">
        {/* Main Content */}
        <Box className="flex-grow w-auto gridContainer__grid lg:flex-shrink-0" ref={gridRef}>
          <GridTable
            grid={grid}
            solving={solving}
            result={result}
            activateRow={activateRow}
            deActivateRow={deActivateRow}
            resetGrid={resetGrid}
            setShowChangeLog={setShowChangeLog}
            setShowInstructions={setShowInstructions}
          />
        </Box>

        {/* Sidebar */}
        {isLarge ? (
          <ScrollArea
            className="p-4 ml-4 rounded-xl gridContainer__sidebar"
            style={{
              height: `${gridHeight}px`,
            }}
          >
            <TechTreeComponent handleOptimize={handleOptimizeWrapper} solving={solving} />
          </ScrollArea>
        ) : (
          <Box className="z-10 items-start flex-grow-0 flex-shrink-0 w-full pt-8">
            <TechTreeComponent handleOptimize={handleOptimizeWrapper} solving={solving} />
          </Box>
        )}
      </Flex>
    </Box>
  );
};
export default GridContainer;
