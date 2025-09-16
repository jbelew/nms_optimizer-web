import React from "react";
import { Link, Separator } from "@radix-ui/themes";
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
 * AppFooterInternal component displays the application footer.
 * It includes links for issues, build version information, and a "Buy Me a Coffee" component.
 *
 * @param {AppFooterProps} props - The props for the AppFooterInternal component.
 * @returns {JSX.Element} The rendered AppFooterInternal component.
 */
const AppFooterInternal: React.FC<AppFooterProps> = ({ buildVersion }) => {
	const { t } = useTranslation();

	return (
		<footer className="flex flex-col items-center justify-center gap-1 p-4 pb-8 text-center text-xs font-light sm:text-sm lg:pb-0">
			<div>
				<Trans
					i18nKey="footer.issuePrompt"
					components={{
						1: (
							<Link
								href="https://github.com/jbelew/nms_optimizer-web/issues/new/choose"
								target="_blank"
								underline="always"
								rel="noopener noreferrer"
								style={{ color: "var(--accent-11)" }}
							/>
						),
					}}
				/>
				<br />
				{t("footer.builtBy", { buildVersion: buildVersion })}
			</div>
			<Separator decorative size="3" />
			<div className="flex flex-wrap items-center justify-center gap-1">
				<Trans i18nKey="footer.supportPrompt" />
				<Buymeacoffee />
			</div>
		</footer>
	);
};

/**
 * A memoized version of the AppFooterInternal component.
 */
const AppFooter = React.memo(AppFooterInternal);

export default AppFooter;
