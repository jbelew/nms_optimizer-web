import React from "react";

interface BackgroundWrapperProps {
	children: React.ReactNode;
	isVisible: boolean;
}

export const BackgroundWrapper = ({ children, isVisible }: BackgroundWrapperProps) => {
	React.useEffect(() => {
		if (isVisible) {
			document.documentElement.style.backgroundImage = `image-set(url("/assets/img/background.webp") 1x, url("/assets/img/background@2x.webp") 2x)`;
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
