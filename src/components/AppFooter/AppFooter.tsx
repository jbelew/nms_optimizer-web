import { Separator } from "@radix-ui/themes";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Buymeacoffee from "../BuyMeACoffee/BuyMeACoffee";

interface AppFooterProps {
	buildVersion: string;
}

const AppFooterInternal: React.FC<AppFooterProps> = ({ buildVersion }) => {
	const { t } = useTranslation();

	return (
		<footer className="flex flex-col items-center justify-center gap-1 p-4 text-xs text-center lg:pb-0 sm:text-sm">
			<div className="gap-1 font-light">
				<Trans
					i18nKey="footer.issuePrompt"
					components={{
						1: (
							<Link
								className="underline"
								to="https://github.com/jbelew/nms_optimizer-web/issues/new/choose"
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					}}
				/>
				<br />
				{t("footer.builtBy", { buildVersion: buildVersion })}
			</div>
			<Separator decorative />
			<div className="flex flex-wrap items-center justify-center gap-1 font-light">
				<Trans i18nKey="footer.supportPrompt" />
				<Buymeacoffee />
			</div>
		</footer>
	);
};

const AppFooter = React.memo(AppFooterInternal);

export default AppFooter;
