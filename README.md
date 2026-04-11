# No Man's Sky Technology Layout Optimizer (Web UI)

## CI/CD Status

[![CI Pipeline](https://github.com/jbelew/nms_optimizer-web/actions/workflows/ci.yml/badge.svg)](https://github.com/jbelew/nms_optimizer-web/actions/workflows/ci.yml)
![Deployment](https://img.shields.io/badge/Deployment-Heroku-blue?logo=heroku)
[![Build & Publish Application Docker Image](https://github.com/jbelew/nms_optimizer-web/actions/workflows/publish-images.yml/badge.svg)](https://github.com/jbelew/nms_optimizer-web/actions/workflows/publish-images.yml)

**A high-performance Web UI for a No Man's Sky technology layout optimization tool.**

This tool optimizes technology layouts by calculating pattern-based scores. It prioritizes supercharged slots using game-tested configurations and ensures the best fit within the grid. When additional supercharged slots are in range of a pattern, the tool runs localized Simulated Annealing or ML-driven solves to explore non-standard layouts that offer additional benefits.

[Live Instance](https://nms-optimizer.app/) | [Python Solver](https://github.com/jbelew/nms_optimizer-service)

![Screenshot](https://github.com/jbelew/nms_optimizer-web/blob/main/public/assets/img/screenshots/screenshot.png?raw=true)

---

## 🛠️ Tech Stack

- **Core**: [React 19](https://react.dev/) (with React Compiler enabled)
- **State**: [Zustand](https://github.com/pmndrs/zustand) + [Immer](https://immerjs.github.io/immer/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI Themes](https://www.radix-ui.com/themes)
- **Build Tool**: [Vite 8](https://vitejs.dev/) / [Rolldown](https://rolldown.rs/) / [LightningCSS](https://lightningcss.dev/)
- **i18n**: [i18next](https://www.i18next.com/) with Multi-language SSG support
- **Monitoring**: [Sentry](https://sentry.io/) + Google Analytics 4

---

## 🚀 Development Workflow

### Prerequisites
- Node.js (Latest LTS recommended)
- [Python Solver Service](https://github.com/jbelew/nms_optimizer-service) (running locally for API features)

### Installation
```bash
git clone https://github.com/jbelew/nms_optimizer-web.git
cd nms_optimizer-web
npm install
```

### Environment Configuration
Create a `.env.local` or update `.env.development`:
- `VITE_API_URL`: Backend service endpoint (default: `http://127.0.0.1:5000/`)
- `VITE_SENTRY_DSN`: Sentry project DSN for error tracking.

### Key Scripts
- `npm run dev`: Start dev server (bypasses SSG).
- `npm run build`: Full production build with SSG generation.
- `npm run serve:ssg`: Preview the production build with pre-rendered content.
- `npm run typecheck`: Run strict TypeScript validation.
- `npm run lint`: ESLint 10 + Prettier check.

---

## 🧪 Testing Strategy

- **Unit/Component**: [Vitest](https://vitest.dev/) + React Testing Library.
- **Interaction/A11y**: [Storybook 10](https://storybook.js.org/) with automated interaction and accessibility tests.
- **E2E**: [Playwright](https://playwright.dev/) for critical user path verification.

Run all tests:
```bash
npm run test
```

---

## 📏 Engineering Standards

### Commit Convention
This project enforces **Conventional Commits** (Angular style). Every commit must follow the format: `<type>(<scope>): <subject>`.
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `chore`: Maintenance tasks

### Agentic JSDoc
We follow the [**Agentic JSDoc**](https://github.com/jbelew/agentic-jsdoc) standard to ensure code is highly readable for both humans and AI agents. All public APIs and complex logic must be documented with semantic descriptions and proper type annotations.


### iOS Safari Rendering Policy
> [!CAUTION]
> Due to known rendering bugs in iOS Safari, **never** add GPU acceleration properties (`translateZ(0)`, `translate3d()`, `will-change`, etc.) unless a performance problem is verified on real physical devices. Simple, lean CSS is preferred.

---

## 📈 Performance & Auditing

Application performance is tracked via [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) and visualized on our [**Tactical Performance Dashboard**](https://jbelew.github.io/nms_optimizer-web/).

**Strict Quality Gates:**
- **Performance**: Must be > **90**
- **Accessibility / Best Practices / SEO**: Must be => **96**

To run audits locally:
```bash
npm run build && npm run lighthouse:ci
```

---

## 🏗️ Technical Architecture

### Hybrid Rendering (Bot & No-JS Support)
To achieve peak SEO and support for clients without JavaScript, this project uses a build-time Static Site Generation approach:
- **Build Time (SSG)**: Markdown content (instructions, about, changelog) is pre-rendered into static HTML and wrapped in `<noscript>` blocks via `scripts/generate-ssg.mjs`.
- **Search Optimization**: This ensures that search engine crawlers and browsers with JavaScript disabled can access the full content of the application's informational pages.

### Bundle Strategy & Resilience
The build system utilizes **Vite 8** / **Rolldown** with strict declarative code splitting:
- **Ad-blocker Resilience**: Tracking libraries (Sentry, GA4) are grouped into a neutrally named `vendor-events` chunk to prevent strict content filters from breaking core application logic.
- **Selective Preloading**: We filter `modulePreload` dependencies to ensure only critical-path assets (React, Zustand, UI themes) are eagerly loaded, deferring charts and markdown libraries to improve LCP.

### Progressive Web App (PWA)
Fully offline-capable using `vite-plugin-pwa`. It employs a `CacheFirst` strategy for images and fonts, and `NetworkFirst` for critical API data, ensuring a seamless experience even on limited connections.

---

## 🐳 Docker

A production-ready Docker configuration is provided:

```yaml
version: "3.8"
services:
  app:
    image: ghcr.io/jbelew/nms-optimizer-app:${TAG:-latest}
    container_name: nms_optimizer_app
    ports:
      - "8016:80"
    restart: unless-stopped
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
