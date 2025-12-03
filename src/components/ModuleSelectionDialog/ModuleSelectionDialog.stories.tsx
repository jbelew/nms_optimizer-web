import type { GroupedModules, Module } from "./index";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Dialog, Theme } from "@radix-ui/themes";

import { usePlatformStore } from "../../store/PlatformStore";
import { ModuleSelectionDialog } from "./index";

import "./ModuleSelectionDialog.scss";

// Helper function to group modules, adapted from useTechModuleManagement.ts
const groupModules = (modules: Module[]): GroupedModules => {
	const groups: GroupedModules = {
		core: [],
		bonus: [],
		upgrade: [],
		reactor: [],
		cosmetic: [],
		atlantid: [],
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
	title: "Components/ModuleSelectionDialog",
	component: ModuleSelectionDialog,
	decorators: [
		(Story) => (
			<Theme>
				<Dialog.Root open={true}>
					<Story />
				</Dialog.Root>
			</Theme>
		),
	],
	loaders: [
		async () => {
			const response = await fetch(
				"https://nms-optimizer-service-afebcfd47e2a.herokuapp.com/tech_tree/standard"
			);
			const techTree: Record<string, { key: string; modules: Module[] }[]> =
				await response.json();
			const hyperdriveTech = techTree.Hyperdrive.find((t) => t.key === "hyper")!;
			const modules = hyperdriveTech.modules;
			const groupedModules = groupModules(modules);
			const initialChecked = modules
				.filter((m: Module) => m.checked)
				.map((m: Module) => m.id);

			return { groupedModules, modules, initialChecked };
		},
	],
	render: function Render(args, { loaded }) {
		const { groupedModules, modules, initialChecked } = loaded;
		const [currentCheckedModules, setCurrentCheckedModules] = React.useState(initialChecked);

		const nonCoreModuleIds = React.useMemo(
			() => modules.filter((m: Module) => m.type !== "core").map((m: Module) => m.id),
			[modules]
		);

		const allModulesSelected = React.useMemo(
			() => nonCoreModuleIds.every((id: string) => currentCheckedModules.includes(id)),
			[nonCoreModuleIds, currentCheckedModules]
		);

		const isIndeterminate = React.useMemo(
			() =>
				!allModulesSelected &&
				nonCoreModuleIds.some((id: string) => currentCheckedModules.includes(id)),
			[allModulesSelected, nonCoreModuleIds, currentCheckedModules]
		);

		const handleSelectAllChange = (checked: boolean | "indeterminate") => {
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
				groupedModules={groupedModules}
				currentCheckedModules={currentCheckedModules}
				handleValueChange={(values) => {
					console.log("handleValueChange", values);
					setCurrentCheckedModules(values);
				}}
				allModulesSelected={allModulesSelected}
				isIndeterminate={isIndeterminate}
				handleSelectAllChange={handleSelectAllChange}
			/>
		);
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		translatedTechName: "Hyperdrive",
		handleOptimizeClick: async () => console.log("handleOptimizeClick"),
		techColor: "blue",
		techImage: "starship/hyper.webp",
	},
};

export const Corvette: Story = {
	args: {
		translatedTechName: "Hyperdrive",
		handleOptimizeClick: async () => console.log("handleOptimizeClick"),
		techColor: "blue",
		techImage: "starship/hyper.webp",
	},
	decorators: [
		(Story) => {
			usePlatformStore.setState({ selectedPlatform: "corvette" });

			return <Story />;
		},
	],
	loaders: [
		async () => {
			const response = await fetch(
				"https://nms-optimizer-service-afebcfd47e2a.herokuapp.com/tech_tree/corvette"
			);
			const techTree: Record<string, { key: string; modules: Module[] }[]> =
				await response.json();
			const hyperdriveTech = techTree.Hyperdrive.find((t) => t.key === "hyper")!;
			const modules = hyperdriveTech.modules;
			const groupedModules = groupModules(modules);
			const initialChecked = modules
				.filter((m: Module) => m.checked)
				.map((m: Module) => m.id);

			return { groupedModules, modules, initialChecked };
		},
	],
};
