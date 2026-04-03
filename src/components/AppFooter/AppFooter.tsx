import "./AppFooter.scss";

import React from "react";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import { Flex, Separator } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import { useDialog } from "../../context/dialog-utils";
import Buymeacoffee from "../BuyMeACoffee/BuyMeACoffee";

/**
 * Props for the `AppFooter` component.
 */
interface AppFooterProps {
	/** The semantic version string of the application. **Must be provided.** */
	buildVersion: string;
	/** The ISO date string when the application was last built. */
	buildDate?: string;
}

/**
 * The global application footer component.
 *
 * It renders credits, social links, license information, and the build version.
 * It also includes a call-to-action for supporting the project via "Buy Me a Coffee".
 *
 * @param {AppFooterProps} props - Component properties.
 * @returns {JSX.Element} The rendered application footer.
 *
 * @example
 * <AppFooter buildVersion="1.2.3" buildDate="2023-10-27T10:00:00Z" />
 */
const AppFooter: React.FC<AppFooterProps> = ({ buildVersion, buildDate }) => {
	const { i18n } = useTranslation();
	const { openDialog } = useDialog();

	return (
		<footer key={i18n.language} data-build-date={buildDate} className="app-footer">
			<Flex
				direction="column"
				align="center"
				gap="1"
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
					•{" "}
					<a
						href={i18n.language === "en" ? "/privacy" : `/${i18n.language}/privacy`}
						className="app-footer__link"
						onClick={(e) => {
							e.preventDefault();
							openDialog("privacy");
						}}
					>
						Privacy Policy
					</a>{" "}
					• Build {buildVersion}{" "}
					{buildDate && `(${new Date(buildDate).toLocaleString()})`}
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
