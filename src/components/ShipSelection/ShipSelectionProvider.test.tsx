import React from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePlatformStore } from "@/store/app/platformStore";
import { sessionCoordinator } from "@/store/sessionCoordinator";

import { ShipSelectionProvider } from "./ShipSelectionProvider";
import { useShipSelectionContext } from "./useShipSelectionContext";

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

vi.mock("@/hooks/useShipTypes/useShipTypes", () => ({
	useFetchShipTypesSuspense: () => ({
		corvette: { label: "Corvettes", type: "Starship" },
		fighter: { label: "Fighter", type: "Starship" },
		standard: { label: "Standard / Exotic", type: "Starship" },
	}),
}));

vi.mock("@/context/RouteContext", () => ({
	useRouteContext: () => ({ isKnownRoute: true }),
}));

vi.mock("react-i18next", () => ({
	Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
	useTranslation: () => ({
		t: (key: string, defaultVal?: string) => defaultVal ?? key,
	}),
}));

/**
 * Helper component to test ShipSelectionContext values and actions.
 */
const TestConsumer: React.FC = () => {
	const { handleOptionSelect, isPending, selectedShipType } = useShipSelectionContext();

	return (
		<div>
			<span data-testid="selected-platform">{selectedShipType}</span>
			<span data-testid="is-pending">{String(isPending)}</span>
			<button onClick={() => handleOptionSelect("fighter")} type="button">
				Select Fighter
			</button>
			<button onClick={() => handleOptionSelect("standard")} type="button">
				Select Standard
			</button>
			<button onClick={() => handleOptionSelect("corvette")} type="button">
				Select Corvette
			</button>
		</div>
	);
};

describe("ShipSelectionProvider", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		window.history.pushState({}, "", "/?platform=standard");
		usePlatformStore.setState({ selectedPlatform: "standard" });
	});

	it("provides current selectedPlatform from platformStore", () => {
		render(
			<ShipSelectionProvider solving={false}>
				<TestConsumer />
			</ShipSelectionProvider>
		);

		expect(screen.getByTestId("selected-platform")).toHaveTextContent("standard");
	});

	it("does nothing when selecting the already active platform", async () => {
		const user = userEvent.setup();
		const switchPlatformSpy = vi.spyOn(sessionCoordinator, "switchPlatform");

		render(
			<ShipSelectionProvider solving={false}>
				<TestConsumer />
			</ShipSelectionProvider>
		);

		await user.click(screen.getByRole("button", { name: "Select Standard" }));

		expect(switchPlatformSpy).not.toHaveBeenCalled();
		expect(mockNavigate).not.toHaveBeenCalled();
		expect(mockSendDeferredEvent).not.toHaveBeenCalled();
	});

	it("navigates client-side via React Router navigate when a new platform is selected", async () => {
		const user = userEvent.setup();
		const switchPlatformSpy = vi.spyOn(sessionCoordinator, "switchPlatform");

		render(
			<ShipSelectionProvider solving={false}>
				<TestConsumer />
			</ShipSelectionProvider>
		);

		await user.click(screen.getByRole("button", { name: "Select Fighter" }));

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

	it("removes existing grid query parameter when switching platform", async () => {
		const user = userEvent.setup();
		window.history.pushState({}, "", "/es/?platform=standard&grid=SOME_SERIALIZED_GRID");

		render(
			<ShipSelectionProvider solving={false}>
				<TestConsumer />
			</ShipSelectionProvider>
		);

		await user.click(screen.getByRole("button", { name: "Select Fighter" }));

		expect(mockNavigate).toHaveBeenCalledWith("/es/?platform=fighter");
	});

	it("preserves URL hash when switching platform", async () => {
		const user = userEvent.setup();
		window.history.pushState({}, "", "/?platform=standard#module-selection");

		render(
			<ShipSelectionProvider solving={false}>
				<TestConsumer />
			</ShipSelectionProvider>
		);

		await user.click(screen.getByRole("button", { name: "Select Fighter" }));

		expect(mockNavigate).toHaveBeenCalledWith("/?platform=fighter#module-selection");
	});

	it("displays corvette warning toast when switching to corvette", async () => {
		const user = userEvent.setup();

		render(
			<ShipSelectionProvider solving={false}>
				<TestConsumer />
			</ShipSelectionProvider>
		);

		await user.click(screen.getByRole("button", { name: "Select Corvette" }));

		expect(mockShowInfo).toHaveBeenCalledWith(
			"shipSelection.corvetteWarning.title",
			expect.anything()
		);
		expect(mockNavigate).toHaveBeenCalledWith("/?platform=corvette");
	});
});
