# No Man's Sky Technology Layout Optimizer (Web UI)

## CI/CD Status

[![CI Pipeline](https://github.com/jbelew/nms_optimizer-web/actions/workflows/ci.yml/badge.svg)](https://github.com/jbelew/nms_optimizer-web/actions/workflows/ci.yml)
![Deployment](https://img.shields.io/badge/Deployment-Heroku-blue?logo=heroku)
[![Build & Publish Application Docker Image](https://github.com/jbelew/nms_optimizer-web/actions/workflows/publish-images.yml/badge.svg)](https://github.com/jbelew/nms_optimizer-web/actions/workflows/publish-images.yml)

**A Web UI for a No Man's Sky technology layout optimization tool**

This tool optimizes technology layouts by calculating pattern-based scores. It prioritizes supercharged slots using game-tested configurations and ensures the best fit within the grid. When additional supercharged slots are in range of a pattern, the tool runs a localized Simulated Annealing or ML-Driven solves to explore layouts outside of the base configurations that offer additional benefits. The goal is not to calculate in-game stats but to use a thoroughly tested weighting system for layout optimization.

[Live Instance](https://nms-optimizer.app/)

![Screenshot](https://github.com/jbelew/nms_optimizer-web/blob/main/public/assets/img/screenshots/screenshot.png?raw=true)

### **Tech Stack**

- **React 19**
- **Zustand**
- **Tailwind CSS 4**
- **Vite 8**
- **Radix UI**
- **TypeScript**
- **Playwright (E2E Testing)**
- **Vitest (Unit Testing)**
- **Storybook 10**

The Python solver for this project can be found [here](https://github.com/jbelew/nms_optimizer-service).

---

### **Local Installation Instructions**

To run this project locally, follow these steps:

1. **Clone the repository:**

    ```sh
    git clone https://github.com/jbelew/nms_optimizer-web.git
    cd nms_optimizer-web
    ```

2. **Install dependencies:**

    Make sure you have [Node.js](https://nodejs.org/) installed. Then, install the necessary dependencies with:

    ```sh
    npm install
    ```

3. **Run the development server:**

    Start the development server with:

    ```sh
    npm run dev
    ```

The app runs at http://localhost:5173 by default. In development mode, it expects the backend service to be available at http://127.0.0.1:5000/.

To override the default service endpoint, update the VITE_API_URL value in your .env.development file.

---

### Docker compose.yml

```
version: "3.8"
services:
  app:
    image: ghcr.io/jbelew/nms-optimizer-app:${TAG:-latest}
    container_name: nms_optimizer_app
    build:
      context: .
    ports:
      - "8016:80"
    restart: unless-stopped
```

---

### **Lighthouse Auditing**

A Lighthouse audit is automatically run against a production build of the application on every push to the `main` or `dev` branch. Performance trends and historical reports are visualized on our [**Tactical Performance Dashboard**](https://jbelew.github.io/nms_optimizer-web/).

To run the audit locally against a preview of the production build, use the following command:

```bash
npm run build && npm run lighthouse:ci
```

You can also use the performance check script to analyze bundle sizes:

```bash
npm run perf:check
```

