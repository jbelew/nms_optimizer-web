/**
 * @file Integration test suite for routed modal dialogs and the Unified Page Registry.
 *
 * @remarks
 * Verifies that all routed modal dialogs have synchronized route paths, header titles,
 * Radix UI icons, and document titles across all supported locales.
 */

import fs from "node:fs";
import path from "node:path";

import React, { act, Suspense } from "react";
import type { i18n as I18nInstance, TFunction } from "i18next";
import { Theme } from "@radix-ui/themes";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";

import PerformanceDialog from "@/components/AppDialog/Performance/PerformanceDialog";
import UserStatsDialog from "@/components/AppDialog/UserStats/UserStatsDialog";
import { RoutedDialogs } from "@/components/RoutedDialogs/RoutedDialogs";
import { Seo } from "@/components/Seo/Seo";
import i18n, { createRealI18nInstance } from "@/test/i18n";
import { getDialogIconAndStyle, radixIconRegistry } from "@/utils/icons/iconRegistry";
import { DialogProvider, useDialog } from "@/utils/system/dialogUtils";
import { formatDocumentTitle, getPageMetadata } from "@shared/page-metadata.js";
import { getRoutedDialogs, PAGE_REGISTRY } from "@shared/page-registry.js";

// Mock MarkdownContentRenderer to avoid async file loads in unit/integration test
vi.mock("@/components/AppDialog/Markdown/MarkdownContentRenderer", () => ({
	MarkdownContentRenderer: ({ markdownFileName }: { markdownFileName: string }) => (
		<div data-testid={`markdown-${markdownFileName}`}>Markdown Content: {markdownFileName}</div>
	),
}));

vi.mock("@/utils/api/network", () => ({
	apiCall: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/hooks/useTechTree/useTechTree", () => ({
	fetchTechTreeAsync: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/utils/analytics/tracking", () => ({
	sendEvent: vi.fn(),
}));

const supportedLanguages = ["en", "es", "fr", "de", "it", "pt"];
const ENRICHED_SUBPAGE_IDS = [
	"instructions",
	"about",
	"changelog",
	"userstats",
	"privacy",
] as const;

const EXPECTED_DIALOG_TITLES_BY_LOCALE: Record<string, Record<string, string>> = {
	de: {
		about: "Über Uns",
		changelog: "Änderungsprotokoll",
		instructions: "Anleitung",
		privacy: "Datenschutz",
		userstats: "Benutzerstatistiken",
	},
	en: {
		about: "About",
		changelog: "Changelog",
		instructions: "Instructions",
		privacy: "Privacy Policy",
		userstats: "User Statistics",
	},
	es: {
		about: "Acerca de",
		changelog: "Registro de Cambios",
		instructions: "Instrucciones",
		privacy: "Política de Privacidad",
		userstats: "Estadísticas de Usuario",
	},
	fr: {
		about: "À Propos",
		changelog: "Notes de Version",
		instructions: "Instructions",
		privacy: "Politique de Confidentialité",
		userstats: "Statistiques Utilisateur",
	},
	it: {
		about: "Informazioni",
		changelog: "Registro Modifiche",
		instructions: "Istruzioni",
		privacy: "Informativa sulla Privacy",
		userstats: "Statistiche Utente",
	},
	pt: {
		about: "Sobre",
		changelog: "Notas de Atualização",
		instructions: "Instruções",
		privacy: "Política de Privacidade",
		userstats: "Estatísticas de Uso",
	},
};

let realI18n: I18nInstance;

