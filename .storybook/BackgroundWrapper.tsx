import React from "react";
import backgroundWebp from "../public/assets/img/background.webp";
import background2xWebp from "../public/assets/img/background@2x.webp";

interface BackgroundWrapperProps {
	children: React.ReactNode;
	isVisible: boolean;
}

export const BackgroundWrapper = ({ children, isVisible }: BackgroundWrapperProps) => {
	React.useEffect(() => {
		if (isVisible) {
			document.documentElement.style.backgroundImage = `image-set(url("${backgroundWebp}") 1x, url("${background2xWebp}") 2x)`;
			document.documentElement.style.backgroundPosition = "center";
			document.documentElement.style.backgroundRepeat = "no-repeat";
			document.documentElement.style.backgroundSize = "cover";
			document.documentElement.style.backgroundColor = "#000000";
		} else {
			document.documentElement.style.backgroundImage = "none";
			document.documentElement.style.backgroundColor = "var(--color-background)";
		}
	}, [isVisible]);

	return <>{children}</>;
};
