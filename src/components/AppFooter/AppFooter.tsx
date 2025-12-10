import "./AppFooter.scss";

import React from "react";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import { Flex, Separator } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import Buymeacoffee from "../BuyMeACoffee/BuyMeACoffee";

/**
 * @interface AppFooterProps
 * @property {string} buildVersion - The build version of the application, to be displayed in the footer.
 * @property {string} [buildDate] - The build date of the application, to be displayed in the footer for devmode.
 */
interface AppFooterProps {
	buildVersion: string;
	buildDate?: string; // Added optional buildDate prop
}

/**
 * AppFooter component displays the application footer.
 * It includes links for issues, build version information, and a "Buy Me a Coffee" component.
 *
 * @param {AppFooterProps} props - The props for the AppFooter component.
 * @returns {JSX.Element} The rendered AppFooter component.
 */
const AppFooter: React.FC<AppFooterProps> = ({ buildVersion, buildDate }) => {
	// Destructure buildDate
	const { i18n } = useTranslation();

	return (
		<footer key={i18n.language} data-build-date={buildDate} className="app-footer">
			<Flex
				direction="column"
				align="center"
				gap="1"
				pt="5"
				pb={{ initial: "6", md: "0" }}
				className="app-footer__wrapper"
			>
				<div className="app-footer__content">
					<Trans
						i18nKey="footer.issuePrompt"
						components={{
							1: (
								<a
									href="https://github.com/jbelew/nms_optimizer-web/issues/new/choose"
									target="_blank"
									className="app-footer__link"
									rel="noopener noreferrer"
								/>
							),
						}}
					/>
					<br />
					Built by jbelew (void23 | QQ9Y-EJRS-P8KGW)
					<a
						href="https://github.com/jbelew/nms_optimizer-web"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="View source on GitHub"
					>
						<GitHubLogoIcon className="app-footer__link--icon" />
					</a>
					<a
						href="https://www.linkedin.com/in/jobelew/"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="View profile on LinkedIn"
					>
						<LinkedInLogoIcon className="app-footer__link--icon-linkedin" />
					</a>
					<a
						href="https://www.linkedin.com/in/jobelew/"
						target="_blank"
						rel="noopener noreferrer"
						className="app-footer__link"
					>
						#OpenToWork
					</a>
					&nbsp;•{" "}
					<a
						href="https://raw.githubusercontent.com/jbelew/nms_optimizer-web/refs/heads/main/LICENSE"
						target="_blank"
						rel="noopener noreferrer"
						className="app-footer__link"
					>
						GPL-3.0
					</a>{" "}
					{buildVersion} {buildDate && `(${new Date(buildDate).toLocaleString()})`}
				</div>
				<Separator decorative size="3" mt="1" mb="1" />
				<Flex
					align="center"
					gap={{ initial: "2", lg: "1" }}
					wrap="wrap"
					justify="center"
					className="app-footer__support"
				>
					<Trans i18nKey="footer.supportPrompt" />
					<Buymeacoffee />
				</Flex>
			</Flex>
		</footer>
	);
};

export default AppFooter;
