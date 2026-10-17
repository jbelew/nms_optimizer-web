// src/components/ShipSelection/ShipSelection.tsx

import React, { Suspense } from "react";
import { DropdownMenu } from "@radix-ui/themes";

import { ShipSelectionContent } from "./ShipSelectionContent";
import { ShipSelectionProvider } from "./ShipSelectionProvider";
import { ShipSelectionSkeleton } from "./ShipSelectionSkeleton";
import { ShipSelectionTrigger } from "./ShipSelectionTrigger";

/**
 * Props for the `ShipSelection` component.
 */
interface ShipSelectionProps {
	/** Whether the selector is disabled. */
	disabled?: boolean;
	/** Whether an optimization solve is currently active. */
	solving: boolean;
}

/**
 * The default composite ShipSelection component.
 *
 * @param {ShipSelectionProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered ship selection dropdown.
 *
 * @see {@link ShipSelectionProvider}
 * @see {@link ./ShipSelectionTrigger.test.tsx Unit Tests}
 * @see {@link ./ShipSelection.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ShipSelection disabled={false} solving={false} />
 * // renders platform selection dropdown menu
 * ```
 */
export const ShipSelection: React.FC<ShipSelectionProps> = ({ disabled = false, solving }) => {
	return (
		<Suspense fallback={<ShipSelectionSkeleton />}>
			<ShipSelectionProvider disabled={disabled} solving={solving}>
				<DropdownMenu.Root modal={false}>
					<ShipSelectionTrigger />
					<ShipSelectionContent />
				</DropdownMenu.Root>
			</ShipSelectionProvider>
		</Suspense>
	);
};
