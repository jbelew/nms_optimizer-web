import { useRef } from "react";
import { Button } from "@radix-ui/themes";

import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";

/**
 * A Radix UI Button component that links to the BuyMeACoffee page when clicked.
 * Sends a Google Analytics event when clicked.
 * @returns A Radix UI Button component.
 */
export default function BuyMeACoffee() {
	const isLargeScreen = useBreakpoint("1024px"); // Tailwind's 'lg' breakpoint
	const { sendEvent } = useAnalytics();
	const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const handleButtonClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();

		// Send the Google Analytics event
		sendEvent({
			category: "ui",
			action: "buy_me_a_coffee_click",
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
			<Button size={isLargeScreen ? "1" : "1"} variant="solid" asChild>
				<a href="https://www.buymeacoffee.com/jbelew" onClick={handleButtonClick}>
					☕ Buy me a Coffee!
				</a>
			</Button>
		</div>
	);
}
