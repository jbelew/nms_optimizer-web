/**
 * Decorative seasonal animation module.
 *
 * @remarks
 * This module provides the `Snowfall` component, a lightweight CSS-based
 * animation used for seasonal visual effects.
 *
 * @see {@link Snowfall}
 *
 * @category Components
 */

import "./Snowfall.scss";

import React, { memo } from "react";

/**
 * A decorative component that renders a background snowfall animation.
 *
 * @remarks
 * It generates 100 individual "snowflake" elements that are animated via CSS.
 * The component is memoized to prevent unnecessary re-renders and is
 * explicitly hidden from screen readers.
 *
 * @returns {JSX.Element} The container with snowflake elements.
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <Snowfall />
 * // renders 100 animated snowflakes
 * ```
 */
export const Snowfall = memo(() => {
	// Create an array of 100 items for the snowflakes
	const snowflakes = Array.from({ length: 100 });

	return (
		<div className="snow-container" aria-hidden="true">
			{snowflakes.map((_, index) => (
				<div key={index} className="snowflake" />
			))}
		</div>
	);
});

Snowfall.displayName = "Snowfall";
