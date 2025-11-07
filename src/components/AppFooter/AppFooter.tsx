import React from "react";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import { Separator } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import Buymeacoffee from "../BuyMeACoffee/BuyMeACoffee";

/**
 * @interface AppFooterProps
 * @property {string} buildVersion - The build version of the application, to be displayed in the footer.
 */
interface AppFooterProps {
	buildVersion: string;
}

/**
 * AppFooter component displays the application footer.
 * It includes links for issues, build version information, and a "Buy Me a Coffee" component.
 *
 * @param {AppFooterProps} props - The props for the AppFooter component.
 * @returns {JSX.Element} The rendered AppFooter component.
 */
const AppFooter: React.FC<AppFooterProps> = ({ buildVersion }) => {
	const { i18n } = useTranslation();

	return (
		<footer
			key={i18n.language}
			className="flex flex-col items-center justify-center gap-1 pb-4 text-center text-xs font-light sm:text-sm lg:pt-4 lg:pb-0"
		>
			<div className="max-w-full break-words">
				<Trans
					i18nKey="footer.issuePrompt"
					components={{
						1: (
							<a
								href="https://github.com/jbelew/nms_optimizer-web/issues/new/choose"
								target="_blank"
								className="font-medium underline"
								rel="noopener noreferrer"
								// style={{ color: "var(--accent-11)" }}
							/>
						),
					}}
				/>
				<br />
				Built by jbelew
				<a
					href="https://github.com/jbelew/nms_optimizer-web"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="View source on GitHub"
				>
					<GitHubLogoIcon
						className="ml-1 inline"
						style={{ color: "var(--accent-track)" }}
					/>
				</a>
				<a
					href="https://www.linkedin.com/in/jobelew/"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="View profile on LinkedIn"
				>
					<LinkedInLogoIcon
						className="mr-1 ml-1 inline"
						style={{ color: "var(--accent-track)" }}
					/>
				</a>
				<a
					href="https://www.linkedin.com/in/jobelew/"
					target="_blank"
					rel="noopener noreferrer"
					className="font-medium underline"
					style={{ color: "var(--accent-11)" }}
				>
					#OpenToWork
				</a>
				&nbsp;• {buildVersion}
			</div>
			<Separator decorative size="3" className="mt-1" />
			<div className="flex flex-wrap items-center justify-center gap-1">
				<Trans i18nKey="footer.supportPrompt" />
				<Buymeacoffee />
			</div>
		</footer>
	);
};

export default AppFooter;
