/**
 * @file SEO Middleware for the Express server.
 * @remarks This middleware injects dynamic SEO tags (canonical, hreflang, title, description)
 * into the main `index.html` file for Single Page Application (SPA) routes.
 * It ensures that search engines and social media crawlers receive pre-rendered metadata
 * even for client-side routes.
 * @author jbelew
 * @license GPL-3.0
 */

import etag from "etag";

import { KNOWN_DIALOGS, OTHER_LANGUAGES, SUPPORTED_LANGUAGES, TARGET_HOST } from "../server/config.js";
import i18next from "./i18n.js";

import { seoMetadata } from "../shared/seo-metadata.js";

/**
 * In-memory cache for SEO-injected HTML content.
 * @remarks Indexed by a composite key of `lang:basePath`. Cleared if the base `index.html` file changes.
 * @type {Map<string, {html: string, etag: string}>}
 * @category Cache
 */
const seoCache = new Map();

/**
 * Tracks the ETag of the last known base index.html file.
 * @remarks Used to detect when the cache should be invalidated (e.g., after a build or hot-reload).
 * @type {string|null}
 * @category Cache
 */
let lastBaseIndexETag = null;

/**
 * Express middleware for dynamic SEO tag injection.
 * @remarks
 * This middleware performs several critical functions:
 * 1.  **URL Consolidation:** Redirects `?lng=X` query parameters and `/en/*` paths to canonical versions.
 * 2.  **Language Detection:** Determines the requested language from the URL path.
 * 3.  **Metadata Injection:** Replaces placeholders in `index.html` with localized titles and descriptions from `seoMetadata`.
 * 4.  **Hreflang Generation:** Injects `<link rel="alternate" hreflang="...">` tags for all supported languages.
 * 5.  **Canonical URLs:** Sets the `<link rel="canonical" ...>` tag for the current route.
 * 6.  **Caching:** Stores the final HTML in memory with ETag support to minimize CPU overhead.
 *
 * @async
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {() => Promise<{content: string, etag: string}>} loadIndexHtml - Async function to retrieve the base index.html and its ETag.
 * @param {string} csp - The Content Security Policy string to apply to the response headers.
 * @returns {Promise<void>} Sends the modified HTML or a 304 Not Modified response.
 * @throws {Error} Logs internal errors and sends a 500 status code if injection fails.
 * @see {@link SUPPORTED_LANGUAGES}
 * @see {@link seoMetadata}
 * @see {@link i18next}
 * @category Middleware
 */
