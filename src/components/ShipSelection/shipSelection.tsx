// src/components/ShipSelection/shipSelection.tsx
import "./shipSelection.scss";

import React, { Suspense } from "react";

import { ShipSelectionContent } from "./ShipSelectionContent";
import { ShipSelectionProvider } from "./ShipSelectionProvider";
import { ShipSelectionRoot } from "./ShipSelectionRoot";
import { ShipSelectionSkeleton } from "./ShipSelectionSkeleton";
import { ShipSelectionTrigger } from "./ShipSelectionTrigger";

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
const ShipSelectionComp: React.FC<ShipSelectionProps> = ({ solving }) => {
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

/**
 * Compound component for ShipSelection.
 */
export const ShipSelection = Object.assign(ShipSelectionComp, {
	Content: ShipSelectionContent,
	Provider: ShipSelectionProvider,
	Root: ShipSelectionRoot,
	Skeleton: ShipSelectionSkeleton,
	Trigger: ShipSelectionTrigger,
});
