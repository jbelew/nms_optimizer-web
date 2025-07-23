// src/components/TechTree/TechTree.tsx
import "./TechTree.css";

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import ErrorBoundary from "../ErrorBoundry/ErrorBoundry";
import TechTreeContainer from "./TechTreeContainer";

interface TechTreeComponentProps {
	handleOptimize: (tech: string) => Promise<void>;
	solving: boolean;
	gridContainerRef: React.RefObject<HTMLDivElement | null>;
	isLarge: boolean;
}

const TechTreeComponent: React.FC<TechTreeComponentProps> = (props) => {
	const [error, setError] = useState<Error | null>(null);
	const { t } = useTranslation();

	useEffect(() => {
		setError(null);
	}, []);

	return (
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
	);
};

export default TechTreeComponent;