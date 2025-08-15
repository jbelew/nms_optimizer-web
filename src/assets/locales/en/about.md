## Overview

This web application, the NMS Optimizer, helps players of No Man's Sky figure out the best module arrangement to design optimal **Starship layouts**, **Multitool builds**, **Exocraft layouts**, and **Exosuit builds**. It automatically calculates the ideal **module placement** to maximize crucial in-game mechanics like **adjacency bonuses** (achieved by grouping similar technologies for synergistic effects) and the powerful boosts from **supercharged slots**. Understanding how to best utilize these features, especially supercharged slots, is key to achieving peak performance, and this tool makes that complex process simple.

## How It Works

> How do you solve a problem with up to ~8.32 × 10⁸¹ possible permutations (that’s 82 digits long!) in under five seconds?

Figuring out the absolute best **module placement** with so many possible layout permutations for a full grid is no small feat. This tool blends deterministic patterns, machine learning, and simulated annealing to deliver top-tier **Starship build**, **Multitool layout**, **Exocraft build**, and **Exosuit layout** suggestions in under five seconds. It considers all factors including **adjacency bonuses** and the strategic use of **supercharged slots**.

1.  **Pattern-Based Pre-Solve:** Begins with a curated library of hand-tested layout patterns, optimizing for maximum adjacency bonuses across different grid types.
2.  **AI-Guided Placement (ML Inference):** If a viable configuration includes supercharged slots, the tool invokes a TensorFlow model trained on 16,000+ grids to predict optimal placement.
3.  **Simulated Annealing (Refinement):** Refines the layout through stochastic search—swapping modules and shifting positions to boost adjacency scoring while avoiding local optima.
4.  **Result Presentation:** Outputs the highest-scoring configuration, including score breakdowns and visual layout recommendations for Starships, Multi-tools, Exocraft, and Exosuits.

## Key Features

- **Comprehensive Grid Optimization:** Full support for standard, **supercharged**, and inactive slots to find the true optimal layout.
- **Strategic Supercharged Slot Utilization:** Beyond just recognizing supercharged slots, the optimizer intelligently determines whether to place core technologies (like a main weapon) or their best upgrades onto these high-boost slots, navigating the complex trade-offs to maximize your specific build goals (e.g., damage, range, or efficiency). This mirrors expert player strategies but with computational precision.
- **Machine Learning Inference:** Trained on over 16,000+ historical grid layouts to identify powerful patterns.
- **Advanced Simulated Annealing:** For meticulous layout refinement ensuring every percentage point of performance is squeezed out.

## Why Use This Tool?

Stop guessing on tech placement and unlock your gear's true potential! Whether you're aiming for a max-damage **Starship build**, the ultimate scan range with a perfect **Multitool layout**, an optimized **Exocraft**, or a robust **Exosuit**, or trying to figure out the best way to use your limited supercharged slots, this optimizer demystifies the complex rules of **adjacency bonuses** and **supercharged slot** interactions. It provides a clear, efficient way to plan your upgrades with confidence and achieve top-tier performance without hours of manual trial-and-error.

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
