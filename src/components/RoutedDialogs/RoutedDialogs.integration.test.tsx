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
import { Provider as ToastProviderRadix } from "@radix-ui/react-toast";
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip";
import { Theme } from "@radix-ui/themes";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import PerformanceDialog from "@/components/AppDialog/Performance/PerformanceDialog";
import UserStatsDialog from "@/components/AppDialog/UserStats/UserStatsDialog";
import AppFooter from "@/components/AppFooter/AppFooter";
import AppHeader from "@/components/AppHeader/AppHeader";
import GridTableButtons from "@/components/GridTableButtons/GridTableButtons";
import { MobileToolbar } from "@/components/MobileToolbar/MobileToolbar";
import { RoutedDialogs } from "@/components/RoutedDialogs/RoutedDialogs";
import { Seo } from "@/components/Seo/Seo";
import { ToastProvider } from "@/hooks/useToast/useToast";
import i18n, { createRealI18nInstance } from "@/test/i18n";
import { getDialogIconAndStyle, radixIconRegistry } from "@/utils/icons/iconRegistry";
import { DialogProvider, useDialog } from "@/utils/system/dialogUtils";
import { formatDocumentTitle, getPageMetadata } from "@shared/page-metadata.js";
import { getRoutedDialogs, PAGE_REGISTRY } from "@shared/page-registry.js";

// Mock only the Markdown file-loader boundary so real MarkdownContentRenderer + react-markdown run
vi.mock("@/hooks/useMarkdownContent/useMarkdownContent", () => ({
	useMarkdownContent: (markdownFileName: string) => ({
		error: null,
		isLoading: false,
		markdown: `## Overview (${markdownFileName})\n\n### Subsection (${markdownFileName})\n\nMarkdown Content: ${markdownFileName}`,
	}),
}));

vi.mock("@/hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(() => true),
}));

vi.mock("@/utils/api/network", () => ({
	apiCall: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/hooks/useTechTree/useTechTree", () => ({
	fetchTechTreeAsync: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/utils/analytics/tracking", () => ({
	sendDeferredEvent: vi.fn(),
	sendEvent: vi.fn(),
}));

const supportedLanguages = ["en", "es", "fr", "de", "it", "pt"];
const SUBPAGE_IDS = ["instructions", "about", "changelog", "userstats", "privacy"] as const;

const EXPECTED_EN_PAGE_HEADINGS: Record<(typeof SUBPAGE_IDS)[number], string> = {
	about: "About the Optimization Algorithms",
	changelog: "Latest Features and Updates",
	instructions: "How to Optimize Your Tech Layout",
	privacy: "Privacy Policy",
	userstats: "Community Meta & Tech Stats",
};

