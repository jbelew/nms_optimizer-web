import React from "react";
import { Trans, useTranslation } from "react-i18next";

const ErrorContent: React.FC = () => {
	const { t } = useTranslation();
	return (
		<div className="flex h-full flex-col items-center justify-center p-4">
			<span className="errorContent__title block pb-2 text-center text-xl font-semibold tracking-widest">
				{t("errorContent.signalDisruption")}
			</span>
			<p className="appContent__text pt-1 text-base">
				<Trans
					i18nKey="errorContent.serverErrorDetails"
					components={{
						1: (
							<a
								href="https://github.com/jbelew/nms_optimizer-web/issues"
								target="_blank"
								rel="noopener noreferrer"
								className="underline"
							/>
						),
						// For the <strong> tag, i18next will handle it by default if it's in the translation string.
						// If you need specific styling or it's a React component, you'd add it here.
					}}
				/>
			</p>
		</div>
	);
};

export default React.memo(ErrorContent);
