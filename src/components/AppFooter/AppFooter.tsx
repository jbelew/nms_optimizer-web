import React from "react";
import { Separator } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import Buymeacoffee from "../BuyMeACoffee/BuyMeACoffee";

/**
 * @interface AppFooterProps
 * @property {string} buildVersion - The build version of the application, to be displayed in the footer.
 */
interface AppFooterProps {
	buildVersion: string;
	language: string;
}

/**
 * AppFooter component displays the application footer.
 * It includes links for issues, build version information, and a "Buy Me a Coffee" component.
 *
 * @param {AppFooterProps} props - The props for the AppFooter component.
 * @returns {JSX.Element} The rendered AppFooter component.
 */
const AppFooter: React.FC<AppFooterProps> = ({ buildVersion, language }) => {
	useTranslation();

	return (
		<footer
			key={language}
			className="flex flex-col items-center justify-center gap-1 p-4 pb-8 text-center text-xs font-light sm:text-sm lg:pb-0"
		>
			<div>
				<Trans
					i18nKey="footer.issuePrompt"
					components={{
						1: (
							<a
								href="https://github.com/jbelew/nms_optimizer-web/issues/new/choose"
								target="_blank"
								className="underline"
								rel="noopener noreferrer"
								style={{ color: "var(--accent-11)" }}
							/>
						),
					}}
				/>
				<br />
				Built by jbelew (
				<a
					href="https://www.linkedin.com/in/jobelew/"
					target="_blank"
					rel="noopener noreferrer"
					className="underline"
				>
					Looking for work BTW!
				</a>
				) • {buildVersion}
			</div>
			<Separator decorative size="3" />
			<div className="flex flex-wrap items-center justify-center gap-1">
				<Trans i18nKey="footer.supportPrompt" />
				<Buymeacoffee />
			</div>
		</footer>
	);
};

export default AppFooter;
