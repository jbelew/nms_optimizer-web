# No Man's Sky Technology Layout Optimizer (Web UI)

## CI/CD Status

![Tests](https://github.com/jbelew/nms_optimizer-web/actions/workflows/main.yml/badge.svg?branch=main)
![Deployment](https://img.shields.io/badge/Deployment-Heroku-blue?logo=heroku)
[![Build & Publish Application Docker Image](https://github.com/jbelew/nms_optimizer-web/actions/workflows/publish-images.yml/badge.svg)](https://github.com/jbelew/nms_optimizer-web/actions/workflows/publish-images.yml)

**A Web UI for a No Man's Sky technology layout optimization tool**

This tool optimizes technology layouts by calculating pattern-based scores. It prioritizes supercharged slots using game-tested configurations and ensures the best fit within the grid. When additional supercharged slots are in range of a pattern, the tool runs a localized Simulated Annealing or ML-Driven solves to explore layouts outside of the base configurations that offer additional benefits. The goal is not to calculate in-game stats but to use a thoroughly tested weighting system for layout optimization.

[Live Instance](https://nms-optimizer.app/)

![Screenshot](https://github.com/jbelew/nms_optimizer-web/blob/main/public/assets/img/screenshots/screenshot.png?raw=true)

### **Tech Stack**

- **React**
- **Zustand**
- **Tailwind CSS**
- **Vite**
- **Radix UI**

The Python solver for this project can be found [here](https://github.com/jbelew/nms_optimizer-service).

---

### **Contributing**

#### **Translations**

This project uses [Crowdin](https://crowdin.com/) to manage translations. If you would like to contribute to the translation of this application, please visit our Crowdin project page and join the translation team.

[**Contribute to Translations on Crowdin**](https://crowdin.com/project/nms-optimizer)

We appreciate your help in making this application accessible to a wider audience!

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

A Lighthouse audit is automatically run against a production build of the application on every push to the `main` branch. This provides a performance baseline for the proposed changes. The audit is performed as part of the `Lighthouse Audit` GitHub Actions workflow.

A summary of the Lighthouse scores is published to the "Summary" page of the workflow run. The full reports (HTML and JSON) are also available as artifacts in the workflow run. You can download them from the "Artifacts" section of the workflow summary page.

To run the audit locally against a preview of the production build, use the following command:

```sh
npm run build && npm run lighthouse:local
```
