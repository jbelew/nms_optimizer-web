import { useCallback } from "react";
import { useGridStore } from "../../../store/GridStore";
import { useShakeStore } from "../../../store/ShakeStore";
import { useTechStore } from "../../../store/TechStore";

export const useTechTreeRowHandlers = (
	tech: string,
	handleOptimize: (tech: string) => Promise<void>,
	isGridFull: boolean,
	hasTechInGrid: boolean
) => {
	const { resetGridTech } = useGridStore();
	const { clearTechMaxBonus, clearTechSolvedBonus, setCheckedModules, setActiveGroup } =
		useTechStore();
	const { setShaking } = useShakeStore();

	const handleReset = useCallback(() => {
		resetGridTech(tech);
		clearTechMaxBonus(tech);
		clearTechSolvedBonus(tech);
	}, [tech, resetGridTech, clearTechMaxBonus, clearTechSolvedBonus]);

	const handleCheckboxChange = useCallback(
		(moduleId: string) => {
			setCheckedModules(tech, (prevChecked = []) => {
				const isChecked = prevChecked.includes(moduleId);
				return isChecked
					? prevChecked.filter((id) => id !== moduleId)
					: [...prevChecked, moduleId];
			});
		},
		[tech, setCheckedModules]
	);

	const handleAllCheckboxesChange = useCallback(
		(moduleIds: string[]) => {
			setCheckedModules(tech, () => moduleIds);
		},
		[tech, setCheckedModules]
	);

	const handleOptimizeClick = useCallback(async () => {
		if (isGridFull && !hasTechInGrid) {
			setShaking(true);
			setTimeout(() => {
				setShaking(false);
			}, 500);
		} else {
			resetGridTech(tech);
			clearTechMaxBonus(tech);
			clearTechSolvedBonus(tech);
			await handleOptimize(tech);
		}
	}, [
		isGridFull,
		hasTechInGrid,
		setShaking,
		resetGridTech,
		clearTechMaxBonus,
		clearTechSolvedBonus,
		handleOptimize,
		tech,
	]);

	const handleGroupChange = useCallback(
		(checked: boolean) => {
			setActiveGroup(tech, checked ? "max" : "normal");
		},
		[tech, setActiveGroup]
	);

	return {
		handleReset,
		handleCheckboxChange,
		handleAllCheckboxesChange,
		handleOptimizeClick,
		handleGroupChange,
	};
};
