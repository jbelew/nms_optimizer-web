import React from "react";

interface BackgroundWrapperProps {
	children: React.ReactNode;
	isVisible: boolean;
	theme: string;
}

export const BackgroundWrapper = ({ children, isVisible, theme }: BackgroundWrapperProps) => {
	React.useEffect(() => {
		const radixRoot = document.querySelector(".radix-themes") as HTMLElement | null;
		const color = isVisible ? "transparent" : theme === "dark" ? "#0B161A" : "#ffffff";

		if (isVisible) {
			document.documentElement.style.backgroundImage = `image-set(url("/assets/img/background.webp") 1x, url("/assets/img/background@2x.webp") 2x)`;
			document.documentElement.style.backgroundPosition = "center";
			document.documentElement.style.backgroundRepeat = "no-repeat";
			document.documentElement.style.backgroundSize = "cover";
		} else {
			document.documentElement.style.backgroundImage = "none";
		}

		document.documentElement.style.backgroundColor = color;
		document.body.style.backgroundColor = color;

		if (radixRoot) {
			radixRoot.style.backgroundColor = color;
		}
	}, [isVisible, theme]);

	return <>{children}</>;
};
