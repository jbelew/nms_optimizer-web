import React from "react";
import { Trans, useTranslation } from "react-i18next";

const ErrorContent: React.FC = () => {
	const { t } = useTranslation();
	return (
		<div className="flex flex-col items-center justify-center h-full p-4">
			<span className="block pb-2 text-xl font-semibold tracking-widest text-center errorContent__title">
				{t("errorContent.signalDisruption")}
			</span>
			<p className="pt-1 text-base appContent__text">
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
