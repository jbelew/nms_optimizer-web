import { ScrollArea } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import MessageSpinner from "../MessageSpinner/MessageSpinner";
import { SuspenseSkeleton } from "./SuspenseSkeleton";

export const TechTreeSkeleton: React.FC = () => {
	const isLarge = useBreakpoint("1024px");
	const DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT = "524px";
	const { t } = useTranslation();

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
					<MessageSpinner
						isInset={true}
						isVisible={true}
						useNMSFont={true}
						initialMessage={t("techTree.loading")}
					/>
				</ScrollArea>
			) : (
				// Skeleton for small screens: An aside with a fixed min-height.
				<aside className="w-full flex-grow pt-8" style={{ minHeight: "50vh" }}>
					<SuspenseSkeleton />
				</aside>
			)}
		</>
	);
};
