import type { FC } from "react";
import { Suspense } from "react";

import PerformanceDialog from "@/components/AppDialog/Performance/PerformanceDialog";
import { useSeoAndTitle } from "@/hooks/useSeoAndTitle/useSeoAndTitle";
import { useDialog } from "@/utils/system/dialogUtils";

/**
 * Route component for rendering the PerformanceDialog.
 *
 * @remarks
 * This component is an entry point for the `/performance` route. It is intended to be
 * lazy-loaded by the main router to keep the heavy Recharts/BigQuery dependencies
 * out of the initial application bundle. It provides its own `<Suspense>` boundary
 * to handle the code-splitting phase natively.
 *
 * @returns {JSX.Element} The suspense-wrapped performance dialog component.
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <Route path="performance" element={<PerformanceRoute />} />
 * ```
 */
export const PerformanceRoute: FC = () => {
	const { closeDialog } = useDialog();

	useSeoAndTitle();

	return (
		<Suspense fallback={null}>
			<PerformanceDialog isOpen={true} onClose={closeDialog} />
		</Suspense>
	);
};

export default PerformanceRoute;
