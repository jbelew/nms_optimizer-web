/**
 * @file Cloudflare Pages Function for NMS Optimizer.
 * @remarks High-performance redirect-only version.
 * Handles canonical host, trailing slashes, and language normalization.
 */

const SUPPORTED_LANGS = ["en", "es", "fr", "de", "pt"];

export async function onRequest(context) {
    const { request, next } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    // 1. Canonical Host Redirect (www. -> apex)
    if (url.hostname === "www.nms-optimizer.app") {
        url.hostname = "nms-optimizer.app";
        return Response.redirect(url.toString(), 301);
    }

    // 2. Trailing Slash Enforcement (e.g., /about -> /about/)
    // Skip for root, files with extensions, and paths already slashed.
    // We EXPLICITLY skip /404 and /500 to allow Cloudflare to map them to the .html files
    // without creating a loop with its internal "Pretty URLs" 308 redirects.
    const isReservedErrorPath = pathname === "/404" || pathname === "/500";
    if (pathname !== "/" && !pathname.endsWith("/") && !pathname.includes(".") && !isReservedErrorPath) {
        url.pathname = pathname + "/";
        return Response.redirect(url.toString(), 301);
    }

    // 3. Language Redirects (?lng=fr -> /fr/)
    const lng = searchParams.get("lng");
    if (lng) {
        const supportedLang = SUPPORTED_LANGS.includes(lng) ? lng : "en";
        const newUrl = new URL(url);
        newUrl.searchParams.delete("lng");
        const cleanPath = pathname === "/" ? "" : pathname.replace(/\/+$/, "");
        
        if (supportedLang === "en") {
            newUrl.pathname = `${cleanPath}/`.replace(/\/+$/, "/");
        } else {
            newUrl.pathname = `/${supportedLang}${cleanPath}/`.replace(/\/+$/, "/");
        }
        return Response.redirect(newUrl.toString(), 301);
    }

    // 4. Remove /en/ prefix (/en/about/ -> /about/)
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts[0] === "en") {
        const newUrl = new URL(url);
        const subPath = pathParts.slice(1).join("/");
        newUrl.pathname = `/${subPath}/`.replace(/\/+$/, "/");
        return Response.redirect(newUrl.toString(), 301);
    }

    // 5. Serve Physical SSG Asset
    return await next();
}
