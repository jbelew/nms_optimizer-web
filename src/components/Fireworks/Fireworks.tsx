/**
 * Decorative celebration animation module for NMS 10th Anniversary.
 *
 * @remarks
 * This module provides the `Fireworks` component, a lightweight CSS-based
 * animation with dynamic React-based positioning and coloring.
 *
 * @see {@link Fireworks}
 *
 * @category Components
 */

import "./Fireworks.scss";

import React, { memo, useState } from "react";

// NMS Theme Palette for fireworks
const NMS_COLORS = [
	"hsl(0, 100%, 65%)", // Atlas Red
	"hsl(38, 100%, 60%)", // Vy'keen Amber / Gold
	"hsl(190, 100%, 65%)", // Sentinel / Korvax Cyan
	"hsl(275, 100%, 65%)", // Void Egg Purple
	"hsl(145, 100%, 60%)", // Toxic Hazard Green
	"hsl(320, 100%, 65%)", // Nebula Pink
	"hsl(210, 100%, 70%)", // Shield Blue
	"hsl(45, 100%, 65%)", // Hyperdrive Yellow
];

interface FireworkProps {
	delay: number;
	duration: number;
}

/**
 * A single firework instance that randomizes its properties on every iteration.
 */
const SingleFirework: React.FC<FireworkProps> = ({ delay, duration }) => {
	const [state, setState] = useState(() => ({
		color: NMS_COLORS[Math.floor(Math.random() * NMS_COLORS.length)],
		distance: `${Math.floor(Math.random() * 50) + 70}px`, // slightly larger: 70px to 120px
		left: `${Math.random() * 80 + 10}vw`,
		top: `${Math.random() * 45 + 15}vh`,
	}));

	const handleIteration = (e: React.AnimationEvent) => {
		// Only trigger state update once per explosion cycle (using the first particle)
		if (e.target instanceof HTMLElement && !e.target.previousElementSibling) {
			setState({
				color: NMS_COLORS[Math.floor(Math.random() * NMS_COLORS.length)],
				distance: `${Math.floor(Math.random() * 50) + 70}px`,
				left: `${Math.random() * 80 + 10}vw`,
				top: `${Math.random() * 45 + 15}vh`,
			});
		}
	};

	return (
		<div
			className="firework"
			onAnimationIteration={handleIteration}
			style={
				{
					"--distance": state.distance,
					left: state.left,
					top: state.top,
				} as React.CSSProperties
			}
		>
			{Array.from({ length: 16 }).map((_, pIdx) => (
				<div
					className="particle"
					key={pIdx}
					style={{
						animationDelay: `${delay}s`,
						animationDuration: `${duration}ms`,
						backgroundColor: state.color,
						boxShadow: `0 0 6px 1px ${state.color}`,
					}}
				/>
			))}
		</div>
	);
};

SingleFirework.displayName = "SingleFirework";

/**
 * A decorative component that renders a background fireworks animation.
 *
 * @remarks
 * It generates multiple dynamic fireworks that shift positions, sizes, and colors
 * on each explosion. The component is memoized to prevent unnecessary re-renders
 * and is explicitly hidden from screen readers.
 *
 * @returns {JSX.Element} The container with firework elements.
 *
 * @component
 *
 * @category Components
 */
export const Fireworks = memo(() => {
	// Only run the animation from August 7th to August 12th, 2026
	const now = new Date();
	const isAnniversaryActive =
		now.getUTCFullYear() === 2026 &&
		now.getUTCMonth() === 7 && // August is 7 (0-indexed)
		now.getUTCDate() >= 7 &&
		now.getUTCDate() <= 12;

	if (!isAnniversaryActive) {
		return null;
	}

	// Staggered configuration for 8 fireworks (denser and more active)
	const configs = [
		{ delay: 0, duration: 2500 },
		{ delay: 0.4, duration: 2300 },
		{ delay: 0.8, duration: 2600 },
		{ delay: 1.2, duration: 2400 },
		{ delay: 1.6, duration: 2700 },
		{ delay: 2.0, duration: 2200 },
		{ delay: 2.4, duration: 2500 },
		{ delay: 2.8, duration: 2800 },
	];

	return (
		<div aria-hidden="true" className="fireworks-container">
			{configs.map((config, idx) => (
				<SingleFirework delay={config.delay} duration={config.duration} key={idx} />
			))}
		</div>
	);
});

Fireworks.displayName = "Fireworks";
