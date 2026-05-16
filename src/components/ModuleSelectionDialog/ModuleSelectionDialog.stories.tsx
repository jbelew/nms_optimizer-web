import type { GroupedModules, SelectionModule } from "./ModuleSelectionDialog";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Theme } from "@radix-ui/themes";

import { usePlatformStore } from "@/store/app/platformStore";

import { ModuleSelectionDialog } from "./ModuleSelectionDialog";

import "./ModuleSelectionDialog.scss";

// Helper function to group modules, adapted from useTechModuleManagement.ts
/**
 *
 * @example
 */
const groupModules = (modules: SelectionModule[]): GroupedModules => {
	const groups: GroupedModules = {
		atlantid: [],
		bonus: [],
		core: [],
		cosmetic: [],
		reactor: [],
		upgrade: [],
	};

	modules.forEach((module) => {
		const type = module.type || "upgrade";

		if (groups[type]) {
			groups[type].push(module);
		} else {
			groups.upgrade.push(module);
		}
	});

	return groups;
};

const meta: Meta<typeof ModuleSelectionDialog> = {
	component: ModuleSelectionDialog,
	decorators: [
		(Story) => (
			<Theme>
				<Story />
			</Theme>
		),
	],
	loaders: [
		async () => {
			const response = await fetch("https://api.nms-optimizer.app/tech_tree/standard");
			const techTree: Record<string, { key: string; modules: SelectionModule[] }[]> =
				await response.json();
			const hyperdriveTech = techTree.Hyperdrive.find((t) => t.key === "hyper")!;
			const modules = hyperdriveTech.modules;
			const groupedModules = groupModules(modules);
			const initialChecked = modules
				.filter((m: SelectionModule) => m.checked)
				.map((m: SelectionModule) => m.id);

			return { groupedModules, initialChecked, modules };
		},
	],
	parameters: {
		backgrounds: {
			default: "Default",
			values: [{ name: "Default", value: "var(--color-background)" }],
		},
		layout: "fullscreen",
	},
	render: function Render(args, { loaded }) {
		const { groupedModules, initialChecked, modules } = loaded;
		const [currentCheckedModules, setCurrentCheckedModules] = React.useState(initialChecked);

		const nonCoreModuleIds = modules
			.filter((m: SelectionModule) => m.type !== "core")
			.map((m: SelectionModule) => m.id);

		const allModulesSelected = nonCoreModuleIds.every((id: string) =>
			currentCheckedModules.includes(id)
		);

		const isIndeterminate =
			!allModulesSelected &&
			nonCoreModuleIds.some((id: string) => currentCheckedModules.includes(id));

		const handleSelectAllChange = (checked: "indeterminate" | boolean) => {
			console.log("handleSelectAllChange", checked);

			if (checked) {
				setCurrentCheckedModules(nonCoreModuleIds);
			} else {
				setCurrentCheckedModules([]);
			}
		};

		return (
			<ModuleSelectionDialog
				{...args}
				allModulesSelected={allModulesSelected}
				currentCheckedModules={currentCheckedModules}
				groupedModules={groupedModules}
				handleSelectAllChange={handleSelectAllChange}
				handleValueChange={(values) => {
					console.log("handleValueChange", values);
					setCurrentCheckedModules(values);
				}}
				isIndeterminate={isIndeterminate}
				isOpen={args.isOpen ?? true}
			/>
		);
	},
	title: "Components/ModuleSelectionDialog",
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		handleOptimizeClick: async () => console.log("handleOptimizeClick"),
		techColor: "blue",
		techImage: "starship/hyper.webp",
		translatedTechName: "Hyperdrive",
	},
};

export const Corvette: Story = {
	args: {
		handleOptimizeClick: async () => console.log("handleOptimizeClick"),
		techColor: "blue",
		techImage: "starship/hyper.webp",
		translatedTechName: "Hyperdrive",
	},
	decorators: [
		(Story) => {
			usePlatformStore.setState({ selectedPlatform: "corvette" });

			return <Story />;
		},
	],
	loaders: [
		async () => {
			const response = await fetch("https://api.nms-optimizer.app/tech_tree/corvette");
			const techTree: Record<string, { key: string; modules: SelectionModule[] }[]> =
				await response.json();
			const hyperdriveTech = techTree.Hyperdrive.find((t) => t.key === "hyper")!;
			const modules = hyperdriveTech.modules;
			const groupedModules = groupModules(modules);
			const initialChecked = modules
				.filter((m: SelectionModule) => m.checked)
				.map((m: SelectionModule) => m.id);

			return { groupedModules, initialChecked, modules };
		},
	],
};
