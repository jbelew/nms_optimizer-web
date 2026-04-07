import { useRef } from "react";
import { Button } from "@radix-ui/themes";

import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";

/**
 * Stylized donation button linking to "Buy Me A Coffee".
 *
 * @remarks
 * Renders as a themed Radix UI `Button`. Captures a Google Analytics event
 * and opens the donation page in a new tab after a 100ms delay to ensure
 * the event is dispatched.
 *
 * @see {@link useAnalytics} - Used for tracking click events.
 * @see {@link useBreakpoint} - Used for responsive sizing.
 *
 * @component
 * @category Components
 *
 * @returns {JSX.Element} The rendered donation button.
 *
 * @example
 * ```tsx
 * <BuyMeACoffee />
 * // Renders: ☕ Buy me a Coffee!
 * ```
 */
export default function BuyMeACoffee() {
	const isLargeScreen = useBreakpoint("1024px"); // Tailwind's 'lg' breakpoint
	const { sendEvent } = useAnalytics();
	const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	/**
	 * Handles the button click, tracks analytics, and opens the external URL.
	 *
	 * @param {React.MouseEvent<HTMLAnchorElement>} event - The click event.
	 * @returns {void}
	 * @example Interaction handler
	 * ```typescript
	 * handleButtonClick(event);
	 * ```
	 */
	const handleButtonClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();

		// Send the Google Analytics event
		sendEvent({
			category: "ui",
			action: "buy_me_a_coffee_click",
			value: 1,
			nonInteraction: false,
		});

		// Delay to ensure GA event is captured
		if (openTimeoutRef.current) {
			clearTimeout(openTimeoutRef.current);
		}

		openTimeoutRef.current = setTimeout(() => {
			window.open("https://www.buymeacoffee.com/jbelew", "_blank", "noopener,noreferrer");
			openTimeoutRef.current = null;
		}, 100);
	};

	return (
		<div>
			<Button size={isLargeScreen ? "1" : "1"} variant="solid" asChild>
				<a href="https://www.buymeacoffee.com/jbelew" onClick={handleButtonClick}>
					☕ Buy me a Coffee!
				</a>
			</Button>
		</div>
	);
}
