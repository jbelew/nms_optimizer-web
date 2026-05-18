# Tech Stack: No Man's Sky Technology Layout Optimizer

## Core Technologies
- **Language:** [TypeScript](https://www.typescriptlang.org/) - Provides static typing for robust and maintainable code.
- **Frontend Framework:** [React 19](https://react.dev/) (via [Vite 8](https://vite.dev/)) - Modern, fast UI library and build tool.
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) - A small, fast, and scalable bearbones state-management solution.
  - **Patterns:** Uses Store Orchestration via a `sessionCoordinator` and Discriminated Unions for complex status tracking.
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework for rapid UI development.
- **UI Components:** [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components for building high-quality design systems.

## Infrastructure & Tooling
- **Build Tool:** Vite 8 - Next-generation frontend tooling.
- **Routing:** [React Router 7](https://reactrouter.com/) - Declarative routing for React applications.
- **Internationalization:** [i18next](https://www.i18next.com/) - Framework for localizing the application (e.g., Crowdin integration).
- **Data Visualization:** [Recharts 3](https://recharts.org/) - Composable charting library built with React components.
- **Observability:** [Sentry](https://sentry.io/) - Error tracking, performance monitoring, and release management.
- **Image Processing:** [Sharp](https://sharp.pixelplumbing.com/) - High performance Node.js image processing.
- **Release Management:** [Semantic Release](https://github.com/semantic-release/semantic-release) - Fully automated version management and package publishing.

## Backend Tech Stack
- **Runtime:** [Python 3.12+](https://www.python.org/)
- **Framework:** [Flask](https://flask.palletsprojects.com/) - Lightweight WSGI web application framework.
- **WebSocket:** [Flask-SocketIO](https://flask-socketio.readthedocs.io/) - Real-time communication for optimization progress.
- **Analytics:** [BigQuery](https://cloud.google.com/bigquery) & [Google Analytics 4](https://developers.google.com/analytics/devguides/reporting/data/v1) - Field data warehousing and reporting.
- **Architecture:** Modular Blueprints for domain separation (Optimization vs Analytics).
- **Caching:** In-memory TTL caching for expensive analytics queries.

## Testing & Quality Assurance
- **Unit/Integration Testing:** [Vitest](https://vitest.dev/) - A Vite-native unit test framework.
- **End-to-End Testing:** [Playwright](https://playwright.dev/) - Reliable end-to-end testing for modern web apps.
- **UI Testing:** [Storybook 10](https://storybook.js.org/) - Frontend workshop for building UI components and pages in isolation.
- **Performance:** [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Automated tool for improving the quality of web pages.
- **Linting:** [ESLint](https://eslint.org/) & [Stylelint](https://stylelint.io/) - Pluggable linting utilities for JS and CSS.
