/**
 * @file Unified Page Registry module.
 *
 * @remarks
 * Single source of truth for page definitions, route paths, modal dialog header titles,
 * icons, styles, and SEO metadata mappings across client and build-time environments.
 *
 * @category Routing
 */

/**
 * Configuration definition for an application page or routed modal dialog.
 *
 * @typedef {Object} PageDefinition
 * @property {string} id - Unique page identifier (e.g., "home", "about", "instructions", "changelog", "userstats", "translation", "privacy", "performance").
 * @property {string} routePath - Canonical normalized route path with leading and trailing slashes (e.g., "/", "/about/").
 * @property {string[]} [additionalRoutes] - Optional additional sub-route patterns (e.g., ["performance/:metric/"]).
 * @property {string} [dialogTitleKey] - Translation key for the modal dialog title header (e.g., "dialogs.titles.about").
 * @property {string} seoTitleKey - Translation key for the page or document title naked topic (e.g., "seo.aboutPageTitle").
 * @property {string} seoDescriptionKey - Translation key for the meta description (e.g., "seo.aboutDescription").
 * @property {string} [iconName] - Name of the Radix UI icon component (e.g., "QuestionMarkCircledIcon").
 * @property {Record<string, string>} [iconStyle] - Custom CSS styles for the dialog header icon.
 * @property {string} [markdownFileName] - Markdown filename under locales/{lang}/ (e.g., "about", "translation-request").
 * @property {"default" | "wide" | "full"} [dialogSize] - Modal dialog size variant.
 * @property {boolean} isDialog - Whether this page opens as a modal dialog.
 * @property {"markdown" | "custom"} [componentType] - How the page content is rendered ("markdown" or "custom").
 * @property {boolean} [isClientOnly] - Whether this route is client-only without static pre-rendering.
 * @property {boolean} [excludeFromSitemap] - Whether to exclude this route from the XML sitemap.
 */

/**
 * Canonical registry mapping page IDs to complete page definitions.
 *
 * @type {Record<string, PageDefinition>}
 *
 * @category Routing
 */
export const PAGE_REGISTRY = {
	about: {
		componentType: "markdown",
		dialogSize: "default",
		dialogTitleKey: "dialogs.titles.about",
		iconName: "QuestionMarkCircledIcon",
		id: "about",
		isDialog: true,
		markdownFileName: "about",
		routePath: "/about/",
		seoDescriptionKey: "seo.aboutDescription",
		seoTitleKey: "seo.aboutPageTitle",
	},
	changelog: {
		componentType: "markdown",
		dialogSize: "default",
		dialogTitleKey: "dialogs.titles.changelog",
		iconName: "CounterClockwiseClockIcon",
		id: "changelog",
		isDialog: true,
		markdownFileName: "changelog",
		routePath: "/changelog/",
		seoDescriptionKey: "seo.changelogDescription",
		seoTitleKey: "seo.changelogPageTitle",
	},
	home: {
		componentType: "custom",
		id: "home",
		isDialog: false,
		markdownFileName: "home",
		routePath: "/",
		seoDescriptionKey: "seo.appDescription",
		seoTitleKey: "seo.mainPageTitle",
	},
	instructions: {
		componentType: "markdown",
		dialogSize: "default",
		dialogTitleKey: "dialogs.titles.instructions",
		iconName: "InfoCircledIcon",
		id: "instructions",
		isDialog: true,
		markdownFileName: "instructions",
		routePath: "/instructions/",
		seoDescriptionKey: "seo.instructionsDescription",
		seoTitleKey: "seo.instructionsPageTitle",
	},
	performance: {
		additionalRoutes: ["performance/:metric/"],
		componentType: "custom",
		dialogSize: "wide",
		dialogTitleKey: "dialogs.titles.performance",
		excludeFromSitemap: true,
		iconName: "RocketIcon",
		iconStyle: { color: "var(--cyan-track)" },
		id: "performance",
		isClientOnly: true,
		isDialog: true,
		routePath: "/performance/",
		seoDescriptionKey: "seo.performanceDescription",
		seoTitleKey: "seo.performancePageTitle",
	},
	privacy: {
		componentType: "markdown",
		dialogSize: "default",
		dialogTitleKey: "dialogs.titles.privacy",
		iconName: "EyeNoneIcon",
		id: "privacy",
		isDialog: true,
		markdownFileName: "privacy",
		routePath: "/privacy/",
		seoDescriptionKey: "seo.privacyDescription",
		seoTitleKey: "seo.privacyPageTitle",
	},
	translation: {
		componentType: "markdown",
		dialogSize: "default",
		dialogTitleKey: "dialogs.titles.translationRequest",
		iconName: "GlobeIcon",
		id: "translation",
		isDialog: true,
		markdownFileName: "translation-request",
		routePath: "/translation/",
		seoDescriptionKey: "seo.translationDescription",
		seoTitleKey: "seo.translationPageTitle",
	},
	userstats: {
		componentType: "custom",
		dialogSize: "default",
		dialogTitleKey: "dialogs.titles.userStats",
		iconName: "PieChartIcon",
		id: "userstats",
		isDialog: true,
		routePath: "/userstats/",
		seoDescriptionKey: "seo.userstatsDescription",
		seoTitleKey: "seo.userstatsPageTitle",
	},
};

/**
 * Ordered list of all declared page identifiers.
 *
 * @type {string[]}
 *
 * @category Routing
 */
export const PAGE_IDS = Object.keys(PAGE_REGISTRY);

/**
 * Ordered list of all routed modal dialog identifiers.
 *
 * @type {readonly ["about", "changelog", "instructions", "performance", "privacy", "translation", "userstats"]}
 *
 * @category Routing
 */
