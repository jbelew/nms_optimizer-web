import type { ErrorInfo, ReactNode } from "react";
import { useEffect } from "react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Link, ScrollArea, Separator } from "@radix-ui/themes";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { hideSplashScreenAndShowBackground } from "../../utils/splashScreen";
import { ErrorDisplay } from "./ErrorDisplay";

import "./ErrorBoundary.scss";

interface ErrorContentProps {
	error?: Error;
	errorInfo?: ErrorInfo;
	variant: "page" | "inset";
	children?: ReactNode;
}

const DefaultMessage = () => (
	<>
		Something went wrong! This page may be <strong>out of date</strong>. Try{" "}
		<strong>reloading the page</strong> to get the latest updates. If the problem continues,
		please consider{" "}
		<Link
			href="https://github.com/jbelew/nms_optimizer-web/issues"
			target="_blank"
			rel="noopener noreferrer"
			underline="always"
			weight="medium"
		>
			filing a bug report
		</Link>
		.
	</>
);

const InsetMessage = () => (
	<>
		Something went wrong! Try <strong>reloading the page</strong> to see if that resolves the
		issue. If the problem continues, please consider{" "}
		<Link
			href="https://github.com/jbelew/nms_optimizer-web/issues"
			target="_blank"
			rel="noopener noreferrer"
			underline="always"
			weight="medium"
		>
			filing a bug report
		</Link>
		.
	</>
);

export const ErrorContent = ({ error, errorInfo, variant, children }: ErrorContentProps) => {
	const isLarge = useBreakpoint("1024px");

	useEffect(() => {
		hideSplashScreenAndShowBackground();
	}, []);

	const content = (
		<div className="error-content">
			<section className="error-content__header">
				<h2 className="heading-styled flex items-center gap-2 text-xl sm:text-2xl">
					<ExclamationTriangleIcon className="error-content__icon h-5 w-5" />
					<span>Boundary Error!</span>
				</h2>
				<Separator mt="2" mb="4" size="4" orientation="horizontal" decorative />
			</section>

			<div className="error-content__body">
				<div className="mb-2 text-sm sm:text-base">
					{children || (variant === "page" ? <DefaultMessage /> : <InsetMessage />)}
				</div>
				<ErrorDisplay error={error} errorInfo={errorInfo} />
			</div>
		</div>
	);

	if (variant === "inset" && isLarge) {
		return (
			<div className="error-boundary__container">
				<div className="error-boundary__card">
					<ScrollArea style={{ height: "526px" }}>
						<div className="p-4">{content}</div>
					</ScrollArea>
				</div>
			</div>
		);
	}

	if (variant === "inset") {
		return <div className="mt-8">{content}</div>;
	}

	// variant === "page"
	return (
		<main className="error-page__overlay">
			<div className="error-page__content">{content}</div>
		</main>
	);
};
