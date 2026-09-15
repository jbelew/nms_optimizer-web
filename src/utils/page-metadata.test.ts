import type { TFunction } from "i18next";
import { describe, expect, it, vi } from "vitest";

import {
	DEFAULT_BASE_URL,
	DEFAULT_OG_IMAGE_PATH,
	extractContentHeading,
	formatDocumentTitle,
	formatErrorDocumentTitle,
	getPageMetadata,
	parseRoutePath,
} from "../../shared/page-metadata.js";
import {
	getAllPages,
	getPageById,
	getPageByPath,
	getRoutedDialogs,
	PAGE_IDS,
	PAGE_REGISTRY,
	ROUTED_DIALOG_IDS,
	SSG_DIALOG_IDS,
} from "../../shared/page-registry.js";

describe("page-metadata.js", () => {
	describe("parseRoutePath", () => {
		it("parses the root path correctly", () => {
			expect(parseRoutePath("/")).toEqual({
				cleanPath: "/",
				lang: "en",
			});
			expect(parseRoutePath("")).toEqual({
				cleanPath: "/",
				lang: "en",
			});
		});

		it("parses secondary subpage routes with or without slashes", () => {
			expect(parseRoutePath("/instructions/")).toEqual({
				cleanPath: "/instructions/",
				lang: "en",
			});
			expect(parseRoutePath("/instructions")).toEqual({
				cleanPath: "/instructions/",
				lang: "en",
			});
			expect(parseRoutePath("instructions")).toEqual({
				cleanPath: "/instructions/",
				lang: "en",
			});
		});

		it("extracts language prefixes for supported locales", () => {
			expect(parseRoutePath("/es/instructions/")).toEqual({
				cleanPath: "/instructions/",
				lang: "es",
			});
			expect(parseRoutePath("/fr/about")).toEqual({
				cleanPath: "/about/",
				lang: "fr",
			});
			expect(parseRoutePath("/de/")).toEqual({
				cleanPath: "/",
				lang: "de",
			});
			expect(parseRoutePath("/de")).toEqual({
				cleanPath: "/",
				lang: "de",
			});
		});

		it("ignores query strings and hash fragments", () => {
			expect(parseRoutePath("/instructions?foo=bar#section")).toEqual({
				cleanPath: "/instructions/",
				lang: "en",
			});
			expect(parseRoutePath("/es/instructions?platform=corvette")).toEqual({
				cleanPath: "/instructions/",
				lang: "es",
			});
		});
	});

	describe("extractContentHeading", () => {
		it("returns naked topic unchanged", () => {
			expect(extractContentHeading("How to Optimize Your Tech Layout", "NMS Optimizer")).toBe(
				"How to Optimize Your Tech Layout"
			);
		});

		it("strips brand suffix when present", () => {
			expect(
				extractContentHeading(
					"How to Optimize Your Tech Layout | NMS Optimizer",
					"NMS Optimizer"
				)
			).toBe("How to Optimize Your Tech Layout");
		});

		it("strips generic pipe suffix if present", () => {
			expect(extractContentHeading("About the Optimization Algorithms | Other Brand")).toBe(
				"About the Optimization Algorithms"
			);
		});

		it("handles empty or falsy inputs", () => {
			expect(extractContentHeading("")).toBe("");
		});
	});

	describe("formatDocumentTitle", () => {
		it("formats standard topic with brand delimiter", () => {
			expect(formatDocumentTitle("How to Optimize Your Tech Layout", "NMS Optimizer")).toBe(
				"How to Optimize Your Tech Layout | NMS Optimizer"
			);
		});

		it("does not duplicate brand suffix if already present", () => {
			expect(
				formatDocumentTitle(
					"How to Optimize Your Tech Layout | NMS Optimizer",
					"NMS Optimizer"
				)
			).toBe("How to Optimize Your Tech Layout | NMS Optimizer");
		});

		it("preserves brand-prefixed titles", () => {
			expect(formatDocumentTitle("NMS Optimizer: Tech Layout", "NMS Optimizer")).toBe(
				"NMS Optimizer: Tech Layout"
			);
			expect(formatDocumentTitle("NMS Optimizer - Tech Layout", "NMS Optimizer")).toBe(
				"NMS Optimizer - Tech Layout"
			);
		});

		it("falls back to appName when topic is empty or equals appName", () => {
			expect(formatDocumentTitle("", "NMS Optimizer")).toBe("NMS Optimizer");
			expect(formatDocumentTitle("NMS Optimizer", "NMS Optimizer")).toBe("NMS Optimizer");
		});

		it("formats error routes and status codes according to brand convention", () => {
			expect(formatDocumentTitle("404: Not Found", "NMS Optimizer")).toBe(
				"404: Not Found | NMS Optimizer"
			);
			expect(formatDocumentTitle("500: Application Error", "NMS Optimizer")).toBe(
				"500: Application Error | NMS Optimizer"
			);
			expect(formatDocumentTitle("Server Error!", "NMS Optimizer")).toBe(
				"Server Error! | NMS Optimizer"
			);
			expect(formatDocumentTitle("404: Nicht gefunden", "NMS Optimizer")).toBe(
				"404: Nicht gefunden | NMS Optimizer"
			);
			expect(formatDocumentTitle("¡Error del Servidor!", "NMS Optimizer")).toBe(
				"¡Error del Servidor! | NMS Optimizer"
			);
		});
	});

	describe("formatErrorDocumentTitle", () => {
		it("formats error routes and status codes according to ${code}: ${message} | ${appName}", () => {
			expect(formatErrorDocumentTitle(404, "Not Found", "NMS Optimizer")).toBe(
				"404: Not Found | NMS Optimizer"
			);
			expect(formatErrorDocumentTitle(500, "Application Error", "NMS Optimizer")).toBe(
				"500: Application Error | NMS Optimizer"
			);
			expect(formatErrorDocumentTitle(500, "Server Error!", "NMS Optimizer")).toBe(
				"500: Server Error! | NMS Optimizer"
			);
			expect(formatErrorDocumentTitle(404, "Nicht gefunden", "NMS Optimizer")).toBe(
				"404: Nicht gefunden | NMS Optimizer"
			);
		});

		it("handles legacy prefixed error topics without duplicate codes or brand suffixes", () => {
			expect(formatErrorDocumentTitle(404, "404: Not Found", "NMS Optimizer")).toBe(
				"404: Not Found | NMS Optimizer"
			);
			expect(
				formatErrorDocumentTitle(404, "404: Not Found | NMS Optimizer", "NMS Optimizer")
			).toBe("404: Not Found | NMS Optimizer");
		});

		it("falls back to code | appName or appName when message is empty", () => {
			expect(formatErrorDocumentTitle(404, "", "NMS Optimizer")).toBe("404 | NMS Optimizer");
			expect(formatErrorDocumentTitle("", "", "NMS Optimizer")).toBe("NMS Optimizer");
		});
	});

	describe("getPageMetadata", () => {
		const translations: Record<string, Record<string, string>> = {
			de: {
				appName: "NMS Optimizer",
				"seo.aboutDescription":
					"Erfahre, wie der NMS-Optimierer mit Algorithmen und Rust die absolut besten Modulplatzierungen für dein Gear berechnet.",
				"seo.aboutPageTitle": "Über die Optimierungsalgorithmen",
				"seo.appDescription": "Optimiere No Man's Sky Technologie-Layouts.",
				"seo.changelogDescription":
					"Bleibe auf dem Laufenden mit den neuesten Funktionen, Fehlerbehebungen und Algorithmus-Verbesserungen des NMS-Optimierers.",
				"seo.changelogPageTitle": "Neueste Funktionen und Updates",
				"seo.instructionsDescription":
					"Lerne das Raster, überladene Slots und das Theta/Tau/Sigma-System kennen.",
				"seo.instructionsPageTitle": "So optimierst du dein Tech-Layout",
				"seo.mainPageTitle": "No Man's Sky Tech-Layout- & Adjazenzbonus-Rechner",
				"seo.ogImageAlt": "Ein detaillierter Screenshot des NMS-Optimierers.",
				"seo.performanceDescription":
					"Echtzeit-Leistungsmetriken und Core Web Vitals für die NMS Optimizer-Anwendung.",
				"seo.performancePageTitle": "Leistungsmetriken",
				"seo.privacyDescription": "Lies unser Versprechen zum Datenschutz.",
				"seo.privacyPageTitle": "Datenschutzrichtlinie",
				"seo.translationDescription":
					"Trage zur No Man's Sky Community bei, indem du bei der Übersetzung des NMS-Optimierers hilfst.",
				"seo.translationPageTitle": "Hilf beim Übersetzen: Werde Teil von NMS Optimizer",
				"seo.userstatsDescription": "Entdecke das No Man's Sky Meta.",
				"seo.userstatsPageTitle": "Community-Meta & Tech-Statistiken",
			},
			en: {
				appName: "NMS Optimizer",
				"seo.aboutDescription":
					"Discover how NMS Optimizer uses advanced algorithms and a high-performance Rust solver.",
				"seo.aboutPageTitle": "About the Optimization Algorithms",
				"seo.appDescription": "Optimize No Man's Sky technology layouts.",
				"seo.changelogDescription":
					"Stay updated with the latest NMS Optimizer features, bug fixes, and algorithm improvements.",
				"seo.changelogPageTitle": "Latest Features and Updates",
				"seo.instructionsDescription":
					"Learn how to use the grid and manage supercharged slots.",
				"seo.instructionsPageTitle": "How to Optimize Your Tech Layout",
				"seo.mainPageTitle": "No Man's Sky Tech Layout & Adjacency Calculator",
				"seo.ogImageAlt": "A detailed screenshot of the NMS Optimizer application.",
				"seo.performanceDescription":
					"Real-time performance metrics and Core Web Vitals for the NMS Optimizer application.",
				"seo.performancePageTitle": "Performance Metrics",
				"seo.privacyDescription": "Read about our commitment to your privacy.",
				"seo.privacyPageTitle": "Privacy Policy",
				"seo.translationDescription":
					"Contribute to the No Man's Sky community by helping translate the NMS Optimizer.",
				"seo.translationPageTitle": "Help Translate NMS Optimizer: Join the Team",
				"seo.userstatsDescription": "Explore the current No Man's Sky build meta.",
				"seo.userstatsPageTitle": "Community Meta & Tech Stats",
			},
			es: {
				appName: "NMS Optimizer",
				"seo.aboutDescription":
					"Descubre cómo NMS Optimizer usa algoritmos avanzados y Rust.",
				"seo.aboutPageTitle": "Sobre los algoritmos de optimización",
				"seo.appDescription": "Optimiza diseños de tecnología de No Man's Sky.",
				"seo.changelogDescription":
					"Mantente al día con las últimas funciones, correcciones y mejoras del algoritmo de NMS Optimizer.",
				"seo.changelogPageTitle": "Últimas funciones y actualizaciones",
				"seo.instructionsDescription":
					"Aprende a usar la cuadrícula y gestionar ranuras potenciadas.",
				"seo.instructionsPageTitle": "Cómo optimizar tu diseño técnico",
				"seo.mainPageTitle": "Calculadora de Tecnología y Adyacencia de No Man's Sky",
				"seo.ogImageAlt":
					"Una captura de pantalla detallada de la aplicación NMS Optimizer.",
				"seo.performanceDescription":
					"Métricas de rendimiento en tiempo real y Core Web Vitals para la aplicación NMS Optimizer.",
				"seo.performancePageTitle": "Métricas de Rendimiento",
				"seo.privacyDescription": "Lee sobre nuestro compromiso con tu privacidad.",
				"seo.privacyPageTitle": "Política de privacidad",
				"seo.translationDescription":
					"Contribuye a la comunidad de No Man's Sky ayudando a traducir NMS Optimizer.",
				"seo.translationPageTitle": "Ayuda a traducir NMS Optimizer: Únete al equipo",
				"seo.userstatsDescription": "Explora el meta de No Man's Sky.",
				"seo.userstatsPageTitle": "Meta de la comunidad y estadísticas",
			},
			fr: {
				appName: "NMS Optimizer",
				"seo.aboutDescription":
					"Découvrez comment NMS Optimizer utilise des algorithmes et Rust.",
				"seo.aboutPageTitle": "À propos des algorithmes d'optimisation",
				"seo.appDescription": "Optimisez vos technologies No Man's Sky.",
				"seo.changelogDescription":
					"Restez informé des dernières fonctionnalités, corrections et améliorations de l'algorithme de l'NMS Optimizer.",
				"seo.changelogPageTitle": "Dernières nouveautés et mises à jour",
				"seo.instructionsDescription":
					"Apprenez à utiliser la grille et les slots surchargés.",
				"seo.instructionsPageTitle": "Comment optimiser vos technologies",
				"seo.mainPageTitle": "Calculateur de Technologie et d'Adjacence No Man's Sky",
				"seo.ogImageAlt": "Une capture d'écran détaillée de l'application NMS Optimizer.",
				"seo.performanceDescription":
					"Mesures de performance en temps réel et Core Web Vitals pour l'application NMS Optimizer.",
				"seo.performancePageTitle": "Mesures de Performance",
				"seo.privacyDescription": "Découvrez notre engagement pour votre vie privée.",
				"seo.privacyPageTitle": "Politique de confidentialité",
				"seo.translationDescription":
					"Contribuez à la communauté No Man's Sky en aidant à traduire l'NMS Optimizer.",
				"seo.translationPageTitle": "Aidez à traduire NMS Optimizer : Rejoignez l'équipe",
				"seo.userstatsDescription": "Explorez la meta No Man's Sky.",
				"seo.userstatsPageTitle": "Meta communautaire et statistiques",
			},
			it: {
				appName: "NMS Optimizer",
				"seo.aboutDescription":
					"Scopri come NMS Optimizer utilizza algoritmi avanzati e un risolutore Rust.",
				"seo.aboutPageTitle": "Informazioni sugli Algoritmi di Ottimizzazione",
				"seo.appDescription": "Ottimizza i layout tecnologici di No Man's Sky.",
				"seo.changelogDescription":
					"Rimani aggiornato con le ultime funzionalità, correzioni di bug e miglioramenti degli algoritmi di NMS Optimizer.",
				"seo.changelogPageTitle": "Ultime Funzionalità e Aggiornamenti",
				"seo.instructionsDescription":
					"Scopri come usare la griglia e gestire gli slot sovraccarichi.",
				"seo.instructionsPageTitle": "Come Ottimizzare il Tuo Layout Tecnologico",
				"seo.mainPageTitle": "Calcolatore Layout Tecnologia e Bonus Adiacenza No Man's Sky",
				"seo.ogImageAlt": "Uno screenshot dettagliato dell'applicazione NMS Optimizer.",
				"seo.performanceDescription":
					"Metriche di performance in tempo reale e Core Web Vitals per l'applicazione NMS Optimizer.",
				"seo.performancePageTitle": "Metriche di Prestazione",
				"seo.privacyDescription": "Leggi il nostro impegno per la tua privacy.",
				"seo.privacyPageTitle": "Informativa sulla Privacy",
				"seo.translationDescription":
					"Contribuisci alla community di No Man's Sky aiutando a tradurre NMS Optimizer.",
				"seo.translationPageTitle": "Aiuta a Tradurre NMS Optimizer: Unisciti al Team",
				"seo.userstatsDescription":
					"Esplora l'attuale meta di configurazione di No Man's Sky.",
				"seo.userstatsPageTitle": "Meta della Community e Statistiche Tecnologiche",
			},
			pt: {
				appName: "NMS Optimizer",
				"seo.aboutDescription": "Descubra como o NMS Optimizer usa algoritmos e Rust.",
				"seo.aboutPageTitle": "Sobre os algoritmos de otimização",
				"seo.appDescription": "Otimize layouts de tecnologia no No Man's Sky.",
				"seo.changelogDescription":
					"Fique por dentro das últimas funcionalidades, correções e melhorias no algoritmo do NMS Optimizer.",
				"seo.changelogPageTitle": "Últimas novidades e atualizações",
				"seo.instructionsDescription":
					"Aprenda a usar a grade e gerenciar espaços sobrecarregados.",
				"seo.instructionsPageTitle": "Como otimizar seu layout técnico",
				"seo.mainPageTitle": "Calculadora de Tecnologia e Adjacência de No Man's Sky",
				"seo.ogImageAlt": "Uma captura de tela detalhada do aplicativo NMS Optimizer.",
				"seo.performanceDescription":
					"Métricas de desempenho em tempo real e Core Web Vitals para o aplicativo NMS Optimizer.",
				"seo.performancePageTitle": "Métricas de Desempenho",
				"seo.privacyDescription": "Leia sobre nosso compromisso com sua privacidade.",
				"seo.privacyPageTitle": "Política de Privacidade",
				"seo.translationDescription":
					"Contribua com a comunidade de No Man's Sky ajudando a traduzir o NMS Optimizer.",
				"seo.translationPageTitle": "Ajude a traduzir o NMS Optimizer: Una-se à equipe",
				"seo.userstatsDescription": "Explore o meta de No Man's Sky.",
				"seo.userstatsPageTitle": "Meta da comunidade e estatísticas",
			},
		};

		const createMockT = (lang: string): TFunction<"translation", undefined> => {
			const dict = translations[lang] || translations.en;

			return vi.fn((key: string, options?: { defaultValue?: string }) => {
				return dict[key] || options?.defaultValue || key;
			}) as unknown as TFunction<"translation", undefined>;
		};

		const routes = [
			{
				key: "home",
				path: "/",
				titleKey: "seo.mainPageTitle",
			},
			{
				key: "about",
				path: "/about/",
				titleKey: "seo.aboutPageTitle",
			},
			{
				key: "instructions",
				path: "/instructions/",
				titleKey: "seo.instructionsPageTitle",
			},
			{
				key: "changelog",
				path: "/changelog/",
				titleKey: "seo.changelogPageTitle",
			},
			{
				key: "userstats",
				path: "/userstats/",
				titleKey: "seo.userstatsPageTitle",
			},
			{
				key: "translation",
				path: "/translation/",
				titleKey: "seo.translationPageTitle",
			},
			{
				key: "privacy",
				path: "/privacy/",
				titleKey: "seo.privacyPageTitle",
			},
			{
				key: "performance",
				path: "/performance/",
				titleKey: "seo.performancePageTitle",
			},
		];

		const supportedLangs = ["en", "es", "fr", "de", "it", "pt"];

		describe("Comprehensive 48-route test matrix across all 6 supported locales", () => {
			supportedLangs.forEach((lang) => {
				describe(`Locale [${lang}]`, () => {
					routes.forEach(({ key, path, titleKey }) => {
						it(`generates uniform metadata and clean headings for route ${path} (${key})`, () => {
							const t = createMockT(lang);
							const expectedHeading = translations[lang][titleKey];
							const expectedTitle = `${expectedHeading} | NMS Optimizer`;
							const localizedPath =
								lang === "en" ? path : `/${lang}${path === "/" ? "/" : path}`;
							const expectedUrl = `${DEFAULT_BASE_URL}${localizedPath}`;

							const meta = getPageMetadata({
								lang,
								pathname: localizedPath,
								t,
							});

							expect(meta.heading).toBe(expectedHeading);
							expect(meta.title).toBe(expectedTitle);
							expect(meta.canonicalUrl).toBe(expectedUrl);
							expect(meta.cleanPath).toBe(path);
							expect(meta.lang).toBe(lang);
							expect(meta.ogImageUrl).toBe(
								`${DEFAULT_BASE_URL}${DEFAULT_OG_IMAGE_PATH}`
							);
							expect(meta.schemas.length).toBeGreaterThan(0);
						});
					});
				});
			});
		});

		describe("Legacy unmigrated title handling", () => {
			it("extracts clean heading and formats title when translation still has pipe suffix", () => {
				const customDict: Record<string, string> = {
					appName: "NMS Optimizer",
					"seo.aboutPageTitle": "About the Optimization Algorithms | NMS Optimizer",
				};
				const t = vi.fn((key: string, options?: { defaultValue?: string }) => {
					return customDict[key] || options?.defaultValue || key;
				}) as unknown as TFunction<"translation", undefined>;

				const meta = getPageMetadata({
					lang: "en",
					pathname: "/about/",
					t,
				});

				expect(meta.heading).toBe("About the Optimization Algorithms");
				expect(meta.title).toBe("About the Optimization Algorithms | NMS Optimizer");
				expect(meta.canonicalUrl).toBe("https://nms-optimizer.app/about/");
			});
		});

		describe("Fallbacks and edge cases", () => {
			it("falls back to root metadata and appName for unknown routes", () => {
				const t = createMockT("en");
				const meta = getPageMetadata({
					lang: "en",
					pathname: "/some-unknown-route/",
					t,
				});

				expect(meta.title).toBe(
					"No Man's Sky Tech Layout & Adjacency Calculator | NMS Optimizer"
				);
				expect(meta.heading).toBe("No Man's Sky Tech Layout & Adjacency Calculator");
				expect(meta.canonicalUrl).toBe("https://nms-optimizer.app/some-unknown-route/");
			});
		});
	});

	describe("page-registry.js", () => {
		it("declares all expected page definitions with complete properties", () => {
			const expectedPages = [
				"about",
				"changelog",
				"home",
				"instructions",
				"performance",
				"privacy",
				"translation",
				"userstats",
			];

			expect(PAGE_IDS).toEqual(expectedPages);

			expectedPages.forEach((id) => {
				const page = PAGE_REGISTRY[id];
				expect(page).toBeDefined();
				expect(page.id).toBe(id);
				expect(page.routePath.startsWith("/")).toBe(true);
				expect(page.routePath.endsWith("/")).toBe(true);
				expect(page.seoTitleKey).toBeTruthy();
				expect(page.seoDescriptionKey).toBeTruthy();

				if (page.isDialog) {
					expect(page.dialogTitleKey).toBeTruthy();
					expect(page.iconName).toBeTruthy();
				}
			});
		});

		it("correctly identifies routed modal dialogs", () => {
			const expectedRouted = [
				"about",
				"changelog",
				"instructions",
				"performance",
				"privacy",
				"translation",
				"userstats",
			];
			expect(ROUTED_DIALOG_IDS).toEqual(expectedRouted);

			const dialogs = getRoutedDialogs();
			expect(dialogs.map((d) => d.id)).toEqual(expectedRouted);
			dialogs.forEach((d) => expect(d.isDialog).toBe(true));
		});

		it("filters SSG dialogs excluding client-only routes", () => {
			expect(SSG_DIALOG_IDS).not.toContain("performance");
			expect(SSG_DIALOG_IDS).toContain("about");
			expect(SSG_DIALOG_IDS).toContain("instructions");
		});

		it("resolves pages by ID via getPageById", () => {
			expect(getPageById("about")?.id).toBe("about");
			expect(getPageById("instructions")?.routePath).toBe("/instructions/");
			expect(getPageById("non-existent")).toBeUndefined();
		});

		it("resolves pages by path via getPageByPath across locales and formats", () => {
			expect(getPageByPath("/")?.id).toBe("home");
			expect(getPageByPath("")?.id).toBe("home");
			expect(getPageByPath("/about/")?.id).toBe("about");
			expect(getPageByPath("/about")?.id).toBe("about");
			expect(getPageByPath("about")?.id).toBe("about");
			expect(getPageByPath("/fr/instructions/")?.id).toBe("instructions");
			expect(getPageByPath("/de/changelog")?.id).toBe("changelog");
			expect(getPageByPath("/performance/")?.id).toBe("performance");
			expect(getPageByPath("/performance/inp/")?.id).toBe("performance");
			expect(getPageByPath("/performance/lcp")?.id).toBe("performance");
			expect(getPageByPath("/fr/performance/cls/")?.id).toBe("performance");
			expect(getPageByPath("/es/")?.id).toBe("home");
			expect(getPageByPath("/unknown-page")?.id).toBe("home");
			expect(getPageByPath("/about/invalid-subpath")?.id).toBe("home");
			expect(getPageByPath("/performance/inp/extra-segment")?.id).toBe("home");
		});

		it("returns all pages via getAllPages", () => {
			const all = getAllPages();
			expect(all.length).toBe(8);
			expect(all.map((p) => p.id)).toContain("home");
			expect(all.map((p) => p.id)).toContain("about");
		});
	});
});
