# DNS Migration Guide: Heroku to Cloudflare Pages

This guide outlines the steps to migrate the frontend of **NMS Optimizer** from Heroku to Cloudflare Pages while maintaining the API on Heroku.

## Current Architecture
*   **Frontend (Static + SEO):** Moving to Cloudflare Pages (`nms-optimizer-web.pages.dev`).
*   **API (Node.js):** Staying on Heroku (`api.nms-optimizer.app`).

---

## Step 1: Connect Custom Domain to Cloudflare Pages

1.  Log in to the **Cloudflare Dashboard**.
2.  Navigate to **Compute & AI** > **Workers & Pages**.
3.  Select the project: **`nms-optimizer-web`**.
4.  Click the **Custom Domains** tab.
5.  Click **Set up a custom domain**.
6.  Enter your production domain: `nms-optimizer.app`.
7.  Click **Continue**.
8.  Cloudflare will detect that it manages your DNS. Click **Activate domain**.
    *   *This will automatically create a CNAME record for the apex (`@`) pointing to the Pages instance.*

---

## Step 2: Configure API Subdomain (Keep on Heroku)

Ensure your API continues to point to Heroku by verifying the following record in the **DNS** section of your Cloudflare dashboard:

| Type | Name | Content | Proxy Status |
| :--- | :--- | :--- | :--- |
| **CNAME** | `api` | `nms-optimizer-service-afebcfd47e2a.herokuapp.com` | **Proxied (Orange Cloud)** |

---

## Step 3: SSL/TLS Optimization

To ensure secure communication between Cloudflare and both your new Pages frontend and your existing Heroku API:

1.  Go to the **SSL/TLS** section in the Cloudflare sidebar.
2.  Set the encryption mode to **Full (Strict)**.
3.  Ensure **Edge Certificates** > **Always Use HTTPS** is toggled **ON**.

---

## Step 4: Verification

1.  **Frontend:** Visit `https://nms-optimizer.app`.
    *   Check the footer/header for the build version (should match the Cloudflare deployment).
    *   Disable JavaScript to verify that SSG pages are still served correctly.
2.  **API:** Open the browser console or network tab to ensure requests to `https://api.nms-optimizer.app/api/...` are succeeding.
3.  **Analytics:** Verify that Sentry and Google Analytics are still receiving data (the `VITE_` environment variables have already been updated in the Cloudflare build).

## Step 5: Cleanup (After Validation)

Once you are 100% confident in the Cloudflare deployment:
1.  Scale down the Heroku web dyno for the frontend app.
2.  **Do NOT** delete the Heroku API app.
