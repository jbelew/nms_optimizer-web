import React from "react";

import { useMainAppLogic } from "./useMainAppLogic";

/**
 * Provider for the MainApp logic.
 *
 * @remarks
 * This component acts as a bridge for the high-level orchestration logic.
 * Components should favor direct Zustand store access where possible.
 *
 * @category Components
 */
export const MainAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	useMainAppLogic();

	return <>{children}</>;
};
