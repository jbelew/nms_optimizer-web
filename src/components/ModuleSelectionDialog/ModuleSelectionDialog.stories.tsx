import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen } from "storybook/test";

import type { TechTreeItem } from "@/types/tech";
import { fetchTechTree } from "@/hooks/useTechTree/useTechTree";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { useModuleSelectionDialogStore } from "@/store/ui/uiStore";

import { ModuleSelectionDialog } from "./ModuleSelectionDialog";

const createTechTreeLoader =
	(platform: "corvette" | "standard", section: "Hyperdrive" | "Utilities", techKey: string) =>
	async () => {
		const techTree = await fetchTechTree(platform);
		const categoryList = (techTree[section] as TechTreeItem[] | undefined) ?? [];
		const techItem = categoryList.find((t) => t.key === techKey) ?? categoryList[0];
		const initialChecked = techItem?.modules.filter((m) => m.checked).map((m) => m.id) ?? [];

		return { initialChecked, platform, techItem };
	};

const meta: Meta<typeof ModuleSelectionDialog> = {
	component: ModuleSelectionDialog,
	loaders: [createTechTreeLoader("standard", "Hyperdrive", "hyper")],
	parameters: {
		docs: {
			description: {
				component:
					"Shared modal dialog for configuring a Technology Category's Module Selection, displaying categorized Module Groups and the live Solver Window badge.",
			},
		},
		layout: "fullscreen",
	},
	render: function Render(_args, { loaded }) {
		const { initialChecked, platform, techItem } = loaded as {
			initialChecked: string[];
			platform: "corvette" | "standard";
			techItem: TechTreeItem;
		};

		useState(() => {
			if (techItem) {
				usePlatformStore.setState({ selectedPlatform: platform });
				useGridStore.setState({ isSharedGrid: false });
				useTechStore.setState({
					activeGroups: { [techItem.key]: techItem.type || "normal" },
					checkedModules: { [techItem.key]: initialChecked },
					techGroups: { [techItem.key]: [techItem] },
				});
				useModuleSelectionDialogStore.setState({
					isOpen: true,
					selectedTechData: {
						tech: techItem.key,
						techColor: techItem.color,
						techImage: techItem.image,
					},
				});
			}

			return true;
		});

		return <ModuleSelectionDialog />;
	},
	title: "Components/ModuleSelectionDialog",
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story: "Standard technology Module Selection dialog showing Core, Bonus, and Upgrade module groups.",
			},
		},
	},
	play: async () => {
		const dialog = await screen.findByRole("dialog");
		await expect(dialog).toBeInTheDocument();
	},
};

export const Corvette: Story = {
	loaders: [createTechTreeLoader("corvette", "Hyperdrive", "hyper")],
	parameters: {
		docs: {
			description: {
				story: "Corvette platform Module Selection dialog displaying the Corvette module warning banner and Corvette module group.",
			},
		},
	},
	play: async () => {
		const dialog = await screen.findByRole("dialog");
		await expect(dialog).toBeInTheDocument();
	},
};

export const StarshipTrails: Story = {
	loaders: [createTechTreeLoader("standard", "Utilities", "trails")],
	parameters: {
		docs: {
			description: {
				story: "Starship Trails Module Selection dialog displaying the Trails info banner and Cosmetic modules blockquote.",
			},
		},
	},
	play: async () => {
		const dialog = await screen.findByRole("dialog");
		await expect(dialog).toBeInTheDocument();
	},
};
