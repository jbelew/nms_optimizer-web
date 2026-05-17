// src/components/MainAppContent/MainAppContent.tsx
import "./MainAppContent.scss";

import React, { Suspense } from "react";

import { MainAppProvider } from "./MainAppContext";
import { MainAppLayoutContent, ShipTypesLoader } from "./MainAppLayout";

/**
 * The primary layout component for the application's main functional area.
 *
 * @remarks
 * This component provides the necessary contexts and triggers the initial
 * data loading via Suspense. It wraps the core layout structure.
 *
 * @returns {JSX.Element} The orchestrated main application content.
 *
 * @category Components
 */
export const MainAppContent = () => {
	return (
		<MainAppProvider>
			{/* Load ship types and tech definitions - suspends and allows layout to render once ready */}
			<Suspense fallback={null}>
				<ShipTypesLoader />
			</Suspense>

			{/* Core application layout structure */}
			<MainAppLayoutContent />
		</MainAppProvider>
	);
};
