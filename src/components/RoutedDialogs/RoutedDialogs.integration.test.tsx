/**
 * @file Integration test suite for routed modal dialogs and the Unified Page Registry.
 *
 * @remarks
 * Verifies that all routed modal dialogs have synchronized route paths, header titles,
 * Radix UI icons, and document titles across all supported locales.
 */

import type { TFunction } from "i18next";
import React, { Suspense } from "react";
import { Theme } from "@radix-ui/themes";
import { formatDocumentTitle, getPageMetadata } from "@shared/page-metadata.js";
import { getRoutedDialogs, PAGE_REGISTRY } from "@shared/page-registry.js";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import PerformanceDialog from "@/components/AppDialog/Performance/PerformanceDialog";
import UserStatsDialog from "@/components/AppDialog/UserStats/UserStatsDialog";
import { RoutedDialogs } from "@/components/RoutedDialogs/RoutedDialogs";
import { DialogProvider } from "@/context/dialogContext";
import i18n from "@/test/i18n";
import { getDialogIconAndStyle, radixIconRegistry } from "@/utils/icons/iconRegistry";

// Mock MarkdownContentRenderer to avoid async file loads in unit/integration test
vi.mock("@/components/AppDialog/Markdown/MarkdownContentRenderer", () => ({
	MarkdownContentRenderer: ({ markdownFileName }: { markdownFileName: string }) => (
		<div data-testid={`markdown-${markdownFileName}`}>Markdown Content: {markdownFileName}</div>
	),
}));

// Mock UserStatsContent and PerformanceContent
vi.mock("@/components/AppDialog/UserStats/userStatsContent", () => ({
	UserStatsContent: () => <div data-testid="userstats-content">User Stats Content</div>,
}));

vi.mock("@/components/AppDialog/Performance/performanceContent", () => ({
	PerformanceContent: () => <div data-testid="performance-content">Performance Content</div>,
}));

const supportedLanguages = ["en", "es", "fr", "de", "it", "pt"];

describe("Routed Dialogs & Page Registry Integration", () => {
	const routedDialogs = getRoutedDialogs();

	describe("Page Registry Invariants", () => {
		it("declares exactly 7 routed modal dialogs and 1 home page", () => {
			expect(routedDialogs.length).toBe(7);
			expect(PAGE_REGISTRY.home.isDialog).toBe(false);
		});

		it.each(routedDialogs)(
			"ensures $id has synchronized dialogTitleKey, seoTitleKey, and valid icon",
			(dialog) => {
				expect(dialog.dialogTitleKey).toBeDefined();
				expect(dialog.seoTitleKey).toBeDefined();
				expect(dialog.seoDescriptionKey).toBeDefined();
				expect(dialog.iconName).toBeDefined();

				// Ensure icon exists in the radix icon registry
				const IconComp = radixIconRegistry[dialog.iconName!];
				expect(IconComp).toBeDefined();

				// Ensure iconRegistry resolves the exact icon component for the title key
				const { IconComponent, style } = getDialogIconAndStyle(dialog.dialogTitleKey);
				expect(IconComponent).toBe(IconComp);

				if (dialog.iconStyle) {
					expect(style).toEqual(dialog.iconStyle);
				}
			}
		);
	});

	describe("Metadata and Dialog Title Alignment across All Locales", () => {
		supportedLanguages.forEach((lang) => {
			describe(`Locale [${lang}]`, () => {
				it.each(routedDialogs)(
					"aligns document title, heading, and dialog title for $id",
					(dialog) => {
						const t = ((key: string, options?: { defaultValue?: string }) => {
							return i18n.t(key, {
								defaultValue: options?.defaultValue || key,
								lng: lang,
							});
						}) as unknown as TFunction<"translation", undefined>;

						const appName = t("appName", { defaultValue: "NMS Optimizer" });
						const localizedPath =
							lang === "en" ? dialog.routePath : `/${lang}${dialog.routePath}`;

						const meta = getPageMetadata({
							lang,
							pathname: localizedPath,
							supportedLanguages,
							t,
						});

						const expectedHeading = t(dialog.seoTitleKey);
						const expectedDocTitle = formatDocumentTitle(expectedHeading, appName);
						const dialogHeaderTitle = t(dialog.dialogTitleKey!);

						expect(meta.heading).toBe(expectedHeading);
						expect(meta.title).toBe(expectedDocTitle);
						expect(dialogHeaderTitle).toBeTruthy();
						expect(dialogHeaderTitle).not.toContain(" | ");
					}
				);
			});
		});
	});

	describe("RoutedDialogs Component Rendering", () => {
		const markdownDialogs = routedDialogs.filter((d) => d.componentType === "markdown");

		markdownDialogs.forEach((dialog) => {
			it(`renders ${dialog.id} dialog when activeDialog is "${dialog.id}"`, async () => {
				render(
					<MemoryRouter initialEntries={[`/${dialog.id}/`]}>
						<I18nextProvider i18n={i18n}>
							<DialogProvider>
								<Theme>
									<Suspense fallback={<div>Loading...</div>}>
										<RoutedDialogs />
									</Suspense>
								</Theme>
							</DialogProvider>
						</I18nextProvider>
					</MemoryRouter>
				);

				const expectedTitle = i18n.t(dialog.dialogTitleKey!);
				const matchingElements = await screen.findAllByText(expectedTitle);
				expect(matchingElements.length).toBeGreaterThanOrEqual(1);
				expect(
					await screen.findByTestId(`markdown-${dialog.markdownFileName || dialog.id}`)
				).toBeInTheDocument();
			});
		});
	});

	describe("Custom Routed Dialog Containers (UserStats & Performance)", () => {
		it("renders UserStatsDialog with correct header derived from Page Registry", async () => {
			render(
				<I18nextProvider i18n={i18n}>
					<Theme>
						<UserStatsDialog isOpen={true} onClose={vi.fn()} />
					</Theme>
				</I18nextProvider>
			);

			const expectedTitle = i18n.t("dialogs.titles.userStats");
			const matchingElements = await screen.findAllByText(expectedTitle);
			expect(matchingElements.length).toBeGreaterThanOrEqual(1);
			expect(screen.getByTestId("userstats-content")).toBeInTheDocument();
		});

		it("renders PerformanceDialog with correct header and wide layout derived from Page Registry", async () => {
			render(
				<I18nextProvider i18n={i18n}>
					<Theme>
						<PerformanceDialog isOpen={true} onClose={vi.fn()} />
					</Theme>
				</I18nextProvider>
			);

			const expectedTitle = i18n.t("dialogs.titles.performance");
			const matchingElements = await screen.findAllByText(expectedTitle);
			expect(matchingElements.length).toBeGreaterThanOrEqual(1);
			expect(screen.getByTestId("performance-content")).toBeInTheDocument();
		});
	});
});
