## What is the NMS Optimizer?

The NMS Optimizer is a powerful web-based **calculator**, **planner**, and **builder** for the game No Man's Sky. It helps players design optimal layouts for their gear by figuring out the best module arrangement. This tool supports **Starship layouts**, **Freighter layouts**, **Corvette layouts**, **Multitool builds**, **Exocraft layouts**, and **Exosuit builds**. It automatically calculates the ideal **module placement** to maximize crucial in-game mechanics like **adjacency bonuses** (from grouping similar technologies) and the powerful boosts from **supercharged slots**. Understanding how to best use these features is key to achieving peak performance, and this tool makes that complex process simple.

## How It Works

> How do you solve a problem with up to ~8.32 × 10⁸¹ possible permutations (that's 82 digits long!) in under five seconds?

Figuring out the absolute best **module placement** with so many possible layout permutations for a full grid is no small feat. This tool blends deterministic patterns, machine learning, and Rust-based simulated annealing to deliver top-tier **Starship builds**, **Freighter builds**, **Corvette builds**, **Multitool layouts**, **Exocraft builds**, and **Exosuit layouts** in about five seconds. It considers all factors including **adjacency bonuses** and the strategic use of **supercharged slots**.

1.  **Pattern-Based Pre-Solve:** Begins with a curated library of hand-tested layout patterns, optimizing for maximum adjacency bonuses across different grid types.
2.  **AI-Guided Placement (ML Inference):** If a viable configuration includes supercharged slots, the tool invokes a TensorFlow model trained on 16,000+ grids to predict optimal placement.
3.  **Simulated Annealing (Refinement):** Refines the layout through stochastic search—swapping modules and shifting positions to boost adjacency scoring while avoiding local optima.
4.  **Result Presentation:** Outputs the highest-scoring configuration, including score breakdowns and visual layout recommendations for Starships, Freighters, Corvettes, Multi-tools, Exocraft, and Exosuits.

## Key Features

- **Comprehensive Grid Optimization:** Full support for standard, **supercharged**, and inactive slots to find the true optimal layout.
- **Strategic Supercharged Slot Utilization:** Beyond just recognizing supercharged slots, the optimizer intelligently determines whether to place core technologies (like a main weapon) or their best upgrades onto these high-boost slots, navigating the complex trade-offs to maximize your specific build goals (e.g., damage, range, or efficiency). This mirrors expert player strategies but with computational precision.
- **Machine Learning Inference:** Trained on over 16,000+ historical grid layouts to identify powerful patterns.
- **Advanced Simulated Annealing:** For meticulous layout refinement ensuring every percentage point of performance is squeezed out.

## Why Use This Tool?

Stop guessing on tech placement and unlock your gear's true potential! Whether you're aiming for a max-damage **Starship build**, a long-range **Freighter build**, a powerful **Corvette build**, the ultimate scan range with a perfect **Multitool layout**, an optimized **Exocraft**, or a robust **Exosuit**, this optimizer demystifies the complex rules of **adjacency bonuses** and **supercharged slot** interactions. It provides a clear, efficient way to plan your upgrades with confidence and achieve top-tier performance without hours of manual trial-and-error. If you've ever wondered about the best way to use your limited supercharged slots, this **NMS calculator** has the answer.

## Tech Stack

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Backend Solver:** Python, Flask, TensorFlow, NumPy, and Rust based custom simulated annealing and heuristic scoring implementations.
- **Testing:** Vitest, Python Unittest
- **Deployment:** Heroku (Hosting), Cloudflare (DNS and CDN), Docker
- **Automation:** GitHub Actions (CI/CD)
- **Analytics:** Google Analytics

## Repositories

- Web UI: [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Frequently Asked Questions

### What is an adjacency bonus in No Man's Sky?

An adjacency bonus is a performance boost you get when compatible technology modules are placed next to each other in your inventory. The more modules of the same type you group together, the stronger the bonus. The NMS Optimizer calculates the optimal arrangement to maximize these bonuses across all your technologies.

### How do supercharged slots work?

Supercharged slots provide a massive ~25-30% boost to any technology module placed in them. They're rare (limited to 4 per grid on most platforms) and strategically valuable. The optimizer helps you decide whether to place core technologies or their best upgrades in supercharged slots to maximize overall performance.

### What platforms does the optimizer support?

The optimizer supports all major No Man's Sky platforms:

- **Starships** (Standard, Exotic, Sentinel, Solar, Living)
- **Corvettes** (with unique reactor and cosmetic module support)
- **Multitools** (Standard, Exotic, Atlantid, Sentinel, Staves)
- **Exocraft** (all types including Minotaur)
- **Exosuits**
- **Freighters**

### How accurate is the optimizer?

Extremely accurate. The tool uses a combination of proven patterns, machine learning trained on 16,000+ layouts, and simulated annealing refinement. It considers all factors including adjacency bonuses, supercharged slots, and module placement constraints to find the mathematically optimal layout for your specific configuration.

### Is the optimizer free to use?

Yes! The NMS Optimizer is completely free, ad-free, and open source. No registration or payment required.

### Can I save and share my builds?

Absolutely! You can save your optimized layouts as `.nms` files, reload them later, or generate shareable links to send to friends. All builds are validated for integrity and compatibility.

## Some Fun History

Here's a look at an **early version** of the UI—functionally solid but visually minimal. The current version is a major upgrade in design, usability, and clarity, helping players quickly find the **best layout** for any ship or tool.

![Early prototype of No Man's Sky layout optimizer user interface](/assets/img/screenshots/screenshot_v03.png)