export async function seoTagInjectionMiddleware(req, res, loadIndexHtml, csp) {
    const lng = req.query.lng;
    if (lng) {
        const lang = Array.isArray(lng) ? String(lng[0]) : String(lng);
        const supportedLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';

        const newURL = new URL(req.originalUrl, `https://${req.headers.host}`);
        newURL.searchParams.delete('lng');

        if (supportedLang !== 'en') {
            newURL.pathname = `/${supportedLang}${newURL.pathname === '/' ? '' : newURL.pathname}`;
        }

        return res.redirect(301, newURL.href);
    }

    const pathParts = req.path.split("/").filter(Boolean);
    if (pathParts[0] === "en") {
        const cleanPath = `/${pathParts.slice(1).join("/")}`;
        const newURL = new URL(cleanPath, `https://${req.headers.host}`);
        const search = req.originalUrl.split("?")[1];
        if (search) {
            newURL.search = search;
        }
        return res.redirect(301, newURL.href);
    }

    const langFromPath = pathParts[0];
    const lang = OTHER_LANGUAGES.includes(langFromPath) ? langFromPath : "en";

    const pagePathParts = OTHER_LANGUAGES.includes(langFromPath)
        ? pathParts.slice(1)
        : pathParts;
    const pagePath = pagePathParts.join("/");
    const basePath = `/${pagePath}`;
    const cacheKey = `${lang}:${basePath}`;

    try {
        const [ { content: indexHtml, etag: baseEtag }, t ] = await Promise.all([
            loadIndexHtml(),
            i18next.getFixedT(lang)
        ]);

        if (lastBaseIndexETag !== baseEtag) {
            seoCache.clear();
            lastBaseIndexETag = baseEtag;
        }

        if (seoCache.has(cacheKey)) {
            const { html, etag: cachedEtag } = seoCache.get(cacheKey);

            res.setHeader("Content-Security-Policy", csp);
            res.setHeader("Document-Policy", "js-profiling");
            res.setHeader("ETag", cachedEtag);
            res.setHeader("Cache-Control", "public, max-age=0, s-maxage=31536000, must-revalidate, stale-while-revalidate=60");

            if (req.headers["if-none-match"] === cachedEtag) {
                return res.status(304).end();
            }
            return res.type("html").send(html);
        }

        let modifiedHtml = indexHtml;

        const metadata = seoMetadata[basePath === "/" ? "/" : basePath];

        if (metadata) {
            const pageTitle = t(metadata.titleKey, { defaultValue: "NMS Optimizer" });
            const pageDescription = t(metadata.descriptionKey);

            modifiedHtml = modifiedHtml
                .replace(/<title>.*?<\/title>/, `<title>${pageTitle}</title>`)
                .replace(
                    /<meta name="description" content=".*?" \/>/,
                    `<meta name="description" content="${pageDescription}" />`
                )
                .replace(
                    /<meta property="og:title" content=".*?" \/>/,
                    `<meta property="og:title" content="${pageTitle}" />`
                )
                .replace(
                    /<meta property="og:description" content=".*?" \/>/,
                    `<meta property="og:description" content="${pageDescription}" />`
                )
                .replace(
                    /<meta name="twitter:title" content=".*?" \/>/,
                    `<meta name="twitter:title" content="${pageTitle}" />`
                )
                .replace(
                    /<meta name="twitter:description" content=".*?" \/>/,
                    `<meta name="twitter:description" content="${pageDescription}" />`
                );
        }

        const baseUrl = `https://${TARGET_HOST}`;
        const tagsToInject = [];

        const isKnownDialog = KNOWN_DIALOGS.includes(pagePath);
        const isRoot = pagePath === "";

        const cleanPath = basePath === "/" ? "" : basePath;
        const cleanPathname = lang === "en" ? cleanPath || "/" : `/${lang}${cleanPath}`;
        const canonicalUrlBuilder = new URL(cleanPathname, baseUrl);
        const canonicalUrl = canonicalUrlBuilder.href;
        tagsToInject.push(`<link rel="canonical" href="${canonicalUrl}" />`);
        tagsToInject.push(`<meta property="og:url" content="${canonicalUrl}" />`);

        if (isKnownDialog || isRoot) {
            const hreflangUrlBuilder = new URL(canonicalUrl);

            hreflangUrlBuilder.pathname = cleanPath || "/";
            tagsToInject.push(`<link rel="alternate" hreflang="en" href="${hreflangUrlBuilder.href}" />`);
            tagsToInject.push(
                `<link rel="alternate" hreflang="x-default" href="${hreflangUrlBuilder.href}" />`
            );

            OTHER_LANGUAGES.forEach((langCode) => {
                hreflangUrlBuilder.pathname = `/${langCode}${cleanPath}`;
                tagsToInject.push(
                    `<link rel="alternate" hreflang="${langCode}" href="${hreflangUrlBuilder.href}" />`
                );
            });
        }

        modifiedHtml = modifiedHtml.replace("</head>", `  ${tagsToInject.join("\n  ")}\n</head>`);

        const indexEtag = etag(modifiedHtml);

        seoCache.set(cacheKey, { html: modifiedHtml, etag: indexEtag });

        res.setHeader("Content-Security-Policy", csp);
        res.setHeader("Document-Policy", "js-profiling");
        res.setHeader("ETag", indexEtag);
        res.setHeader("Cache-Control", "public, max-age=0, s-maxage=31536000, must-revalidate, stale-while-revalidate=60");

        if (req.headers["if-none-match"] === indexEtag) {
            return res.status(304).end();
        }

        res.type("html").send(modifiedHtml);
    } catch (err) {
        console.error("Error serving index.html:", err);
        res.status(500).send("Internal Server Error");
    }
}
