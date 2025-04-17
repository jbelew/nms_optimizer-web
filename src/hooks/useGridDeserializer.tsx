// src/hooks/useGridDeserializer.tsx
import { useCallback, useEffect } from "react";
import { useGridStore, Grid, createGrid } from "../store/GridStore"; // Import Cell type
import { API_URL } from "../constants";
import { useShipTypesStore } from "./useShipTypes";
import { useTechStore } from "../store/TechStore"; // <--- Import useTechStore

// --- Interfaces ---
interface Module {
  id: string;
  tech: string;
  label: string;
  image: string;
  bonus?: number;
  value?: number;
  adjacency: boolean;
  sc_eligible: boolean;
  color?: string; // Add color if it comes from the API module data
}

interface TechTreeItem {
  label: string;
  key: string;
  modules: Module[];
  image: string | null;
  color: string; // Tech color is here
}

interface TechTree {
  [key: string]: TechTreeItem[];
}


// --- Utility Functions (RLE Compress/Decompress) ---
const compressRLE = (input: string): string => {
  if (!input) return "";
  let compressed = "";
  let count = 1;
  for (let i = 0; i < input.length; i++) {
    if (i + 1 < input.length && input[i] === input[i + 1]) {
      count++;
    } else {
      compressed += input[i];
      if (count > 1) {
        compressed += count.toString();
      }
      count = 1;
    }
  }
  return compressed;
};

const decompressRLE = (input: string): string => {
  if (!input) return "";
  let decompressed = "";
  let i = 0;
  while (i < input.length) {
    const currentChar = input[i];
    i++; // Move past the character
    let countStr = "";
    while (i < input.length && !isNaN(parseInt(input[i]))) {
      countStr += input[i];
      i++;
    }
    const count = countStr ? parseInt(countStr) : 1;
    decompressed += currentChar.repeat(count);
  }
  return decompressed;
};


// --- Grid Serialization/Deserialization Logic ---
const serialize = (grid: Grid): string => {
  let gridString = ""; // Raw grid string (0, 1, 2)
  let techString = "";
  let moduleString = "";
  let adjBonusString = ""; // String for adjacency_bonus status ('T'/'F')
  const techMap: { [key: string]: string } = {};
  const moduleMap: { [key: string]: string } = {};
  let nextTechCode = 3;
  let nextModuleCode = 0;

  for (const row of grid.cells) {
    for (const cell of row) {
      // Grid state (active/supercharged)
      gridString += cell.active ? (cell.supercharged ? "2" : "1") : "0";

      // Tech mapping
      techString += cell.tech ? (techMap[cell.tech] || (techMap[cell.tech] = String.fromCharCode(nextTechCode++))) : " ";

      // Module mapping
      moduleString += cell.module ? (moduleMap[cell.module] || (moduleMap[cell.module] = String.fromCharCode(nextModuleCode++ + 65))) : " ";

      // Adjacency Bonus status
      adjBonusString += (cell.adjacency_bonus ?? 0) > 0 ? "T" : "F";
    }
  }

  // Compress the other strings
  const compressedTech = compressRLE(techString);
  const compressedModule = compressRLE(moduleString);
  const compressedAdjBonus = compressRLE(adjBonusString);

  const techMapString = Object.entries(techMap).map(([key, value]) => `${key}:${value}`).join(",");
  const moduleMapString = Object.entries(moduleMap).map(([key, value]) => `${key}:${value}`).join(",");

  // Format: gridString|compressedTech|compressedModule|compressedAdjBonus|techMap|moduleMap
  return encodeURIComponent(`${gridString}|${compressedTech}|${compressedModule}|${compressedAdjBonus}|${techMapString}|${moduleMapString}`);
};

