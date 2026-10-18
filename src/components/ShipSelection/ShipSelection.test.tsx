/// <reference types="@testing-library/jest-dom" />

import React from "react";
import { Theme } from "@radix-ui/themes";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePlatformStore } from "@/store/app/platformStore";
import { sessionCoordinator } from "@/store/sessionCoordinator";

import { ShipSelection } from "./ShipSelection";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
	useNavigate: () => mockNavigate,
}));

const mockSendDeferredEvent = vi.fn();
vi.mock("@/hooks/useAnalytics/useAnalytics", () => ({
	useAnalytics: () => ({
		sendDeferredEvent: mockSendDeferredEvent,
	}),
}));

const mockShowInfo = vi.fn();
vi.mock("@/hooks/useToast/useToast", () => ({
	useToast: () => ({
		showInfo: mockShowInfo,
	}),
}));

const mockCatalog = {
	corvette: { label: "Corvettes", type: "Starship" },
	fighter: { label: "Fighter", type: "Starship" },
	standard: { label: "Standard / Exotic", type: "Starship" },
};

vi.mock("@/store/app/platformStore", async () => {
	const actual = await vi.importActual("@/store/app/platformStore");

	return {
		...actual,
		usePlatformsSuspense: () => mockCatalog,
	};
});

const mockT = vi.fn((key: string, defaultVal?: string) => {
	if (key === "shipSelection.ariaLabel") return "Select ship type";
	if (key === "platforms.standard") return "Standard / Exotic";
	if (key === "platforms.fighter") return "Fighter";
	if (key === "platforms.corvette") return "Corvettes";

	return defaultVal ?? key;
});

vi.mock("react-i18next", () => ({
	Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
	useTranslation: () => ({
		t: mockT,
	}),
}));

describe("ShipSelection", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		window.history.pushState({}, "", "/?platform=standard");
		usePlatformStore.setState({ platforms: mockCatalog, selectedPlatform: "standard" });
	});

	const renderShipSelection = (props: Partial<React.ComponentProps<typeof ShipSelection>> = {}) =>
		render(
			<Theme>
				<ShipSelection solving={false} {...props} />
			</Theme>
		);

	it("renders trigger button with localized accessible name", () => {
		renderShipSelection();
		const triggerButton = screen.getByRole("button", { name: "Select ship type" });
		expect(triggerButton).toBeInTheDocument();
		expect(triggerButton).not.toBeDisabled();
	});

	it("disables trigger button when disabled or solving is true", () => {
		const { rerender } = renderShipSelection({ disabled: true });
		expect(screen.getByRole("button", { name: "Select ship type" })).toBeDisabled();

		rerender(
			<Theme>
				<ShipSelection solving={true} />
			</Theme>
		);
		expect(screen.getByRole("button", { name: "Select ship type" })).toBeDisabled();
	});

	it("does nothing when selecting the already active platform from the dropdown", async () => {
		const user = userEvent.setup();
		const switchPlatformSpy = vi.spyOn(sessionCoordinator, "switchPlatform");

		renderShipSelection();

		await user.click(screen.getByRole("button", { name: "Select ship type" }));
		await user.click(screen.getByRole("menuitemradio", { name: "Standard / Exotic" }));

		expect(switchPlatformSpy).not.toHaveBeenCalled();
		expect(mockNavigate).not.toHaveBeenCalled();
		expect(mockSendDeferredEvent).not.toHaveBeenCalled();
	});

	it("switches platform, updates URL, and sends telemetry when selecting a new platform", async () => {
		const user = userEvent.setup();
		const switchPlatformSpy = vi.spyOn(sessionCoordinator, "switchPlatform");

		renderShipSelection();

		await user.click(screen.getByRole("button", { name: "Select ship type" }));
		await user.click(screen.getByRole("menuitemradio", { name: "Fighter" }));

		expect(switchPlatformSpy).toHaveBeenCalled();
		expect(usePlatformStore.getState().selectedPlatform).toBe("fighter");
		expect(mockNavigate).toHaveBeenCalledWith("/?platform=fighter");
		expect(mockSendDeferredEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "select_content",
				content_type: "platform",
				item_id: "fighter",
			})
		);
	});

	it("removes existing grid query parameter and preserves hash when switching platform", async () => {
		const user = userEvent.setup();
		window.history.pushState(
			{},
			"",
			"/es/?platform=standard&grid=SOME_SERIALIZED_GRID#module-selection"
		);

		renderShipSelection();

		await user.click(screen.getByRole("button", { name: "Select ship type" }));
		await user.click(screen.getByRole("menuitemradio", { name: "Fighter" }));

		expect(mockNavigate).toHaveBeenCalledWith("/es/?platform=fighter#module-selection");
	});

	it("displays corvette warning toast when switching to corvette", async () => {
		const user = userEvent.setup();

		renderShipSelection();

		await user.click(screen.getByRole("button", { name: "Select ship type" }));
		await user.click(screen.getByRole("menuitemradio", { name: "Corvettes" }));

		expect(mockShowInfo).toHaveBeenCalledWith(
			"shipSelection.corvetteWarning.title",
			expect.anything()
		);
		expect(mockNavigate).toHaveBeenCalledWith("/?platform=corvette");
	});
});
