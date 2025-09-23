import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGridStore } from "../../../store/GridStore";
import { useTechStore } from "../../../store/TechStore";
import { TechTreeRowProps } from "../TechTreeRow";

const EMPTY_ARRAY: string[] = [];

export const useTechTreeRowState = (tech: string, techImage: string | null) => {
	const { t } = useTranslation();

	const { hasTechInGrid } = useGridStore();
	const { techGroups, activeGroups, max_bonus, solved_bonus, checkedModules } =
		useTechStore();

	const activeGroup = useMemo(() => {
		const groupType = activeGroups[tech] || "normal";
		return techGroups[tech]?.find((g) => g.type === groupType) || techGroups[tech]?.[0];
	}, [tech, activeGroups, techGroups]);

	const rewardModules = useMemo(() => {
		return (
			activeGroup?.modules.filter((m) => m.type === "reward") ||
			([] as { label: string; id: string; image: string; type?: string }[])
		);
	}, [activeGroup]);

	const hasRewardModules = rewardModules.length > 0;
	const moduleCount = (activeGroup?.module_count || 0) - rewardModules.length;

	const techMaxBonus = max_bonus?.[tech] ?? 0;
	const techSolvedBonus = solved_bonus?.[tech] ?? 0;

	const translationKeyPart = techImage
		? techImage.replace(/\.\w+$/, "").replace(/\//g, ".")
		: tech;
	const translatedTechName = t(`technologies.${translationKeyPart}`);

	const currentCheckedModules = checkedModules[tech] || EMPTY_ARRAY;

	const baseImagePath = "/assets/img/tech/";
	const fallbackImage = `${baseImagePath}infra.webp`;
	const imagePath = techImage ? `${baseImagePath}${techImage}` : fallbackImage;
	const imagePath2x = techImage
		? `${baseImagePath}${techImage.replace(/\.(webp|png|jpg|jpeg)$/, "@2x.$1")}`
		: fallbackImage.replace(/\.(webp|png|jpg|jpeg)$/, "@2x.$1");

	const hasMultipleGroups = (techGroups[tech]?.length || 0) > 1;

	return {
		hasTechInGrid: hasTechInGrid(tech),
		activeGroup,
		rewardModules,
		hasRewardModules,
		moduleCount,
		techMaxBonus,
		techSolvedBonus,
		translatedTechName,
		currentCheckedModules,
		imagePath,
		imagePath2x,
		hasMultipleGroups,
	};
};
