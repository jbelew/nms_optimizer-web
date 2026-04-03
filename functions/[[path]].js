/**
 * @file Cloudflare Pages Function for NMS Optimizer.
 * @remarks Port of Express middleware (server/app.js & server/seoMiddleware.js).
 * Handles redirects, SPA fallback, and SEO tag injection at the edge.
 */

const SUPPORTED_LANGS = ["en", "es", "fr", "de", "pt"];
const KNOWN_DIALOGS = [
    "instructions",
    "about",
    "changelog",
    "translation",
    "userstats",
    "privacy",
];
const BASE_KNOWN_PATHS = ["/", ...KNOWN_DIALOGS];

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

export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // 1. Language Redirects (?lng=fr -> /fr)
    const lng = searchParams.get("lng");
    if (lng) {
        const supportedLang = SUPPORTED_LANGS.includes(lng) ? lng : "en";
        const newUrl = new URL(url);
        newUrl.searchParams.delete("lng");
        if (supportedLang !== "en") {
            newUrl.pathname = `/${supportedLang}${pathname === "/" ? "" : pathname}`;
        }
        return Response.redirect(newUrl.toString(), 301);
    }

    // 2. Remove /en/ prefix (/en/about -> /about)
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts[0] === "en") {
        const newUrl = new URL(url);
        newUrl.pathname = `/${pathParts.slice(1).join("/")}`;
        return Response.redirect(newUrl.toString(), 301);
    }

    // 3. Try to fetch the static asset (this includes SSG files)
    // We let Cloudflare handle trailing slashes natively to avoid redirect loops.
    let response = await next();

    // 5. SPA Fallback vs 404
    if (response.status === 404) {
        if (isSpaRoute(pathname)) {
            const indexHtmlResponse = await env.ASSETS.fetch(new URL("/index.html", request.url));
            return new Response(indexHtmlResponse.body, {
                status: 200,
                headers: {
                    ...Object.fromEntries(indexHtmlResponse.headers),
                    "Content-Type": "text/html; charset=utf-8",
                    "Cache-Control": "public, max-age=0, s-maxage=31536000, must-revalidate, stale-while-revalidate=60",
                }
            });
        }
        
        // If not an SPA route, serve the custom 404 page
        return env.ASSETS.fetch(new URL("/404.html", request.url));
    }

    return response;
}
