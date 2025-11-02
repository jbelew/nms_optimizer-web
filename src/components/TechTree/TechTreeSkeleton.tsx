import { ScrollArea } from "@radix-ui/themes";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import MessageSpinner from "../MessageSpinner/MessageSpinner";
import { SuspenseSkeleton } from "./SuspenseSkeleton";

/**
 * A skeleton component that displays a loading state for the tech tree.
 *
 * @returns {JSX.Element} The rendered skeleton component.
 */
export const TechTreeSkeleton: React.FC = () => {
	const isLarge = useBreakpoint("1024px");
	const DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT = "524px";

	return (
		<>
			{isLarge ? (
				// Skeleton for large screens: A scroll area with a fixed height.
				<ScrollArea
					className="gridContainer__sidebar rounded-md p-4 shadow-md"
					style={{
						height: DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT,
						backgroundColor: "var(--gray-a2)",
					}}
				>
					<MessageSpinner initialMessage="Loading Tech" isInset={true} isVisible={true} />
				</ScrollArea>
			) : (
				// Skeleton for small screens: An aside with a fixed min-height.
				<aside className="w-full grow pt-8" style={{ minHeight: "50vh" }}>
					<SuspenseSkeleton />
				</aside>
			)}
		</>
	);
};
