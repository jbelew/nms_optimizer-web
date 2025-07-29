import React from "react";
import { Link, Separator } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import Buymeacoffee from "../BuyMeACoffee/BuyMeACoffee";

interface AppFooterProps {
	buildVersion: string;
}

const AppFooterInternal: React.FC<AppFooterProps> = ({ buildVersion }) => {
	const { t } = useTranslation();

	return (
		<footer className="flex flex-col items-center justify-center gap-1 p-4 pb-8 text-xs font-light text-center sm:text-sm lg:pb-0">
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

const AppFooter = React.memo(AppFooterInternal);

export default AppFooter;
