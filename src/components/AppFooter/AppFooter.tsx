import "./AppFooter.scss";

import React from "react";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import { Flex, Separator } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import { useDialog } from "../../utils/system/dialogUtils";
import Buymeacoffee from "../BuyMeACoffee/BuyMeACoffee";

/**
 * Props for the `AppFooter` component.
 */
interface AppFooterProps {
	/** The ISO date string when the application was last built. */
	buildDate?: string;
	/** The semantic version string of the application. **Must be provided.** */
	buildVersion: string;
}

/**
 * The global application footer component.
 *
 * @remarks
 * It renders credits, social links, license information, and the build version.
 * It also includes a call-to-action for supporting the project via "Buy Me a Coffee".
 *
 * @param {AppFooterProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered application footer.
 *
 * @see {@link Buymeacoffee}
 * @see {@link useDialog}
 * @see {@link ./AppFooter.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <AppFooter buildVersion="1.2.3" buildDate="2023-10-27T10:00:00Z" />
 * ```
 */
const AppFooter: React.FC<AppFooterProps> = ({ buildDate, buildVersion }) => {
	const { i18n, t } = useTranslation();
	const { openDialog } = useDialog();

	return (
		<footer className="app-footer" data-build-date={buildDate} key={i18n.language}>
			<Flex
				align="center"
				className="app-footer__wrapper"
				direction="column"
				gap="1"
				pb={{ initial: "6", md: "0" }}
			>
				<div className="app-footer__content">
					<Trans
						components={{
							1: (
								<a
									className="app-footer__link"
									href="https://github.com/jbelew/nms_optimizer-web/issues/new/choose"
									rel="noopener noreferrer"
									target="_blank"
								>
									Issue
								</a>
							),
						}}
						i18nKey="footer.issuePrompt"
					/>
					<br />
					{t("footer.builtBy")} (void23 | QQ9Y-EJRS-P8KGW)
					<a
						aria-label={t("buttons.viewSourceOnGithub") ?? ""}
						href="https://github.com/jbelew/nms_optimizer-web"
						rel="noopener noreferrer"
						target="_blank"
					>
						<GitHubLogoIcon className="app-footer__link--icon" />
					</a>
					<a
						aria-label={t("buttons.viewProfileOnLinkedin") ?? ""}
						href="https://www.linkedin.com/in/jobelew/"
						rel="noopener noreferrer"
						target="_blank"
					>
						<LinkedInLogoIcon className="app-footer__link--icon-linkedin" />
					</a>
					<a
						className="app-footer__link"
						href="https://www.linkedin.com/in/jobelew/"
						rel="noopener noreferrer"
						target="_blank"
					>
						#OpenToWork
					</a>
					&nbsp;•{" "}
					<a
						className="app-footer__link"
						href="https://raw.githubusercontent.com/jbelew/nms_optimizer-web/refs/heads/main/LICENSE"
						rel="noopener noreferrer"
						target="_blank"
					>
						{t("footer.license")}
					</a>{" "}
					•{" "}
					<button
						className="app-footer__link"
						onClick={(e) => {
							e.preventDefault();
							openDialog("privacy");
						}}
						type="button"
					>
						{t("buttons.privacy")}
					</button>{" "}
					• {t("footer.buildLabel")} {buildVersion}{" "}
					{buildDate && `(${new Date(buildDate).toLocaleString()})`}
				</div>
				<Separator decorative mb="1" mt="1" size="3" />
				<Flex
					align="center"
					className="app-footer__support"
					gap={{ initial: "2", lg: "1" }}
					justify="center"
					wrap="wrap"
				>
					<Trans i18nKey="footer.supportPrompt" />
					<Buymeacoffee />
				</Flex>
			</Flex>
		</footer>
	);
};

export default AppFooter;
