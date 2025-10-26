/**
 * @file SEO Middleware for the Express server.
 * This middleware injects dynamic SEO tags (canonical, hreflang, title, description)
 * into the main index.html file for SPA routes.
 */

import etag from "etag";

import { KNOWN_DIALOGS, OTHER_LANGUAGES } from "../server/config.js";
import i18next from "./i18n.js";

import { seoMetadata } from "../shared/seo-metadata.js";

/**
 * An Express middleware that injects SEO-related tags into the HTML response.
 * It handles internationalization (hreflang) and sets the canonical URL based on the request path.
 * It also sets the Content Security Policy and handles ETag-based caching.
 *
 * @async
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {function(): Promise<string>} loadIndexHtml - An async function that returns the content of the index.html file.
 * @param {string} csp - The Content Security Policy string to be applied to the response.
 */
export async function seoTagInjectionMiddleware(req, res, loadIndexHtml, csp) {
    try {
        const indexHtml = await loadIndexHtml();
        let modifiedHtml = indexHtml;

        const pathParts = req.path.split("/").filter(Boolean);
        const langFromPath = pathParts[0];
        const lang = OTHER_LANGUAGES.includes(langFromPath) ? langFromPath : "en";

        const pagePathParts = OTHER_LANGUAGES.includes(langFromPath)
			? pathParts.slice(1)
			: pathParts;
        const pagePath = pagePathParts.join("/");
        const basePath = `/${pagePath}`;

        // --- SEO Title & Description Injection ---
        const t = await i18next.getFixedT(lang);
        const metadata = seoMetadata[basePath === "/" ? "/" : basePath];

        if (metadata) {
            const pageTitle = t(metadata.titleKey, { defaultValue: "NMS Optimizer" });
            const pageDescription = t(metadata.descriptionKey);

            // Replace title and meta description placeholders
            modifiedHtml = modifiedHtml
                .replace(/<title>.*?<\/title>/, `<title>${pageTitle}</title>`)
                .replace(
                    /<meta name="description" content=".*?" \/>/,
                    `<meta name="description" content="${pageDescription}" />`
                );
        }

        // --- SEO Link Tags Injection ---
        const baseUrl = `https://${req.headers.host}`;
        const tagsToInject = [];

        const isKnownDialog = KNOWN_DIALOGS.includes(pagePath);
        const isRoot = pagePath === "";

        // 1. Canonical URL Logic
        const cleanPath = basePath === "/" ? "" : basePath;
        const cleanPathname = lang === "en" ? cleanPath || "/" : `/${lang}${cleanPath}`;
        const canonicalUrlBuilder = new URL(cleanPathname, baseUrl);
        const canonicalUrl = canonicalUrlBuilder.href;
        tagsToInject.push(`<link rel="canonical" href="${canonicalUrl}" />`);
        tagsToInject.push(`<meta property="og:url" content="${canonicalUrl}" />`);

        // 2. Hreflang Tags Logic
        if (isKnownDialog || isRoot) {
            const hreflangUrlBuilder = new URL(canonicalUrl);

            // English (and x-default)
            hreflangUrlBuilder.pathname = cleanPath || "/";
            tagsToInject.push(`<link rel="alternate" hreflang="en" href="${hreflangUrlBuilder.href}" />`);
            tagsToInject.push(
                `<link rel="alternate" hreflang="x-default" href="${hreflangUrlBuilder.href}" />`
            );

            // Other languages
            OTHER_LANGUAGES.forEach((langCode) => {
                hreflangUrlBuilder.pathname = `/${langCode}${cleanPath}`;
                tagsToInject.push(
                    `<link rel="alternate" hreflang="${langCode}" href="${hreflangUrlBuilder.href}" />`
                );
            });
        }

        // Inject all tags before the closing </head> tag
        modifiedHtml = modifiedHtml.replace("</head>", `  ${tagsToInject.join("\n  ")}\n</head>`);

        const indexEtag = etag(modifiedHtml);

        res.setHeader("Content-Security-Policy", csp);
        res.setHeader("ETag", indexEtag);
        res.setHeader("Cache-Control", "no-cache");

        if (req.headers["if-none-match"] === indexEtag) {
            return res.status(304).end();
        }

        res.type("html").send(modifiedHtml);
    } catch (err) {
        console.error("Error serving index.html:", err);
        res.status(500).send("Internal Server Error");
    }
}
