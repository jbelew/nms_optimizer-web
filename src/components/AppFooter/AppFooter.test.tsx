import { Theme } from "@radix-ui/themes";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";

import i18n from "@/test/i18n";

import AppFooter from "./AppFooter";

vi.mock("@/utils/system/dialogUtils", () => ({
	useDialog: () => ({
		closeDialog: vi.fn(),
		openDialog: vi.fn(),
	}),
}));

describe("AppFooter Component", () => {
	const renderComponent = () => {
		return render(
			<I18nextProvider i18n={i18n}>
				<Theme>
					<AppFooter buildVersion="1.0.0" />
				</Theme>
			</I18nextProvider>
		);
	};

	it("should render build version", () => {
		renderComponent();
		expect(screen.getByText(/1.0.0/)).toBeDefined();
	});

	it("should render developer name", () => {
		renderComponent();
		expect(screen.getByText(/void23/i)).toBeDefined();
	});
});
