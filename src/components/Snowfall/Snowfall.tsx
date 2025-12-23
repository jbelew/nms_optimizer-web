import "./Snowfall.scss";

import React, { memo } from "react";

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
