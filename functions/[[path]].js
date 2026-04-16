/**
 * @file Cloudflare Pages Function for NMS Optimizer.
 * @remarks Port of Express middleware (server/app.js & server/seoMiddleware.js).
 * Handles redirects, SPA fallback, and SEO tag injection at the edge.
 */

const TARGET_HOST = "nms-optimizer.app";
const SUPPORTED_LANGS = ["en", "es", "fr", "de", "pt"];
const OTHER_LANGS = ["es", "fr", "de", "pt"];
const KNOWN_DIALOGS = [
    "instructions",
    "about",
    "changelog",
    "translation",
    "userstats",
    "privacy",
];

// Inlined from shared/seo-metadata.js for edge compatibility
const seoMetadata = {
	"/": {
		titleKey: "seo.mainPageTitle",
		descriptionKey: "seo.appDescription",
	},
	"/instructions/": {
		titleKey: "seo.instructionsPageTitle",
		descriptionKey: "seo.instructionsDescription",
	},
	"/about/": {
		titleKey: "seo.aboutPageTitle",
		descriptionKey: "seo.aboutDescription",
	},
	"/changelog/": {
		titleKey: "seo.changelogPageTitle",
		descriptionKey: "seo.changelogDescription",
	},
	"/translation/": {
		titleKey: "seo.translationPageTitle",
		descriptionKey: "seo.translationDescription",
	},
	"/userstats/": {
		titleKey: "seo.userstatsPageTitle",
		descriptionKey: "seo.userstatsDescription",
	},
	"/privacy/": {
		titleKey: "seo.privacyPageTitle",
		descriptionKey: "seo.privacyDescription",
	},
};

/**
 * Checks if a pathname corresponds to a known client-side SPA route.
 */
function isSpaRoute(pathname) {
    const parts = pathname.split("/").filter((p) => p);

    if (parts.length === 0) {
        return true; // Root is always an SPA route
    }

    if (SUPPORTED_LANGS.includes(parts[0])) {
        const page = parts[1];
        return !page || KNOWN_DIALOGS.includes(page);
    }

    return KNOWN_DIALOGS.includes(parts[0]);
}

/**
 * Helper to resolve nested keys in the translation JSON (e.g., "seo.mainPageTitle")
 */
function getTranslation(json, key) {
    if (!json || !key) return null;
    return key.split('.').reduce((obj, i) => (obj ? obj[i] : null), json);
}

// Isolate-level in-memory cache to prevent repeated env.ASSETS.fetch calls
// Cloudflare resets this automatically on every new deployment.
const rawAssetCache = {
    indexHtml: null,
    translations: new Map() // lang -> parsed json
};
const generatedHtmlCache = new Map(); // cacheKey (lang + basePath) -> html string

const SECURITY_HEADERS = {
    "Content-Security-Policy": "default-src 'self'; script-src 'self' www.googletagmanager.com static.cloudflareinsights.com 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: www.google-analytics.com www.googletagmanager.com; font-src 'self'; connect-src 'self' https://nms-optimizer-service-afebcfd47e2a.herokuapp.com wss://nms-optimizer-service-afebcfd47e2a.herokuapp.com https://*.google-analytics.com https://*.googletagmanager.com https://api.nms-optimizer.app https://cloudflareinsights.com https://*.ingest.us.sentry.io https://*.sentry.io; frame-src https://www.youtube.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; upgrade-insecure-requests;",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Permissions-Policy": "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self \"https://www.youtube.com\"), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(self \"https://www.youtube.com\"), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()",
};

