import type { JSX } from "react";
import { useState } from "react";
import { Flex, Skeleton } from "@radix-ui/themes";

/**
 * A skeleton component that displays a loading state for the tech tree.
 *
 * @returns {JSX.Element} The rendered skeleton component.
 */
export function SuspenseSkeleton() {
	const [skeletons] = useState(() => {
		const totalSections = 3 + Math.floor(Math.random() * 3); // 3–5 sections
		const elements: JSX.Element[] = [];

		for (let i = 0; i < totalSections; i++) {
			elements.push(
				<Skeleton
					key={`big-${i}`}
					mt={i === 0 ? "0" : "4"} // first element mt="0", others mt="4"
					height="44px"
					width="100%"
				/>
			);

			const smallCount = 1 + Math.floor(Math.random() * 8);

			for (let j = 0; j < smallCount; j++) {
				elements.push(<Skeleton key={`small-${i}-${j}`} height="32px" width="100%" />);
			}
		}

		return elements;
	});

	return (
		<Flex direction="column" gapY="2">
			{skeletons}
		</Flex>
	);
}
