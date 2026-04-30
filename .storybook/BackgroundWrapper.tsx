import React from "react";

/**
 * Properties for the `BackgroundWrapper` component.
 */
interface BackgroundWrapperProps {
	children: React.ReactNode;
	isVisible: boolean;
	theme: string;
}

/**
 * A wrapper component that manages global background styles for Storybook stories.
 *
 * It dynamically toggles the application's main background image and colors based
 * on the current story's visibility settings and active theme.
 *
 * @param {BackgroundWrapperProps} props - Component properties.
 * @returns {JSX.Element} The rendered children.
 *
 * @example Storybook usage
 * ```tsx
 * <BackgroundWrapper isVisible={true} theme="dark">
 *   <MyComponent />
 * </BackgroundWrapper>
 * ```
 */
export const BackgroundWrapper = ({ children, isVisible, theme }: BackgroundWrapperProps) => {
	React.useEffect(() => {
		const root = document.documentElement;

		// Handle theme classes
		root.classList.remove("light", "dark", "light-theme", "dark-theme");
		root.classList.add(theme, `${theme}-theme`);
		root.style.colorScheme = theme;

		// Handle background visibility class
		if (isVisible) {
			root.classList.add("background-visible");
		} else {
			root.classList.remove("background-visible");
		}
	}, [isVisible, theme]);

	return <>{children}</>;
};