export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // 1. Language Redirects (?lng=fr -> /fr/)
    const lng = searchParams.get("lng");
    if (lng) {
        const supportedLang = SUPPORTED_LANGS.includes(lng) ? lng : "en";
        const newUrl = new URL(url);
        newUrl.searchParams.delete("lng");
        if (supportedLang !== "en") {
            newUrl.pathname = `/${supportedLang}${pathname === "/" ? "/" : pathname}`;
        }
        return Response.redirect(newUrl.toString(), 301);
    }

    // 2. Remove /en/ prefix (/en/about/ -> /about/)
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts[0] === "en") {
        const newUrl = new URL(url);
        const subPath = pathParts.slice(1).join("/");
        // Standardize trailing slash for removed /en/
        newUrl.pathname = `/${subPath}${subPath && !subPath.endsWith("/") ? "/" : ""}`;
        return Response.redirect(newUrl.toString(), 301);
    }

    // 3. Try to fetch the static asset (this includes SSG files)
    let response = await next();

    // 4. SPA Fallback with SEO Injection
    if (response.status === 404 && isSpaRoute(pathname)) {
        // Detect language from path
        const langFromPath = pathParts[0];
        const lang = SUPPORTED_LANGS.includes(langFromPath) ? langFromPath : "en";
        
        // Normalize path for metadata lookup
        const pagePathParts = SUPPORTED_LANGS.includes(langFromPath) ? pathParts.slice(1) : pathParts;
        let basePath = `/${pagePathParts.join("/")}`;
        if (basePath !== "/" && !basePath.endsWith("/")) {
            basePath += "/";
        }

        const cacheKey = `${lang}:${basePath}`;
        let html;

        if (generatedHtmlCache.has(cacheKey)) {
            html = generatedHtmlCache.get(cacheKey);
        } else {
            // Concurrently fetch index.html and translations if not in raw cache
            const fetchPromises = [];
            
            if (!rawAssetCache.indexHtml) {
                fetchPromises.push(
                    env.ASSETS.fetch(new URL("/index.html", request.url))
                        .then(r => r.ok ? r.text() : null)
                        .then(text => { rawAssetCache.indexHtml = text; })
                );
            }
            
            if (!rawAssetCache.translations.has(lang)) {
                fetchPromises.push(
                    env.ASSETS.fetch(new URL(`/assets/locales/${lang}/translation.json`, request.url))
                        .then(r => r.ok ? r.json() : {})
                        .then(json => { rawAssetCache.translations.set(lang, json); })
                );
            }

            if (fetchPromises.length > 0) {
                await Promise.all(fetchPromises);
            }

            html = rawAssetCache.indexHtml;
            const translations = rawAssetCache.translations.get(lang);

            if (!html) {
                return new Response("Internal Server Error", { status: 500 });
            }

            const metadata = seoMetadata[basePath];

            if (metadata) {
                const pageTitle = getTranslation(translations, metadata.titleKey) || "NMS Optimizer";
                const pageDescription = getTranslation(translations, metadata.descriptionKey);

                // Inject SEO tags
                html = html
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

                // Canonical and Alternate Tags
                const baseUrl = `https://${TARGET_HOST}`;
                const tagsToInject = [];
                
                // Normalize path for tags
                const cleanPath = basePath === "/" ? "" : basePath;
                const cleanPathname = lang === "en" ? (cleanPath || "/") : `/${lang}${cleanPath}`;
                const canonicalUrl = `${baseUrl}${cleanPathname}`;
                
                tagsToInject.push(`<link rel="canonical" href="${canonicalUrl}" />`);
                tagsToInject.push(`<meta property="og:url" content="${canonicalUrl}" />`);

                // Hreflang injection for known routes
                tagsToInject.push(`<link rel="alternate" hreflang="en" href="${baseUrl}${cleanPath || "/"}" />`);
                tagsToInject.push(`<link rel="alternate" hreflang="x-default" href="${baseUrl}${cleanPath || "/"}" />`);
                
                OTHER_LANGS.forEach((l) => {
                    tagsToInject.push(`<link rel="alternate" hreflang="${l}" href="${baseUrl}/${l}${cleanPath}" />`);
                });

                html = html.replace("</head>", `  ${tagsToInject.join("\n  ")}\n</head>`);
            }

            // Save the fully generated HTML to the cache
            generatedHtmlCache.set(cacheKey, html);
        }

        return new Response(html, {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "public, max-age=0, s-maxage=31536000, must-revalidate, stale-while-revalidate=60",
                ...SECURITY_HEADERS,
            }
        });
    }

    return response;
}
