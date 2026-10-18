import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { createGrid, useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";

import { TechTreeRow } from "./TechTreeRow";

const MOCK_HYPERDRIVE_GROUP = [
	{
		color: "blue" as const,
		image: "starship/hyper.webp",
		key: "hyper",
		label: "Hyperdrive",
		module_count: 3,
		modules: [
			{
				active: true,
				adjacency: "greater",
				adjacency_bonus: 1,
				bonus: 100,
				checked: true,
				id: "HD",
				image: "starship/hyper.webp",
				label: "Hyperdrive",
				sc_eligible: false,
				supercharged: false,
				tech: "hyper",
				type: "core",
				value: 100,
			},
			{
				active: true,
				adjacency: "greater",
				adjacency_bonus: 1,
				bonus: 50,
				checked: true,
				id: "HB1",
				image: "starship/hyper.webp",
				label: "Emergency Warp Unit",
				sc_eligible: true,
				supercharged: false,
				tech: "hyper",
				type: "bonus",
				value: 50,
			},
			{
				active: true,
				adjacency: "greater",
				adjacency_bonus: 1,
				bonus: 250,
				checked: true,
				id: "UA1",
				image: "starship/hyper-upgrade.webp",
				label: "Hyperdrive Upgrade [1]",
				sc_eligible: true,
				supercharged: false,
				tech: "hyper",
				type: "upgrade",
				value: 250,
			},
		],
		type: "normal",
	},
];

const meta = {
	component: TechTreeRow,
	decorators: [
		(Story) => (
			<div className="mx-auto flex min-h-screen max-w-[420px] items-center justify-center p-4">
				<div
					className="w-full rounded-lg p-4 shadow-md"
					style={{ backgroundColor: "var(--color-panel-solid)" }}
				>
					<Story />
				</div>
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					"Single Technology Category row in the TechTree sidebar with solve, reset, bonus quality status icon, and Module Selection trigger.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/TechTreeRow",
} satisfies Meta<typeof TechTreeRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		tech: "hyper",
		techColor: "blue",
		techImage: "starship/hyper.webp",
	},
	decorators: [
		(Story) => {
			React.useState(() => {
				useGridStore.setState({
					activeTechs: new Set<string>(),
					grid: createGrid(10, 6),
					isGridFull: false,
				});
				useTechStore.setState({
					activeGroups: { hyper: "normal" },
					bonusStatus: {},
					checkedModules: { hyper: ["HD", "HB1", "UA1"] },
					maxBonus: {},
					solvedBonus: {},
					techGroups: { hyper: MOCK_HYPERDRIVE_GROUP },
				});

				return true;
			});

			return <Story />;
		},
	],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(await canvas.findByText(/Hyperdrive/i)).toBeInTheDocument();
		await expect(canvas.getByRole("button", { name: /x3/i })).toBeInTheDocument();
	},
};

export const SolvedBoosted: Story = {
	args: {
		tech: "hyper",
		techColor: "blue",
		techImage: "starship/hyper.webp",
	},
	decorators: [
		(Story) => {
			React.useState(() => {
				useGridStore.setState({
					activeTechs: new Set<string>(["hyper"]),
					grid: createGrid(10, 6),
					isGridFull: false,
				});
				useTechStore.setState({
					activeGroups: { hyper: "normal" },
					bonusStatus: { hyper: { icon: "lightning", percent: 25 } },
					checkedModules: { hyper: ["HD", "HB1", "UA1"] },
					maxBonus: { hyper: 100 },
					solvedBonus: { hyper: 125 },
					techGroups: { hyper: MOCK_HYPERDRIVE_GROUP },
				});

				return true;
			});

			return <Story />;
		},
	],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(await canvas.findByText(/Hyperdrive/i)).toBeInTheDocument();
		await expect(canvas.getByRole("button", { name: /\+25%/i })).toBeInTheDocument();
	},
};

export const InsufficientSpace: Story = {
	args: {
		tech: "hyper",
		techColor: "blue",
		techImage: "starship/hyper.webp",
	},
	decorators: [
		(Story) => {
			React.useState(() => {
				useGridStore.setState({
					activeTechs: new Set<string>(["hyper"]),
					grid: createGrid(10, 6),
					isGridFull: false,
				});
				useTechStore.setState({
					activeGroups: { hyper: "normal" },
					bonusStatus: { hyper: { icon: "warning", percent: 20 } },
					checkedModules: { hyper: ["HD", "HB1", "UA1"] },
					maxBonus: { hyper: 100 },
					solvedBonus: { hyper: 80 },
					techGroups: { hyper: MOCK_HYPERDRIVE_GROUP },
				});

				return true;
			});

			return <Story />;
		},
	],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(await canvas.findByText(/Hyperdrive/i)).toBeInTheDocument();
		await expect(canvas.getByRole("button", { name: /-20%/i })).toBeInTheDocument();
	},
};
