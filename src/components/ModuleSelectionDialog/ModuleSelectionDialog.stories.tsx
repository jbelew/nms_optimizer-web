import React, { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Theme } from "@radix-ui/themes";

import type { TechTreeItem } from "@/types/tech";
import { usePlatformStore } from "@/store/app/platformStore";
import { useTechStore } from "@/store/tech/techStore";
import { useModuleSelectionDialogStore } from "@/store/ui/uiStore";

import { ModuleSelectionDialog } from "./ModuleSelectionDialog";

import "./ModuleSelectionDialog.scss";

const createTechTreeLoader = (platform: "corvette" | "standard") => async () => {
	const response = await fetch(`https://api.nms-optimizer.app/tech_tree/${platform}`);
	const techTree: Record<string, TechTreeItem[]> = await response.json();
	const hyperdriveTech = techTree.Hyperdrive.find((t) => t.key === "hyper")!;
	const initialChecked = hyperdriveTech.modules.filter((m) => m.checked).map((m) => m.id);

	return { hyperdriveTech, initialChecked };
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
	loaders: [createTechTreeLoader("standard")],
	parameters: {
		backgrounds: {
			default: "Default",
			values: [{ name: "Default", value: "var(--color-background)" }],
		},
		layout: "fullscreen",
	},
	render: function Render(_args, { loaded }) {
		const { hyperdriveTech, initialChecked } = loaded as {
			hyperdriveTech: TechTreeItem;
			initialChecked: string[];
		};

		useEffect(() => {
			useTechStore.setState({
				activeGroups: { hyper: "normal" },
				checkedModules: { hyper: initialChecked },
				techGroups: { hyper: [hyperdriveTech] },
			});
			useModuleSelectionDialogStore.setState({
				isOpen: true,
				selectedTechData: {
					tech: "hyper",
					techColor: "blue",
					techImage: "starship/hyper.webp",
				},
			});
		}, [hyperdriveTech, initialChecked]);

		return <ModuleSelectionDialog />;
	},
	title: "Components/ModuleSelectionDialog",
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	decorators: [
		(Story) => {
			usePlatformStore.setState({ selectedPlatform: "standard" });

			return <Story />;
		},
	],
};

export const Corvette: Story = {
	decorators: [
		(Story) => {
			usePlatformStore.setState({ selectedPlatform: "corvette" });

			return <Story />;
		},
	],
	loaders: [createTechTreeLoader("corvette")],
};
