## Overview

This web application provides an interactive interface for optimizing technology layouts in the game _No Man's Sky_, specifically for starships, multi-tools, and freighters. The tool focuses on identifying the **best tech layouts** by maximizing adjacency bonuses and leveraging supercharged slots—core strategies for achieving the **best starship layout**, **best multi-tool layout**, or **best freighter layout**.

## How It Works

> How do you solve a problem with 479 million possible permutations in under 5 seconds?

The optimization process blends deterministic patterns with adaptive algorithms tailored to No Man's Sky technology module grids:

1.  **Pattern-Based Pre-Solve:** Begins with a curated library of hand-tested layout patterns, optimizing for maximum adjacency bonuses across different grid types.
2.  **AI-Guided Placement (ML Inference):** If a viable configuration includes supercharged slots, the tool invokes a TensorFlow model trained on 16,000+ grids to predict optimal placement.
3.  **Simulated Annealing (Refinement):** Refines the layout through stochastic search—swapping modules and shifting positions to boost adjacency scoring while avoiding local optima.
4.  **Result Presentation:** Outputs the highest-scoring configuration, including score breakdowns and visual layout recommendations for starships, multi-tools, and freighters.

## Features

- **Grid-Aware Solving:** Accounts for supercharged and inactive slots when determining the **best layout configuration**.
- **TensorFlow ML Inference:** Predicts optimal technology placement based on historical grid data.
- **Simulated Annealing:** Improves layout quality by exploring configuration shifts and adjacency-based swaps.

## Tech Stack

**Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI\
**Backend Solver:** Python, Flask, TensorFlow, NumPy, custom simulated annealing implementation, and heuristic scoring\
**Testing:** Vitest, Python Unittest\
**Deployment:** Heroku (Hosting) and Cloudflare (DNS and CDN)\
**Automation:** GitHub Actions (CI/CD)\
**Analytics:** Google Analytics

## Repositories

- Web UI: [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Some Fun History

Here's a look at an **early version** of the UI—functionally solid but visually minimal. The current version is a major upgrade in design, usability, and clarity, helping players quickly find the **best layout** for any ship or tool.

![Early prototype of No Man's Sky layout optimizer user interface](/assets/img/screenshots/screenshot_v03.png)
