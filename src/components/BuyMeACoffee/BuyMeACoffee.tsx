import { Button } from "@radix-ui/themes";

import { useAnalytics } from "../../hooks/useAnalytics";
import { useBreakpoint } from "../../hooks/useBreakpoint";

/**
 * A Radix UI Button component that links to the BuyMeACoffee page when clicked.
 * Sends a Google Analytics event when clicked.
 * @returns A Radix UI Button component.
 */
export default function BuyMeACoffee() {
	const isLargeScreen = useBreakpoint("1024px"); // Tailwind's 'lg' breakpoint
	const { sendEvent } = useAnalytics();
	const handleButtonClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();

		// Send the Google Analytics event
		sendEvent({
			name: "BuyMeACoffeeClick",
			params: {
				category: "User Interactions",
				label: "Buy Me a Coffee Button",
			},
		});

		// Delay to ensure GA event is captured
		setTimeout(() => {
			window.open("https://www.buymeacoffee.com/jbelew", "_blank", "noopener,noreferrer");
		}, 100);
	};

	return (
		<Button size={isLargeScreen ? "1" : "1"} variant="solid" asChild>
			<a href="https://www.buymeacoffee.com/jbelew" onClick={handleButtonClick}>
				☕ Buy me a Coffee!
			</a>
		</Button>
	);
}
