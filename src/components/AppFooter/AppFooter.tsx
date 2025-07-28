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
		<footer className="flex flex-col items-center justify-center gap-1 p-4 pb-8 text-center text-xs sm:text-sm lg:pb-0">
			<div className="font-light">
				<Trans
					i18nKey="footer.issuePrompt"
					components={{
						1: (
							<Link
								href="https://github.com/jbelew/nms_optimizer-web/issues/new/choose"
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					}}
				/>
				<br />
				{t("footer.builtBy", { buildVersion: buildVersion })}
			</div>
			<Separator decorative size="3" />
			<div className="flex flex-wrap items-center justify-center gap-1 font-light">
				<Trans i18nKey="footer.supportPrompt" />
				<Buymeacoffee />
			</div>
		</footer>
	);
};

const AppFooter = React.memo(AppFooterInternal);

export default AppFooter;
