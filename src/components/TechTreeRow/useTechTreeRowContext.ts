import { use } from "react";

import { TechTreeRowContext } from "./createTechTreeRowContext";

/**
 * Hook to consume the TechTreeRow context.
 *
 * @returns {import('./createTechTreeRowContext').TechTreeRowContextValue} The tech tree row context value.
 *
 * @throws {Error} If used outside of a TechTreeRowProvider.
 *
 */
export const useTechTreeRowContext = () => {
	const context = use(TechTreeRowContext);

	if (!context) {
		throw new Error("useTechTreeRowContext must be used within a TechTreeRowProvider");
	}

	return context;
};
