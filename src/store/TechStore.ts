// src/store/TechStore.ts
import { create } from "zustand";

import { TechTreeItem } from "../hooks/useTechTree/useTechTree";

/**
 * @interface TechState
 * @property {{[key: string]: number}} max_bonus - A map of technology keys to their maximum potential bonus.
 * @property {{[key: string]: number}} solved_bonus - A map of technology keys to their solved bonus.
 * @property {{[key: string]: string}} solve_method - A map of technology keys to the method used to solve them.
 * @property {{[key: string]: string}} techColors - A map of technology keys to their colors.
 * @property {{[key: string]: string[]}} checkedModules - A map of technology keys to their checked modules.
 * @property {{[key: string]: TechTreeItem[]}} techGroups - A map of technology keys to their tech groups.
 * @property {{[key: string]: string}} activeGroups - A map of technology keys to their active group.
 * @property {(tech: string) => void} clearTechMaxBonus - Function to clear the max bonus for a technology.
 * @property {(tech: string, bonus: number) => void} setTechMaxBonus - Function to set the max bonus for a technology.
 * @property {(tech: string) => void} clearTechSolvedBonus - Function to clear the solved bonus for a technology.
 * @property {(tech: string, bonus: number) => void} setTechSolvedBonus - Function to set the solved bonus for a technology.
 * @property {(tech: string, method: string) => void} setTechSolveMethod - Function to set the solve method for a technology.
 * @property {(colors: {[key: string]: string}) => void} setTechColors - Function to set the tech colors.
 * @property {(tech: string) => string|undefined} getTechColor - Function to get the color for a technology.
 * @property {(tech: string, updater: (prev?: string[]) => string[]) => void} setCheckedModules - Function to set the checked modules for a technology.
 * @property {(tech: string) => void} clearCheckedModules - Function to clear the checked modules for a technology.
 * @property {() => void} clearResult - Function to clear the result state.
 * @property {(techGroups: {[key: string]: TechTreeItem[]}) => void} setTechGroups - Function to set the tech groups.
 * @property {(tech: string, groupType: string) => void} setActiveGroup - Function to set the active group for a technology.
 */
export interface TechState {
	max_bonus: { [key: string]: number };
	solved_bonus: { [key: string]: number };
	solve_method: { [key: string]: string };
	techColors: { [key: string]: string };
	checkedModules: { [key: string]: string[] };
	techGroups: { [key: string]: TechTreeItem[] };
	activeGroups: { [key: string]: string };
	clearTechMaxBonus: (tech: string) => void;
	setTechMaxBonus: (tech: string, bonus: number) => void;
	clearTechSolvedBonus: (tech: string) => void;
	setTechSolvedBonus: (tech: string, bonus: number) => void;
	setTechSolveMethod: (tech: string, method: string) => void;
	setTechColors: (colors: { [key: string]: string }) => void;
	getTechColor: (tech: string) => string | undefined;
	setCheckedModules: (tech: string, updater: (prev?: string[]) => string[]) => void;
	clearCheckedModules: (tech: string) => void;
	clearResult: () => void;
	setTechGroups: (techGroups: { [key: string]: TechTreeItem[] }) => void;
	setActiveGroup: (tech: string, groupType: string) => void;
}

/**
 * Zustand store for managing the state of technologies.
 */
export const useTechStore = create<TechState>((set, get) => ({
	// Note the 'get' parameter
	max_bonus: {},
	solved_bonus: {},
	solve_method: {},
	techColors: {},
	checkedModules: {},
	techGroups: {},
	activeGroups: {},
	clearTechMaxBonus: (tech) =>
		set((state) => ({
			max_bonus: { ...state.max_bonus, [tech]: 0 },
		})),
	setTechMaxBonus: (tech, max_bonus) =>
		set((state) => ({
			max_bonus: { ...state.max_bonus, [tech]: max_bonus },
		})),
	clearTechSolvedBonus: (tech) =>
		set((state) => ({
			solved_bonus: { ...state.solved_bonus, [tech]: 0 },
		})),
	setTechSolvedBonus: (tech, bonus) =>
		set((state) => ({
			solved_bonus: { ...state.solved_bonus, [tech]: bonus },
		})),
	setTechSolveMethod: (tech, solve_method) =>
		set((state) => ({
			solve_method: { ...state.solve_method, [tech]: solve_method },
		})),
	setTechColors: (colors) => set({ techColors: colors }),
	getTechColor: (tech) => get().techColors[tech], // Access state using 'get'
	setCheckedModules: (tech, updater) =>
		set((state) => ({
			checkedModules: {
				...state.checkedModules,
				[tech]: updater(state.checkedModules[tech]),
			},
		})),
	clearCheckedModules: (tech) =>
		set((state) => ({
			checkedModules: { ...state.checkedModules, [tech]: [] },
		})),
	clearResult: () => set({ max_bonus: {}, solved_bonus: {} }), // Implement clearResult
	setTechGroups: (techGroups) => set({ techGroups }),
	setActiveGroup: (tech, groupType) =>
		set((state) => ({
			activeGroups: { ...state.activeGroups, [tech]: groupType },
		})),
}));
