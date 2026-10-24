import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, within } from "storybook/test";

import { useTechStore } from "@/store/tech/techStore";

import OptimizationAlertDialog from "./OptimizationAlertDialog";

const meta = {
	component: OptimizationAlertDialog,
	decorators: [
		(Story) => (
			<div
				className="flex min-h-screen items-center justify-center p-4"
				style={{ margin: "0 auto", maxWidth: "800px" }}
			>
				<Story />
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					"Dialog shown on a Pattern No Fit or Supercharged No Fit warning, displaying required Solver Window dimensions and offering a Forced Solve.",
			},
		},
	},
	title: "Components/AppDialog/OptimizationAlert/OptimizationAlertDialog",
} satisfies Meta<typeof OptimizationAlertDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		isOpen: true,
		onClose: () => {},
		onForceOptimize: async () => {},
		technologyName: "Hyperdrive",
		warningReason: "pattern_no_fit",
	},
	decorators: [
		(Story) => {
			useTechStore.setState({
				activeGroups: {},
				checkedModules: {},
				techGroups: {},
			});

			return <Story />;
		},
	],
	parameters: {
		docs: {
			description: {
				story: "Pattern No Fit alert dialog without Solver Window rules.",
			},
		},
		layout: "fullscreen",
	},
	play: async () => {
		const dialog = await screen.findByRole("dialog");
		await expect(dialog).toBeInTheDocument();
	},
};

export const SuperchargedNoFit: Story = {
	args: {
		isOpen: true,
		onClose: () => {},
		onForceOptimize: async () => {},
		technologyName: "Hyperdrive",
		warningReason: "supercharged_no_fit",
	},
	decorators: [
		(Story) => {
			useTechStore.setState({
				activeGroups: { Hyperdrive: "normal" },
				checkedModules: { Hyperdrive: ["h1", "h2", "h3"] },
				techGroups: {
					Hyperdrive: [
						{
							color: "purple",
							image: null,
							key: "Hyperdrive",
							label: "Hyperdrive",
							module_count: 3,
							modules: [],
							type: "normal",
							window_rules: { "3": [3, 2] },
						},
					],
				},
			});

			return <Story />;
		},
	],
	parameters: {
		docs: {
			description: {
				story: "Supercharged No Fit alert dialog displaying ASD-STE100 copy with required Solver Window dimensions (3 × 2).",
			},
		},
		layout: "fullscreen",
	},
	play: async () => {
		const dialog = await screen.findByRole("dialog");
		await expect(dialog).toBeInTheDocument();
		await expect(within(dialog).getByText(/3×2/)).toBeInTheDocument();
		await expect(
			within(dialog).getByText(/Clear other technologies to make space/i),
		).toBeInTheDocument();
	},
};

export const SuperchargedNoFitWithoutWindowRules: Story = {
	args: {
		isOpen: true,
		onClose: () => {},
		onForceOptimize: async () => {},
		technologyName: "Hyperdrive",
		warningReason: "supercharged_no_fit",
	},
	decorators: [
		(Story) => {
			useTechStore.setState({
				activeGroups: {},
				checkedModules: {},
				techGroups: {},
			});

			return <Story />;
		},
	],
	parameters: {
		docs: {
			description: {
				story: "Supercharged No Fit alert dialog fallback when Solver Window dimensions are unavailable.",
			},
		},
		layout: "fullscreen",
	},
	play: async () => {
		const dialog = await screen.findByRole("dialog");
		await expect(dialog).toBeInTheDocument();
		await expect(
			within(dialog).getByText(
				/There is not enough space around the available supercharged slots for the Solver Window for/i,
			),
		).toBeInTheDocument();
		await expect(within(dialog).queryByText(/3×2/)).not.toBeInTheDocument();
	},
};

export const WithSolverWindowDimensions: Story = {
	args: {
		isOpen: true,
		onClose: () => {},
		onForceOptimize: async () => {},
		technologyName: "Hyperdrive",
		warningReason: "pattern_no_fit",
	},
	decorators: [
		(Story) => {
			useTechStore.setState({
				activeGroups: { Hyperdrive: "normal" },
				checkedModules: { Hyperdrive: ["h1", "h2", "h3"] },
				techGroups: {
					Hyperdrive: [
						{
							color: "purple",
							image: null,
							key: "Hyperdrive",
							label: "Hyperdrive",
							module_count: 3,
							modules: [],
							type: "normal",
							window_rules: { "3": [3, 2] },
						},
					],
				},
			});

			return <Story />;
		},
	],
	parameters: {
		docs: {
			description: {
				story: "Optimization Alert Dialog displaying required Solver Window dimensions (3 × 2).",
			},
		},
		layout: "fullscreen",
	},
	play: async () => {
		const dialog = await screen.findByRole("dialog");
		await expect(dialog).toBeInTheDocument();
		await expect(within(dialog).getByText(/3×2/)).toBeInTheDocument();
	},
};