// --- CHANGE: Add setTechColors as an argument ---
const deserialize = async (
    serializedGrid: string,
    shipType: string,
    setTechColors: (colors: { [key: string]: string }) => void // <-- Add parameter
): Promise<Grid | null> => {
  try {
    if (!serializedGrid) {
      console.warn("No serialized grid data found. Skipping deserialization.");
      return null;
    }

    const decoded = decodeURIComponent(serializedGrid);
    if (!decoded) {
      console.error("Failed to decodeURIComponent. Skipping deserialization.");
      return null;
    }

    // Format: gridString|compressedTech|compressedModule|compressedAdjBonus|techMap|moduleMap
    const parts = decoded.split("|");
    if (parts.length !== 6) {
        console.error("Invalid serialized grid format. Incorrect number of parts. Expected 6, got", parts.length, "Skipping deserialization.");
        return null;
    }

    const [gridString, compressedTech, compressedModule, compressedAdjBonus, techMapString, moduleMapString] = parts;

    if ([gridString, compressedTech, compressedModule, compressedAdjBonus, techMapString, moduleMapString].some((part) => part === undefined)) {
      console.error("Invalid serialized grid format. Missing parts. Skipping deserialization.");
      return null;
    }

    // Decompress the other strings
    const decompressedTech = decompressRLE(compressedTech);
    const decompressedModule = decompressRLE(compressedModule);
    const decompressedAdjBonus = decompressRLE(compressedAdjBonus);

    const expectedLength = 6 * 10; // height * width
    if (gridString.length !== expectedLength || decompressedTech.length !== expectedLength || decompressedModule.length !== expectedLength || decompressedAdjBonus.length !== expectedLength) {
        console.error(`Invalid serialized grid format: String length mismatch. Expected ${expectedLength}. Got Grid: ${gridString.length}, Tech: ${decompressedTech.length}, Module: ${decompressedModule.length}, AdjBonus: ${decompressedAdjBonus.length}. Skipping deserialization.`);
        return null;
    }

    // --- Maps ---
    const techMap = (techMapString || "").split(",").reduce((acc: { [key: string]: string }, entry) => {
      if (!entry) return acc;
      const [key, value] = entry.split(":");
      if (key && value) acc[value] = key;
      return acc;
    }, {});
    const moduleMap = (moduleMapString || "").split(",").reduce((acc: { [key: string]: string }, entry) => {
      if (!entry) return acc;
      const [key, value] = entry.split(":");
      if (key && value) acc[value] = key;
      return acc;
    }, {});

    // --- Fetch Tech Tree Data ---
    const modulesResponse = await fetch(`${API_URL}/tech_tree/${shipType}`);
    if (!modulesResponse.ok) {
      throw new Error(`Failed to fetch modules: ${modulesResponse.status} ${modulesResponse.statusText}`);
    }
    const techTreeData: TechTree = await modulesResponse.json();

    // --- CHANGE: Extract and set tech colors ---
    const colors: { [key: string]: string } = {};
    const modulesMap: { [techKey: string]: { [moduleId: string]: Module } } = {};
    for (const techCategory in techTreeData) {
      const techTreeItems = techTreeData[techCategory];
      for (const techTreeItem of techTreeItems) {
        colors[techTreeItem.key] = techTreeItem.color; // Extract color
        modulesMap[techTreeItem.key] = modulesMap[techTreeItem.key] || {};
        for (const module of techTreeItem.modules) {
          modulesMap[techTreeItem.key][module.id] = module;
        }
      }
    }
    setTechColors(colors); // <-- Set colors in the store
    // --- End Color Change ---

    const newGrid = createGrid(10, 6);

    // --- Grid Population Loop ---
    let index = 0;
    for (let r = 0; r < newGrid.height; r++) {
      for (let c = 0; c < newGrid.width; c++) {
        const gridChar = gridString[index];
        newGrid.cells[r][c].active = gridChar !== "0";
        newGrid.cells[r][c].supercharged = gridChar === "2";

        const techChar = decompressedTech[index];
        const techName = techChar === " " ? null : techMap[techChar];
        const moduleChar = decompressedModule[index];
        const moduleId = moduleChar === " " ? null : moduleMap[moduleChar];
        const adjBonusChar = decompressedAdjBonus[index];

        // Reset cell properties
        newGrid.cells[r][c].tech = techName;
        newGrid.cells[r][c].module = null;
        newGrid.cells[r][c].label = "";
        newGrid.cells[r][c].image = null;
        newGrid.cells[r][c].bonus = 0.0;
        newGrid.cells[r][c].value = 0;
        newGrid.cells[r][c].adjacency = false;
        newGrid.cells[r][c].adjacency_bonus = adjBonusChar === "T" ? 1.0 : 0.0;
        newGrid.cells[r][c].sc_eligible = false;

        if (moduleId && techName) {
          const moduleData = modulesMap[techName]?.[moduleId];
          if (moduleData) {
            newGrid.cells[r][c].module = moduleData.id;
            newGrid.cells[r][c].label = moduleData.label;
            newGrid.cells[r][c].image = moduleData.image;
            newGrid.cells[r][c].bonus = moduleData.bonus || 0.0;
            newGrid.cells[r][c].value = moduleData.value || 0;
            newGrid.cells[r][c].adjacency = moduleData.adjacency;
            newGrid.cells[r][c].sc_eligible = moduleData.sc_eligible;
          } else {
            console.warn(`Module data not found for tech: ${techName}, module ID: ${moduleId}. Cell state might be incomplete.`);
          }
        }
        index++;
      }
    }
    console.log("Deserialized Grid (using raw gridString):", newGrid);
    return newGrid;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error deserializing grid:", error.message, error.stack);
    } else {
      console.error("An unknown error occurred during grid deserialization:", error);
    }
    return null;
  }
};

// --- React Hook (useGridDeserializer) ---
export const useGridDeserializer = () => {
  const { setGrid, grid, setIsSharedGrid } = useGridStore();
  const selectedShipType = useShipTypesStore((state) => state.selectedShipType);
  const { setTechColors } = useTechStore(); // <-- Get setTechColors from the store

  const serializeGrid = useCallback((): string => {
    return serialize(grid);
  }, [grid]);

  const deserializeGrid = useCallback(async (serializedGrid: string) => {
    console.log("Attempting to deserialize:", serializedGrid);
    // --- CHANGE: Pass setTechColors to deserialize ---
    const newGrid = await deserialize(serializedGrid, selectedShipType, setTechColors);
    if (newGrid) {
      console.log("Deserialization successful, setting grid and colors.");
      setGrid(newGrid); // Update grid state
      setIsSharedGrid(true);
    } else {
      console.error("Deserialization failed, grid not set.");
    }
    // --- End Change ---
  }, [setGrid, selectedShipType, setIsSharedGrid, setTechColors]); // <-- Add setTechColors dependency

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serializedGridParam = urlParams.get("grid");
    if (serializedGridParam) {
        console.log("Found 'grid' URL parameter, attempting deserialization.");
        deserializeGrid(serializedGridParam);
    } else {
        console.log("No 'grid' URL parameter found.");
    }
  }, [deserializeGrid]); // Dependency array is correct

  return { serializeGrid, deserializeGrid };
};
