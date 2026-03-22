import { useRef } from "react";
import { Button } from "@radix-ui/themes";

import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";

/**
 * A stylized donation button component that links to Buy Me A Coffee.
 *
 * It renders as a themed Radix UI `Button`. When clicked, it captures a
 * Google Analytics event and then opens the donation page in a new tab
 * after a short delay (to ensure the event is dispatched).
 *
 * @returns {JSX.Element} The rendered donation button.
 *
 * @example
 * <BuyMeACoffee />
 */
export default function BuyMeACoffee() {
	const isLargeScreen = useBreakpoint("1024px"); // Tailwind's 'lg' breakpoint
	const { sendEvent } = useAnalytics();
	const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	/**
	 * Handles the button click, tracks analytics, and opens the external URL.
	 *
	 * @param {React.MouseEvent<HTMLAnchorElement>} event - The click event.
	 * @example
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
