// src/components/TechTree/TechTree.tsx
import "./TechTree.css";

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import ErrorBoundary from "../ErrorBoundry/ErrorBoundry";
import TechTreeContainer from "./TechTreeContainer";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { ScrollArea } from "@radix-ui/themes";

import { useFetchTechTreeSuspense, type TechTree } from "../../hooks/useTechTree";
import RecommendedBuild from "../RecommendedBuild/RecommendedBuild";
import { usePlatformStore } from "../../store/PlatformStore";

interface TechTreeComponentProps {
	handleOptimize: (tech: string) => Promise<void>;
	solving: boolean;
	gridContainerRef: React.RefObject<HTMLDivElement | null>;
	isLarge: boolean;
	techTree: TechTree;
}

const TechTreeComponent: React.FC<TechTreeComponentProps> = (props) => {
	const [error, setError] = useState<Error | null>(null);
	const { t } = useTranslation();
	const isLarge = useBreakpoint("1024px");

	const DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT = "524px";

	const scrollAreaHeight = useMemo(() => {
		const baseHeight = parseInt(DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT, 10);
		// if (techTree.recommended_builds && techTree.recommended_builds.length > 0) {
		// 	return `${baseHeight - 52}px`;
		// }
		return baseHeight;
	}, []);

	useEffect(() => {
		setError(null);
	}, []);

	return (
		<>
			{isLarge ? (
				<>
					<ScrollArea
						className={`gridContainer__sidebar rounded-md p-4 shadow-md backdrop-blur-xl`}
						style={{
							height: scrollAreaHeight,
						}}
					>
						<ErrorBoundary>
							<Suspense fallback={<div>Loading Tech Tree...</div>}>
								{error ? (
									<div className="flex flex-col items-center justify-center h-full">
										<ExclamationTriangleIcon className="shadow-md w-14 h-14 errorContent__icon" />
										<h2 className="pb-2 text-2xl font-semibold tracking-widest text-center errorContent__title">
											{t("techTree.error.title")}
										</h2>
										<p className="font-bold text-center sidebar__error">{t("techTree.error.message")}</p>
										<p>{t("techTree.error.details", { details: error.message })}</p>
									</div>
								) : (
									<TechTreeContainer {...props} />
								)}
							</Suspense>
						</ErrorBoundary>
					</ScrollArea>
					<div className="mt-1">

					</div>
				</>
			) : (
				// <aside
				// 			className={`w-full flex-grow ${techTree.recommended_builds && techTree.recommended_builds.length > 0 ? "pt-4" : "pt-8"}`}
				// 			style={{ minHeight: "550px" }}
				// 		>
				// </aside>
				<aside
					className={`w-full flex-grow pt-8"}`}
					style={{ minHeight: "550px" }}
				>
					<ErrorBoundary>
						<Suspense fallback={<div>Loading Tech Tree...</div>}>
							<TechTreeContainer {...props} />
						</Suspense>
					</ErrorBoundary>
				</aside>

			)}
		</>

	);
};

export default TechTreeComponent;