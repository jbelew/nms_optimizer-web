import "./AppFooter.scss";

import React from "react";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import { Button, Flex, Separator } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import Buymeacoffee from "@/components/BuyMeACoffee/BuyMeACoffee";
import { build, getBuildDate } from "@/routeConfig";
import { sendDeferredEvent } from "@/utils/analytics/tracking";
import { isPlainLeftClick, useDialog } from "@/utils/system/dialogUtils";

/**
 * Props for the {@link AppFooter} component.
 */
interface AppFooterProps {
	/**
	 * Optional build date string override.
	 *
	 * @default getBuildDate()
	 */
	buildDate?: string;
	/**
	 * Optional build version string override.
	 *
	 * @default build
	 */
	buildVersion?: string;
}

/**
 * Global application footer component.
 *
 * @remarks
 * Self-contained footer module displaying GitHub issue links, author attribution, license,
 * Privacy Policy Routed Dialog trigger, build metadata (`buildVersion` and `buildDate`),
 * and community support links.
 *
 * @param props - Optional build metadata overrides.
 *
 * @returns The rendered footer element.
 *
 * @see {@link useDialog}
 * @see {@link ./AppFooter.test.tsx Unit Tests}
 * @see {@link ./AppFooter.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <AppFooter />
 * // renders <footer class="app-footer">...</footer>
 * ```
 */
const AppFooter: React.FC<AppFooterProps> = ({
	buildDate = getBuildDate(),
	buildVersion = build,
}) => {
	const { i18n, t } = useTranslation();
	const { getDialogHref, openDialog } = useDialog();

	const trackOutboundLink = (itemId: string) => {
		sendDeferredEvent({
			action: "select_content",
			category: "engagement",
			content_type: "outbound_link",
			item_id: itemId,
			nonInteraction: false,
		});
	};

	return (
		<footer
			className="app-footer"
			data-build-date={buildDate}
			key={i18n.language}
		>
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
									onClick={() => trackOutboundLink("github_issue")}
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
						onClick={() => trackOutboundLink("github_repo")}
						rel="noopener noreferrer"
						target="_blank"
					>
						<GitHubLogoIcon className="app-footer__link--icon" />
					</a>
					<a
						aria-label={t("buttons.viewProfileOnLinkedin") ?? ""}
						href="https://www.linkedin.com/in/jobelew/"
						onClick={() => trackOutboundLink("linkedin")}
						rel="noopener noreferrer"
						target="_blank"
					>
						<LinkedInLogoIcon className="app-footer__link--icon-linkedin" />
					</a>
					<a
						className="app-footer__link"
						href="https://www.linkedin.com/in/jobelew/"
						onClick={() => trackOutboundLink("linkedin")}
						rel="noopener noreferrer"
						target="_blank"
					>
						#OpenToWork
					</a>
					&nbsp;•{" "}
					<a
						className="app-footer__link"
						href="https://raw.githubusercontent.com/jbelew/nms_optimizer-web/refs/heads/main/LICENSE"
						onClick={() => trackOutboundLink("github_license")}
						rel="noopener noreferrer"
						target="_blank"
					>
						{t("footer.license")}
					</a>{" "}
					•{" "}
					<a
						className="app-footer__link"
						href={getDialogHref("privacy")}
						onClick={(event) => {
							if (isPlainLeftClick(event)) {
								event.preventDefault();
								openDialog("privacy");
							}
						}}
					>
						{t("buttons.privacy")}
					</a>{" "}
					• {t("footer.buildLabel")} {buildVersion}{" "}
					{buildDate && `(${new Date(buildDate).toLocaleString()})`}
				</div>

				<Separator
					decorative
					mb="1"
					mt="1"
					size="3"
				/>
				<Flex
					align="center"
					className="app-footer__support"
					gap="2"
					justify="center"
					wrap="wrap"
				>
					<div className="app-footer__support-text">
						<Trans i18nKey="footer.supportPrompt" />
					</div>
					<Buymeacoffee />
					<Button
						asChild
						size="1"
						variant="surface"
					>
						<a
							href="https://github.com/jbelew/nms_optimizer-web/stargazers"
							onClick={() => trackOutboundLink("github_star")}
							rel="noopener noreferrer"
							target="_blank"
						>
							{t("footer.ratingPill")}
						</a>
					</Button>
				</Flex>
			</Flex>
		</footer>
	);
};

export default AppFooter;