export const ROUTED_DIALOG_IDS = /** @type {const} */ ([
	"about",
	"changelog",
	"instructions",
	"performance",
	"privacy",
	"translation",
	"userstats",
]);

/**
 * List of dialog identifiers that participate in build-time static site generation.
 *
 * @type {string[]}
 *
 * @category Routing
 */
export const SSG_DIALOG_IDS = Object.values(PAGE_REGISTRY)
	.filter((page) => page.isDialog && !page.isClientOnly)
	.map((page) => page.id);

/**
 * Retrieves a page definition by its unique identifier.
 *
 * @param {string} id - The page identifier (e.g., "about", "home").
 * @returns {PageDefinition | undefined} The matching page definition or undefined if not found.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const page = getPageById("about");
 * // returns PageDefinition for "about"
 * ```
 */
export const getPageById = (id) => PAGE_REGISTRY[id];

/**
 * Resolves a page definition from a dialog title translation key.
 *
 * @param {string} [titleKey=""] - The dialog title translation key (e.g. "dialogs.titles.about").
 * @returns {PageDefinition | undefined} The matching page definition or undefined if not found.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const page = getPageByDialogTitleKey("dialogs.titles.about");
 * // returns PageDefinition for "about"
 * ```
 */
export const getPageByDialogTitleKey = (titleKey = "") => {
	if (!titleKey) return undefined;

	return Object.values(PAGE_REGISTRY).find((page) => page.dialogTitleKey === titleKey);
};

/**
 * @typedef {Object} ParsedRoutePath
 * @property {string} cleanPath - Normalized route path without language prefix, e.g. "/instructions/" or "/".
 * @property {string} lang - Detected language code from path prefix or default "en".
 */

/**
 * Parses and normalizes a pathname, extracting any language prefix and ensuring consistent trailing slashes.
 *
 * @remarks
 * Handles paths with or without leading slashes, language prefixes (e.g. `/es/instructions/`),
 * and bare route names (e.g. `instructions`).
 *
 * @param {string} [pathname=""] - The raw pathname or route identifier.
 * @param {string[]} [supportedLanguages=["en", "es", "fr", "de", "pt", "it"]] - Array of supported language codes.
 * @returns {ParsedRoutePath} The parsed route path object.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * parseRoutePath("/es/instructions/");
 * // returns { cleanPath: "/instructions/", lang: "es" }
 * ```
 */
export const parseRoutePath = (
	pathname = "",
	supportedLanguages = ["en", "es", "fr", "de", "pt", "it"]
) => {
	const raw = String(pathname).trim().split("?")[0].split("#")[0];
	const parts = raw.split("/").filter(Boolean);

	let lang = "en";
	let pathParts = parts;

	if (parts.length > 0 && supportedLanguages.includes(parts[0])) {
		lang = parts[0];
		pathParts = parts.slice(1);
	}

	const cleanPath = pathParts.length === 0 ? "/" : `/${pathParts.join("/")}/`;

	return {
		cleanPath,
		lang,
	};
};

/**
 * Resolves a page definition from a raw or localized URL pathname.
 *
 * @remarks
 * Handles trailing slashes, leading slashes, language prefixes (e.g., "/es/instructions/"),
 * bare route names (e.g., "instructions"), and additional sub-route patterns (e.g., "/performance/inp/").
 *
 * @param {string} [pathname=""] - The raw URL path or route identifier to look up.
 * @param {string[]} [supportedLanguages=["en", "es", "fr", "de", "pt", "it"]] - Supported language codes.
 * @returns {PageDefinition} The resolved page definition, falling back to the "home" page definition.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const page = getPageByPath("/es/about/");
 * // returns PageDefinition for "about"
 * ```
 */
export const getPageByPath = (
	pathname = "",
	supportedLanguages = ["en", "es", "fr", "de", "pt", "it"]
) => {
	const { cleanPath } = parseRoutePath(pathname, supportedLanguages);

	if (cleanPath === "/") {
		return PAGE_REGISTRY.home;
	}

	const routeSegment = cleanPath.slice(1, -1);
	const normalizedPath = `/${routeSegment}/`;

	const directMatch =
		PAGE_REGISTRY[routeSegment] ||
		Object.values(PAGE_REGISTRY).find(
			(page) => page.routePath === normalizedPath || page.id === routeSegment
		);

	if (directMatch) return directMatch;

	const cleanLookup = cleanPath.replace(/^\/|\/$/g, "");
	const patternMatch = Object.values(PAGE_REGISTRY).find((page) =>
		page.additionalRoutes?.some((pattern) => {
			const cleanPattern = pattern.replace(/^\/|\/$/g, "");
			const regexStr = cleanPattern.replace(/:[a-zA-Z0-9_]+/g, "[^/]+");

			return new RegExp(`^${regexStr}$`).test(cleanLookup);
		})
	);

	if (patternMatch) return patternMatch;

	return PAGE_REGISTRY.home;
};

/**
 * Returns all declared page definitions as an array.
 *
 * @returns {PageDefinition[]} Array of all page definitions.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const pages = getAllPages();
 * // returns array of PageDefinition
 * ```
 */
export const getAllPages = () => Object.values(PAGE_REGISTRY);

/**
 * Returns all routed modal dialog definitions as an array.
 *
 * @returns {PageDefinition[]} Array of routed modal dialog definitions.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const dialogs = getRoutedDialogs();
 * // returns array of PageDefinition where isDialog === true
 * ```
 */
export const getRoutedDialogs = () =>
	Object.values(PAGE_REGISTRY).filter((page) => page.isDialog);
