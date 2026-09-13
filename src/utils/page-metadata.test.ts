import type { TFunction } from "i18next";
import { describe, expect, it, vi } from "vitest";

import {
	DEFAULT_BASE_URL,
	DEFAULT_OG_IMAGE_PATH,
	extractContentHeading,
	formatDocumentTitle,
	getPageMetadata,
	parseRoutePath,
} from "../../shared/page-metadata.js";

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

		it("preserves root topic without appending duplicate suffix", () => {
			const rootTitle = "NMS Optimizer: Tech Layout & Adjacency Bonus Calculator";
			expect(formatDocumentTitle(rootTitle, "NMS Optimizer", true)).toBe(rootTitle);
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
	});

	describe("getPageMetadata", () => {
		const translations: Record<string, Record<string, string>> = {
			de: {
				appName: "NMS Optimizer",
				"seo.appDescription": "Optimiere No Man's Sky Technologie-Layouts.",
				"seo.instructionsDescription":
					"Lerne das Raster, überladene Slots und das Theta/Tau/Sigma-System kennen.",
				"seo.instructionsPageTitle": "So optimierst du dein Tech-Layout",
				"seo.mainPageTitle": "NMS Optimizer: Tech-Layout- & Adjazenzbonus-Rechner",
			},
			en: {
				appName: "NMS Optimizer",
				"seo.aboutPageTitle": "About the Optimization Algorithms | NMS Optimizer",
				"seo.appDescription": "Optimize No Man's Sky technology layouts.",
				"seo.instructionsDescription":
					"Learn how to use the grid and manage supercharged slots.",
				"seo.instructionsPageTitle": "How to Optimize Your Tech Layout",
				"seo.mainPageTitle": "NMS Optimizer: Tech Layout & Adjacency Bonus Calculator",
				"seo.ogImageAlt": "A detailed screenshot of the NMS Optimizer application.",
			},
			es: {
				appName: "NMS Optimizer",
				"seo.appDescription": "Optimiza diseños de tecnología de No Man's Sky.",
				"seo.instructionsDescription":
					"Aprende a usar la cuadrícula y gestionar ranuras potenciadas.",
				"seo.instructionsPageTitle": "Cómo optimizar tu diseño técnico",
				"seo.mainPageTitle": "NMS Optimizer: Calculadora de Tecnología y Adyacencia NMS",
			},
			fr: {
				appName: "NMS Optimizer",
				"seo.appDescription": "Optimisez vos technologies No Man's Sky.",
				"seo.instructionsDescription":
					"Apprenez à utiliser la grille et les slots surchargés.",
				"seo.instructionsPageTitle": "Comment optimiser vos technologies",
				"seo.mainPageTitle": "NMS Optimizer: Calculateur de Technologie et d'Adjacence",
			},
			it: {
				appName: "NMS Optimizer",
				"seo.appDescription": "Ottimizza i layout tecnologici di No Man's Sky.",
				"seo.instructionsDescription":
					"Scopri come usare la griglia e gestire gli slot sovraccarichi.",
				"seo.instructionsPageTitle": "Come Ottimizzare il Tuo Layout Tecnologico",
				"seo.mainPageTitle":
					"NMS Optimizer: Calcolatore Layout Tecnologia e Bonus Adiacenza",
			},
			pt: {
				appName: "NMS Optimizer",
				"seo.appDescription": "Otimize layouts de tecnologia no No Man's Sky.",
				"seo.instructionsDescription":
					"Aprenda a usar a grade e gerenciar espaços sobrecarregados.",
				"seo.instructionsPageTitle": "Como otimizar seu layout técnico",
				"seo.mainPageTitle": "NMS Optimizer: Calculadora de Tecnologia e Adjacência NMS",
			},
		};

		const createMockT = (lang: string): TFunction<"translation", undefined> => {
			const dict = translations[lang] || translations.en;

			return vi.fn((key: string, options?: { defaultValue?: string }) => {
				return dict[key] || options?.defaultValue || key;
			}) as unknown as TFunction<"translation", undefined>;
		};

		describe("Tracer route: Instructions across all 6 supported locales", () => {
			const locales = [
				{
					expectedHeading: "How to Optimize Your Tech Layout",
					expectedTitle: "How to Optimize Your Tech Layout | NMS Optimizer",
					expectedUrl: "https://nms-optimizer.app/instructions/",
					lang: "en",
				},
				{
					expectedHeading: "Cómo optimizar tu diseño técnico",
					expectedTitle: "Cómo optimizar tu diseño técnico | NMS Optimizer",
					expectedUrl: "https://nms-optimizer.app/es/instructions/",
					lang: "es",
				},
				{
					expectedHeading: "Comment optimiser vos technologies",
					expectedTitle: "Comment optimiser vos technologies | NMS Optimizer",
					expectedUrl: "https://nms-optimizer.app/fr/instructions/",
					lang: "fr",
				},
				{
					expectedHeading: "So optimierst du dein Tech-Layout",
					expectedTitle: "So optimierst du dein Tech-Layout | NMS Optimizer",
					expectedUrl: "https://nms-optimizer.app/de/instructions/",
					lang: "de",
				},
				{
					expectedHeading: "Come Ottimizzare il Tuo Layout Tecnologico",
					expectedTitle: "Come Ottimizzare il Tuo Layout Tecnologico | NMS Optimizer",
					expectedUrl: "https://nms-optimizer.app/it/instructions/",
					lang: "it",
				},
				{
					expectedHeading: "Como otimizar seu layout técnico",
					expectedTitle: "Como otimizar seu layout técnico | NMS Optimizer",
					expectedUrl: "https://nms-optimizer.app/pt/instructions/",
					lang: "pt",
				},
			];

			locales.forEach(({ expectedHeading, expectedTitle, expectedUrl, lang }) => {
				it(`generates correct metadata for instructions in [${lang}]`, () => {
					const t = createMockT(lang);
					const meta = getPageMetadata({
						lang,
						pathname: lang === "en" ? "/instructions/" : `/${lang}/instructions/`,
						t,
					});

					expect(meta.heading).toBe(expectedHeading);
					expect(meta.title).toBe(expectedTitle);
					expect(meta.canonicalUrl).toBe(expectedUrl);
					expect(meta.cleanPath).toBe("/instructions/");
					expect(meta.lang).toBe(lang);
					expect(meta.ogImageUrl).toBe(`${DEFAULT_BASE_URL}${DEFAULT_OG_IMAGE_PATH}`);
					expect(meta.schemas.length).toBeGreaterThan(0);
				});
			});
		});

		describe("Root route", () => {
			it("generates correct metadata for English root", () => {
				const t = createMockT("en");
				const meta = getPageMetadata({
					lang: "en",
					pathname: "/",
					t,
				});

				expect(meta.title).toBe("NMS Optimizer: Tech Layout & Adjacency Bonus Calculator");
				expect(meta.heading).toBe(
					"NMS Optimizer: Tech Layout & Adjacency Bonus Calculator"
				);
				expect(meta.canonicalUrl).toBe("https://nms-optimizer.app/");
				expect(meta.cleanPath).toBe("/");
			});

			it("generates correct metadata for Spanish root", () => {
				const t = createMockT("es");
				const meta = getPageMetadata({
					lang: "es",
					pathname: "/es/",
					t,
				});

				expect(meta.title).toBe(
					"NMS Optimizer: Calculadora de Tecnología y Adyacencia NMS"
				);
				expect(meta.canonicalUrl).toBe("https://nms-optimizer.app/es/");
				expect(meta.cleanPath).toBe("/");
			});
		});

		describe("Unmigrated route behavior", () => {
			it("extracts clean heading and formats title when translation still has pipe", () => {
				const t = createMockT("en");
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

				expect(meta.title).toBe("NMS Optimizer: Tech Layout & Adjacency Bonus Calculator");
				expect(meta.canonicalUrl).toBe("https://nms-optimizer.app/some-unknown-route/");
			});
		});
	});
});
