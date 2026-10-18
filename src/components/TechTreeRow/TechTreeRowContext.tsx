import type { TechTreeRowProps } from "@/types/props";
import React, { useMemo } from "react";

import { TechTreeRowContext } from "./createTechTreeRowContext";
import { useTechTreeRow } from "./useTechTreeRow";

/**
 * Context provider for a single Technology Category row in the sidebar.
 *
 * @param {{ children: React.ReactNode, props: TechTreeRowProps }} params - Provider props.
 *
 * @returns {JSX.Element} Context provider wrapping the technology row.
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <TechTreeRowProvider props={{ tech: "pulse", techColor: "blue", techImage: "pulse.webp" }}>
 *   <TechTreeRowContent />
 * </TechTreeRowProvider>
 * // mounts TechTreeRowContext.Provider with useTechTreeRow state
 * ```
 */
export const TechTreeRowProvider: React.FC<{
	children: React.ReactNode;
	props: TechTreeRowProps;
}> = ({ children, props }) => {
	const hookData = useTechTreeRow(props);

	const contextValue = useMemo(() => hookData, [hookData]);

	return (
		<TechTreeRowContext.Provider value={contextValue}>{children}</TechTreeRowContext.Provider>
	);
};
