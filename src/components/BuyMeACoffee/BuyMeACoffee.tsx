/**
 * Donation integration module.
 *
 * @remarks
 * Provides a UI entry point for users to support the project via the
 * "Buy Me A Coffee" platform.
 *
 * @see {@link BuyMeACoffee}
 *
 * @category Components
 */

import { useRef } from "react";
import { Button } from "@radix-ui/themes";

import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";

/**
 * Stylized donation button linking to "Buy Me A Coffee".
 *
 * @remarks
 * Renders as a themed Radix UI `Button`. Captures a Google Analytics event
 * and opens the donation page in a new tab after a 100ms delay to ensure
 * the event is dispatched.
 *
 * @returns {JSX.Element} The rendered donation button.
 *
 * @see {@link useAnalytics} - Used for tracking click events.
 * @see {@link useBreakpoint} - Used for responsive sizing.
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <BuyMeACoffee />
 * // returns JSX.Element
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
	 *
	 * @returns {void}
	 *
	 * @example Interaction handler
	 * ```typescript
	 * handleButtonClick(event);
	 * ```
	 */
	const handleButtonClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();

		// Send the Google Analytics event
		sendEvent({
			action: "buy_me_a_coffee_click",
			category: "ui",
			nonInteraction: false,
			value: 1,
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
			<Button asChild size={isLargeScreen ? "1" : "1"} variant="solid">
				<a href="https://www.buymeacoffee.com/jbelew" onClick={handleButtonClick}>
					☕ Buy me a Coffee!
				</a>
			</Button>
		</div>
	);
}
