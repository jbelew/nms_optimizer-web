// functions/_middleware.js

const targetHost = "nms-optimizer.app";

class HeadInjector {
  constructor(canonicalUrl) {
    this.canonicalUrl = canonicalUrl;
  }

  element(element) {
    // Add the canonical link and OG URL meta tag
    element.append(`<link rel="canonical" href="${this.canonicalUrl}" />`, { html: true });
    element.append(`<meta property="og:url" content="${this.canonicalUrl}" />`, { html: true });
  }
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Redirect non-target hosts
  if (url.hostname.toLowerCase() !== targetHost.toLowerCase()) {
    const redirectUrl = new URL(url.pathname + url.search, `https://${targetHost}`);
    return Response.redirect(redirectUrl, 301);
  }

  // Only process GET requests for HTML pages (paths without file extensions)
  // A simple way to check for a file extension in the last path segment
  const hasExtension = url.pathname.split('/').pop().includes('.');
  if (request.method !== 'GET' || hasExtension) {
    return await context.next();
  }

  // Fetch the original page (index.html) from the assets
  const response = await context.next();

  // Clone the response so we can modify headers and still use HTMLRewriter
  const newResponse = new Response(response.body, response);

  // Set the correct content-type header
  newResponse.headers.set('Content-Type', 'text/html');
  
  // Set a no-cache header for the HTML, as it's dynamically modified
  newResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');


  // Create the canonical URL by removing transient query parameters
  url.searchParams.delete("platform");
  url.searchParams.delete("ship");
  url.searchParams.delete("grid");
  const canonicalUrl = url.href;

  // Use HTMLRewriter to inject tags into the <head>
  return new HTMLRewriter()
    .on('head', new HeadInjector(canonicalUrl))
    .transform(newResponse);
}
