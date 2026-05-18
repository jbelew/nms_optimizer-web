// src/components/ShipSelection/ShipSelection.tsx
import "./ShipSelection.scss";

import React, { Suspense } from "react";

import { ShipSelectionContent } from "./ShipSelectionContent";
import { ShipSelectionProvider } from "./ShipSelectionProvider";
import { ShipSelectionRoot } from "./ShipSelectionRoot";
import { ShipSelectionSkeleton } from "./ShipSelectionSkeleton";
import { ShipSelectionTrigger } from "./ShipSelectionTrigger";

export { ShipSelectionContent } from "./ShipSelectionContent";

export { ShipSelectionProvider } from "./ShipSelectionProvider";

export { ShipSelectionRoot } from "./ShipSelectionRoot";

export { ShipSelectionSkeleton } from "./ShipSelectionSkeleton";

export { ShipSelectionTrigger } from "./ShipSelectionTrigger";

/**
 * Props for the `ShipSelection` component.
 */
interface ShipSelectionProps {
	/** Whether an optimization solve is currently active. */
	solving: boolean;
}

/**
 * The default composite ShipSelection component.
 */
export const ShipSelection: React.FC<ShipSelectionProps> = ({ solving }) => {
	return (
		<Suspense fallback={<ShipSelectionSkeleton />}>
			<ShipSelectionProvider solving={solving}>
				<ShipSelectionRoot>
					<ShipSelectionTrigger />
					<ShipSelectionContent />
				</ShipSelectionRoot>
			</ShipSelectionProvider>
		</Suspense>
	);
};
