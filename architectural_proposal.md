# Architectural Proposal: Cloudflare Pages Routing & Performance Fix

## Executive Summary
The application is currently experiencing a critical performance regression where **TTFB has doubled to ~1.1s**. This document outlines the root cause (recursive Function calls) and proposes a minimalist, robust routing strategy that restores performance (<50ms) while strictly adhering to the "PWA + Localized SSG" architecture.

---

## 1. Problem Analysis: The "Recursive Fetch" Loop
The latency is caused by a "double-hop" inside the `functions/[[path]].js` file.

### The Mechanism of Failure
1. **Request**: User hits `/es/performance/`.
2. **Function Trigger**: Since `/*` is included in `_routes.json`, the Function starts.
3. **Internal Fetch**: The Function executes `env.ASSETS.fetch(new Request(...))`.
4. **Recursion**: Because the internal fetch path also matches the `/*` inclusion rule, Cloudflare attempts to run the **same Function again** to satisfy the internal request.
5. **Latency**: This creates a recursive execution chain that Cloudflare eventually resolves after a massive timeout (hence the ~1.1s delay).

---

## 2. Proposed Architecture: "Probe then Fallback"
We will move away from brittle regex-based routing (which requires manual updates for every new PWA route) to a generic, asset-aware pattern.

### Key Principles
* **Disk is Truth**: If a physical file exists (SSG), serve it. 
* **Localized Fallback**: If no file exists, it's a dynamic route; serve the localized PWA shell (`/es/index.html`).
* **Fast Path**: Ensure the shells themselves are **excluded** from the Function to guarantee the internal fetch is a direct CDN hit (0ms Function overhead).

### Technical Changes

#### A. Updated `functions/[[path]].js`
We will replace the specific route checks with a clean "Probe" logic:
```javascript
// 1. Try to serve the exact SSG page/asset first
const response = await context.next();

// 2. If it's a 404, it's a dynamic PWA route. Serve the localized shell.
if (response.status === 404 && !pathname.includes(".")) {
    const langMatch = pathname.match(/^\/(es|fr|de|pt)\//);
    const shellPath = langMatch ? `/${langMatch[1]}/index.html` : "/index.html";
    return await context.env.ASSETS.fetch(new URL(shellPath, url.origin));
}

return response;
```

#### B. Updated `public/_routes.json`
We will add every localized `index.html` shell to the `exclude` list.
* **Why?** This "breaks the recursion." When the Function calls `env.ASSETS.fetch('/es/index.html')`, Cloudflare sees the exclusion and pulls the file directly from the CDN without triggering the Function a second time.

---

## 3. Verification & Testing Plan
I will perform the following tests using `curl` and provide the raw timing/header data for verification:

### Test 1: SSG Performance
* **URL**: `https://nms-optimizer.app/es/about/`
* **Expectation**: `HTTP 200`, `cf-cache-status: HIT`, **TTFB < 50ms**.
* **Goal**: Prove pre-rendered Spanish content is served instantly.

### Test 2: PWA Fallback
* **URL**: `https://nms-optimizer.app/es/performance/`
* **Expectation**: `HTTP 200`, `X-SPA-Fallback: true`, **TTFB < 100ms**.
* **Goal**: Prove dynamic PWA routes get the Spanish shell without recursion.

### Test 3: Language Integrity
* **URL**: `https://nms-optimizer.app/fr/performance/`
* **Expectation**: HTML content contains `lang="fr"`.
* **Goal**: Prove the fallback correctly identifies the language prefix.

---

## 4. Risks & Mitigations
* **Risk**: Accidentally falling back for actual missing assets (images/JS).
* **Mitigation**: The fallback logic explicitly ignores any path containing a dot (`.`), ensuring real 404s for assets remain 404s.