beforeAll(async () => {
	realI18n = await createRealI18nInstance("en", supportedLanguages);
});

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
			},
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
					},
				);

				it.each(ENRICHED_SUBPAGE_IDS)(
					"enriches %s document title with No Man's Sky while preserving unchanged modal header title",
					async (subpageId) => {
						const dialog = PAGE_REGISTRY[subpageId];
						const langT = realI18n.getFixedT(lang, "translation");
						const localizedPath =
							lang === "en" ? dialog.routePath : `/${lang}${dialog.routePath}`;

						const meta = getPageMetadata({
							lang,
							pathname: localizedPath,
							supportedLanguages,
							t: langT,
						});

						expect(meta.heading).toContain("No Man's Sky");
						expect(meta.title).toContain("No Man's Sky");
						expect(meta.title).toContain("NMS Optimizer");

						const dialogHeaderTitle = langT(dialog.dialogTitleKey!);
						expect(dialogHeaderTitle).toBe(
							EXPECTED_DIALOG_TITLES_BY_LOCALE[lang][subpageId],
						);
						expect(dialogHeaderTitle).not.toContain("No Man's Sky");
						expect(dialogHeaderTitle).not.toContain(" | ");

						await realI18n.changeLanguage(lang);
						const { unmount } = render(
							<MemoryRouter initialEntries={[localizedPath]}>
								<I18nextProvider i18n={realI18n}>
									<Seo />
								</I18nextProvider>
							</MemoryRouter>,
						);

						expect(document.title).toBe(meta.title);
						expect(document.title).toContain("No Man's Sky");
						unmount();
					},
				);
			});
		});

		it("preserves English root index.html <title> and <meta name='description'> byte-for-byte", () => {
			const indexHtml = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
			const titleMatch = indexHtml.match(/<title>([^<]+)<\/title>/);
			const descMatch = indexHtml.match(
				/<meta\s+name="description"\s+content="([^"]+)"\s*\/>/,
			);

			expect(titleMatch?.[1]).toBe(
				"No Man's Sky Tech Layout &amp; Adjacency Bonus Calculator | NMS Optimizer",
			);
			expect(descMatch?.[1]).toBe(
				"Optimize No Man's Sky technology layouts using advanced algorithms. Maximize adjacency bonuses and supercharged slot boosts for Starships, Multitools, Corvettes, and more.",
			);

			const enT = realI18n.getFixedT("en", "translation");
			const homeMeta = getPageMetadata({
				lang: "en",
				pathname: "/",
				supportedLanguages,
				t: enT,
			});

			expect(homeMeta.title.replace(/&/g, "&amp;")).toBe(titleMatch?.[1]);
			expect(homeMeta.description).toBe(descMatch?.[1]);
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
					</MemoryRouter>,
				);

				const expectedTitle = i18n.t(dialog.dialogTitleKey!);
				const matchingElements = await screen.findAllByText(expectedTitle);
				expect(matchingElements.length).toBeGreaterThanOrEqual(1);
				expect(
					await screen.findByTestId(`markdown-${dialog.markdownFileName || dialog.id}`),
				).toBeInTheDocument();
			});
		});
	});

	describe("Custom Routed Dialog Containers (UserStats & Performance)", () => {
		it("renders UserStatsDialog with correct header derived from Page Registry", async () => {
			await act(async () => {
				render(
					<I18nextProvider i18n={i18n}>
						<Theme>
							<UserStatsDialog
								isOpen={true}
								onClose={vi.fn()}
							/>
						</Theme>
					</I18nextProvider>,
				);
			});

			const expectedTitle = i18n.t("dialogs.titles.userStats");
			const matchingElements = await screen.findAllByText(expectedTitle);
			expect(matchingElements.length).toBeGreaterThanOrEqual(1);
			expect(
				await screen.findByText(i18n.t("dialogs.userStats.description")),
			).toBeInTheDocument();
		});

		it("renders PerformanceDialog with correct header and wide layout derived from Page Registry", async () => {
			await act(async () => {
				render(
					<I18nextProvider i18n={i18n}>
						<Theme>
							<PerformanceDialog
								isOpen={true}
								onClose={vi.fn()}
							/>
						</Theme>
					</I18nextProvider>,
				);
			});

			const expectedTitle = i18n.t("dialogs.titles.performance");
			const matchingElements = await screen.findAllByText(expectedTitle);
			expect(matchingElements.length).toBeGreaterThanOrEqual(1);
			expect(
				await screen.findByText(
					i18n.t(
						"dialogs.performance.description",
						"Aggregate Core Web Vitals and performance metrics from real user sessions (field data).",
					),
				),
			).toBeInTheDocument();
		});

		it("maintains activeDialog as performance when deep-linked or navigated to metric sub-routes", async () => {
			const ActiveDialogSpy: React.FC = () => {
				const { activeDialog } = useDialog();

				return <div data-testid="active-dialog-spy">{activeDialog || "null"}</div>;
			};

			render(
				<MemoryRouter initialEntries={["/performance/inp/"]}>
					<I18nextProvider i18n={i18n}>
						<DialogProvider>
							<ActiveDialogSpy />
						</DialogProvider>
					</I18nextProvider>
				</MemoryRouter>,
			);

			expect(screen.getByTestId("active-dialog-spy")).toHaveTextContent("performance");
		});
	});
});