const EXPECTED_DIALOG_TITLES_BY_LOCALE: Record<string, Record<string, string>> = {
	de: {
		about: "Über",
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
		changelog: "Registro de cambios",
		instructions: "Instrucciones",
		privacy: "Política de privacidad",
		userstats: "Estadísticas de usuario",
	},
	fr: {
		about: "À propos",
		changelog: "Notes de version",
		instructions: "Instructions",
		privacy: "Politique de confidentialité",
		userstats: "Statistiques utilisateur",
	},
	it: {
		about: "Informazioni",
		changelog: "Registro modifiche",
		instructions: "Istruzioni",
		privacy: "Informativa sulla privacy",
		userstats: "Statistiche utente",
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

				it.each(SUBPAGE_IDS)(
					"synchronizes %s document title and preserves unchanged modal header title",
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

						expect(meta.title).toContain("NMS Optimizer");

						if (lang === "en") {
							const expectedHeading = EXPECTED_EN_PAGE_HEADINGS[subpageId];
							expect(meta.heading).toBe(expectedHeading);
							expect(meta.title).toBe(`${expectedHeading} | NMS Optimizer`);
						}

						const dialogHeaderTitle = langT(dialog.dialogTitleKey!);
						expect(dialogHeaderTitle).toBe(
							EXPECTED_DIALOG_TITLES_BY_LOCALE[lang][subpageId],
						);
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
			it(`renders ${dialog.id} dialog with semantic <h3> Markdown headings and sole dialog <h1>`, async () => {
				const fileKey = dialog.markdownFileName || dialog.id;
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
				expect(await screen.findByText(`Markdown Content: ${fileKey}`)).toBeInTheDocument();

				const h3Heading = await screen.findByRole("heading", {
					level: 3,
					name: `Subsection (${fileKey})`,
				});
				expect(h3Heading.tagName).toBe("H3");
				expect(document.querySelectorAll("h1")).toHaveLength(1);
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

	describe("Workspace Crawlability & Heading Hierarchy Integration", () => {
		const LocationDisplay: React.FC = () => {
			const location = useLocation();

			return (
				<div data-testid="router-location">{`${location.pathname}${location.search}`}</div>
			);
		};

		const WorkspaceHarness: React.FC<{ solving?: boolean }> = ({ solving = false }) => (
			<>
				<AppHeader />
				<div data-testid="mobile-toolbar-region">
					<MobileToolbar />
				</div>
				<div
					className="main-app__grid-section"
					data-testid="grid-buttons-region"
				>
					<GridTableButtons solving={solving} />
				</div>
				<AppFooter buildVersion="1.0.0" />
				<Suspense fallback={null}>
					<RoutedDialogs />
				</Suspense>
				<LocationDisplay />
			</>
		);

		const WorkspaceShell: React.FC<{ solving?: boolean }> = ({ solving = false }) => (
			<I18nextProvider i18n={realI18n}>
				<DialogProvider>
					<Theme>
						<TooltipProvider>
							<ToastProviderRadix swipeDirection="right">
								<ToastProvider>
									<WorkspaceHarness solving={solving} />
								</ToastProvider>
							</ToastProviderRadix>
						</TooltipProvider>
					</Theme>
				</DialogProvider>
			</I18nextProvider>
		);

		beforeEach(async () => {
			await realI18n.changeLanguage("en");
		});

		it("renders all 7 upgraded Routed Dialog triggers as crawlable links, preserves query params on SPA navigation, and toggles single <h1> between workspace and open dialog", async () => {
			await realI18n.changeLanguage("es");
			const { unmount } = render(
				<MemoryRouter initialEntries={["/es/?platform=corvette"]}>
					<WorkspaceShell />
				</MemoryRouter>,
			);

			try {
				const esT = realI18n.getFixedT("es", "translation");

				// 1. Workspace idle: single <h1> with visually hidden "No Man's Sky - " prefix
				const initialH1s = document.querySelectorAll("h1");
				expect(initialH1s).toHaveLength(1);
				const workspaceHeaderTitle = document.querySelector(".app-header__title");
				expect(workspaceHeaderTitle?.tagName).toBe("H1");
				const srPrefix = workspaceHeaderTitle?.querySelector(".sr-only");
				expect(srPrefix).toHaveClass("whitespace-pre");
				expect(srPrefix?.textContent).toBe("No Man's Sky - ");
				expect(workspaceHeaderTitle?.textContent?.startsWith("No Man's Sky - ")).toBe(true);

				// 2. All 7 upgraded triggers render as crawlable <a href="..."> elements
				const banner = screen.getByRole("banner");
				const headerChangelog = within(banner).getByRole("link", {
					name: esT("buttons.changelog"),
				});
				const headerUserStats = within(banner).getByRole("link", {
					name: esT("buttons.userStats"),
				});

				const mobileRegion = screen.getByTestId("mobile-toolbar-region");
				const mobileChangelog = within(mobileRegion).getByRole("link", {
					name: esT("buttons.changelog"),
				});
				const mobileUserStats = within(mobileRegion).getByRole("link", {
					name: esT("buttons.userStats"),
				});

				const gridRegion = screen.getByTestId("grid-buttons-region");
				const gridInstructions = within(gridRegion).getByRole("link", {
					name: esT("buttons.instructions"),
				});
				const gridAbout = within(gridRegion).getByRole("link", {
					name: esT("buttons.about"),
				});

				const footer = screen.getByRole("contentinfo");
				const footerPrivacy = within(footer).getByRole("link", {
					name: esT("buttons.privacy"),
				});

				expect(headerChangelog).toHaveAttribute("href", "/es/changelog/?platform=corvette");
				expect(headerUserStats).toHaveAttribute("href", "/es/userstats/?platform=corvette");
				expect(mobileChangelog).toHaveAttribute("href", "/es/changelog/?platform=corvette");
				expect(mobileUserStats).toHaveAttribute("href", "/es/userstats/?platform=corvette");
				expect(gridInstructions).toHaveAttribute(
					"href",
					"/es/instructions/?platform=corvette",
				);
				expect(gridAbout).toHaveAttribute("href", "/es/about/?platform=corvette");
				expect(footerPrivacy).toHaveAttribute("href", "/es/privacy/?platform=corvette");

				// 3. Modifier & middle clicks preserve native browser behavior
				expect(fireEvent.click(gridAbout, { button: 0, metaKey: true })).toBe(true);
				expect(fireEvent.click(footerPrivacy, { button: 1 })).toBe(true);
				expect(screen.getByTestId("router-location")).toHaveTextContent(
					"/es/?platform=corvette",
				);

				// 4. Primary left-click opens Routed Dialog via SPA navigation preserving query string
				expect(fireEvent.click(gridInstructions, { button: 0 })).toBe(false);
				expect(screen.getByTestId("router-location")).toHaveTextContent(
					"/es/instructions/?platform=corvette",
				);

				// Wait for lazy Markdown dialog and verify semantic <h3> + sole dialog <h1>
				const h3Heading = await screen.findByRole("heading", {
					level: 3,
					name: "Subsection (instructions)",
				});
				expect(h3Heading.tagName).toBe("H3");

				const demotedWorkspaceTitle = document.querySelector(".app-header__title");
				expect(demotedWorkspaceTitle?.tagName).toBe("DIV");

				const openDialogH1s = document.querySelectorAll("h1");
				expect(openDialogH1s).toHaveLength(1);
				expect(openDialogH1s[0]).toHaveTextContent(esT("dialogs.titles.instructions"));
			} finally {
				unmount();
				await realI18n.changeLanguage("en");
			}
		});

		it("blocks SPA navigation on Instructions and About while solving is active and restores crawlable interactive links when idle", () => {
			const enT = realI18n.getFixedT("en", "translation");
			const { rerender, unmount } = render(
				<MemoryRouter initialEntries={["/?platform=solar"]}>
					<WorkspaceShell solving={true} />
				</MemoryRouter>,
			);

			try {
				const gridRegion = screen.getByTestId("grid-buttons-region");
				const instructionsLink = within(gridRegion).getByRole("link", {
					name: enT("buttons.instructions"),
				});
				const aboutLink = within(gridRegion).getByRole("link", {
					name: enT("buttons.about"),
				});

				expect(instructionsLink).toHaveAttribute("href", "/instructions/?platform=solar");
				expect(aboutLink).toHaveAttribute("href", "/about/?platform=solar");
				expect(instructionsLink).toHaveAttribute("aria-disabled", "true");
				expect(aboutLink).toHaveAttribute("aria-disabled", "true");

				expect(fireEvent.click(instructionsLink, { button: 0 })).toBe(false);
				expect(fireEvent.click(aboutLink, { button: 0 })).toBe(false);
				expect(screen.getByTestId("router-location")).toHaveTextContent("/?platform=solar");

				rerender(
					<MemoryRouter initialEntries={["/?platform=solar"]}>
						<WorkspaceShell solving={false} />
					</MemoryRouter>,
				);

				expect(instructionsLink).not.toHaveAttribute("aria-disabled");
				expect(fireEvent.click(aboutLink, { button: 0 })).toBe(false);
				expect(screen.getByTestId("router-location")).toHaveTextContent(
					"/about/?platform=solar",
				);
			} finally {
				unmount();
			}
		});
	});
});
