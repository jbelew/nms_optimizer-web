# Heritage: Heroku & Express Stack (Deprecated 2026-05-15)

This document preserves the configuration and architectural rationale for the legacy Node.js/Express stack previously used to host the NMS Optimizer. 

## Rationale
The project originally used a standalone Express server to:
1. Serve the SPA with correct fallback routing (SPA redirection).
2. Serve pre-rendered SSG pages for SEO.
3. Handle high-performance asset delivery using pre-compressed Gzip/Brotli files.
4. Support the PWA lifecycle (service worker, manifest).

As the project migrated to **Cloudflare Pages** (edge hosting) and **Docker** (containerization), the Express server became redundant. Edge providers handle compression and routing natively, and Bun provides a more performant runtime for any future standalone server needs.

## Key Configurations

### 1. Procfile & Environment
Used by Heroku to determine the startup command.
```yaml
web: bun start
```

### 2. package.json Scripts
```json
{
  "scripts": {
    "start": "bun server/index.js",
    "heroku-postbuild": "bun run build"
  }
}
```

### 3. Server Entry Point (Express)
The server used `express-static-gzip` to serve pre-compressed assets without on-the-fly compression overhead.

```javascript
// server/app.js legacy snippet
import express from 'express';
import expressStaticGzip from 'express-static-gzip';

const app = express();

app.use("/", expressStaticGzip("dist", {
    enableBrotli: true,
    orderPreference: ['br', 'gz'],
    setHeaders: (res) => {
        res.setHeader("Cache-Control", "public, max-age=31536000");
    }
}));
```

### 4. Build-Time Compression (Vite)
To support the Express server, `vite-plugin-compression` was used to generate `.br` and `.gz` files during the production build.

```typescript
// vite.config.ts legacy snippet
import compression from "vite-plugin-compression";

// ... in plugins array:
compression({
    algorithm: "brotliCompress",
    ext: ".br",
    threshold: 10240,
    deleteOriginFile: false,
}),
compression({
    algorithm: "gzip",
    ext: ".gz",
    threshold: 10240,
    deleteOriginFile: false,
}),
```

### 5. GitHub Actions Deployment
```yaml
# .github/workflows/ci.yml legacy snippet
deploy-production-heroku:
  name: Deploy to Heroku (Production)
  needs: [build-production, release]
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v6
    - name: Install Heroku CLI
      run: curl https://cli-assets.heroku.com/install.sh | sh
    - uses: akhileshns/heroku-deploy@v3.15.15
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "nms-optimizer-web"
        heroku_email: ${{ secrets.HEROKU_EMAIL }}
        branch: HEAD
```

## Transition to Cloudflare Pages
By removing this stack, we eliminated:
- **Redundant Dependencies**: `express`, `compression`, `express-static-gzip`.
- **Build Artifacts**: Manually managed `.gz` and `.br` files (Cloudflare handles this at the edge).
- **Server Maintenance**: No more patching Node.js versions or Express vulnerabilities.
