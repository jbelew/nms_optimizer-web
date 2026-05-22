// src/components/AppFooter/AppFooter.tsx
import "./AppFooter.scss";

import React from "react";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import { Button, Flex, Separator } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import Buymeacoffee from "@/components/BuyMeACoffee/BuyMeACoffee";

import { AppFooterProvider } from "./AppFooterProvider";
import { useAppFooterContext } from "./useAppFooterContext";

/**
 * Root component for the AppFooter.
 */
const AppFooterRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { i18n } = useTranslation();
	const { buildDate } = useAppFooterContext();

	return (
		<footer className="app-footer" data-build-date={buildDate} key={i18n.language}>
			<Flex
				align="center"
				className="app-footer__wrapper"
				direction="column"
				gap="1"
				pb={{ initial: "6", md: "0" }}
			>
				{children}
			</Flex>
		</footer>
	);
};

/**
 * Main content section of the footer.
 */
const AppFooterContent: React.FC = () => {
	const { buildDate, buildVersion, openDialog, t } = useAppFooterContext();

	return (
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
	);
};

/**
 * Rating pill component displaying GitHub stars and community rating.
 *
 * @returns {React.JSX.Element} The rendered rating pill link.
 */
const AppFooterRating: React.FC = () => {
	const { t } = useAppFooterContext();

	return (
		<Button asChild size="1" variant="surface">
			<a
				href="https://github.com/jbelew/nms_optimizer-web/stargazers"
				rel="noopener noreferrer"
				target="_blank"
			>
				{t("footer.ratingPill")}
			</a>
		</Button>
	);
};

/**
 * Support section of the footer.
 */
const AppFooterSupport: React.FC = () => {
	return (
		<>
			<Separator color="cyan" decorative mb="1" mt="1" size="3" />
			<Flex
				align="center"
				className="app-footer__support"
				gap={{ initial: "2", lg: "2" }}
				justify="center"
				wrap="wrap"
			>
				<div className="app-footer__support-text">
					<Trans i18nKey="footer.supportPrompt" />
				</div>
				<Buymeacoffee />
				<AppFooterRating />
			</Flex>
		</>
	);
};

/**
 * Default monolithic AppFooter component.
 */
const AppFooterComp: React.FC<{ buildDate?: string; buildVersion: string }> = ({
	buildDate,
	buildVersion,
}) => {
	return (
		<AppFooterProvider buildDate={buildDate} buildVersion={buildVersion}>
			<AppFooterRoot>
				<AppFooterContent />
				<AppFooterSupport />
			</AppFooterRoot>
		</AppFooterProvider>
	);
};

/**
 * Compound component for AppFooter.
 */
const AppFooter = Object.assign(AppFooterComp, {
	Content: AppFooterContent,
	Provider: AppFooterProvider,
	Rating: AppFooterRating,
	Root: AppFooterRoot,
	Support: AppFooterSupport,
});

export default AppFooter;
