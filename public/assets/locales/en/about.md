## What is the NMS Optimizer?

Stop relying on guesswork! The **NMS Optimizer** is the ultimate, free, web-based **calculator**, **planner**, and **builder** for **No Man's Sky** players who want to unlock their gear's absolute maximum potential.

This intelligent tool helps you design and visualize the **optimal module placement** for all your equipment. Get the perfect **layout** for your:

* **Starship builds** (all classes)
* **Freighter layouts**
* **Corvette builds**
* **Multitool layouts**
* **Exocraft builds**
* **Exosuit builds**

The optimizer automatically handles the complex math, calculating the ideal arrangement to maximize critical in-game mechanics like **adjacency bonuses** (the boost from grouping similar technologies) and the immense power of **supercharged slots**. Achieving peak performance has never been easier.

## How Does It Solve the Impossible Problem?

> How do you solve a problem with up to ~8.32 × 10⁸¹ possible permutations (that’s 82 digits long!) in mere seconds?

We blend cutting-edge technology to deliver top-tier **Starship layouts**, **Freighter builds**, **Multitool layouts**, and **Exosuit builds**. The tool considers every factor, including all **adjacency bonuses** and the strategic use of **supercharged slots**, using a four-step process:

1. **Start with the Best Patterns:** Instantly check a curated library of hand-tested patterns to establish a high-scoring starting point for **adjacency bonuses**.
2. **AI-Guided Placement (Machine Learning):** If your setup includes supercharged slots, a specialized TensorFlow model—trained on 16,000+ real-world grids—predicts the optimal placement for core technologies.
3. **Refinement via Simulated Annealing:** A highly optimized, Rust-based stochastic search swaps modules and shifts positions, ensuring the layout reaches its absolute performance limit and avoids common mistakes (local optima) that human players often encounter.
4. **Visualize the Perfect Build:** The **NMS Optimizer** presents the highest-scoring configuration, complete with score breakdowns and visual recommendations for all your gear.

## Key Features That Drive Performance

* **Comprehensive Optimization:** Full support for standard, **supercharged**, and inactive slots to guarantee the mathematically optimal **layout**.
* **Intelligent Supercharged Slot Utilization:** The optimizer doesn’t just recognize supercharged slots—it acts like an expert player, determining whether a core technology (like a main Pulse Engine) or its most powerful upgrade should occupy these high-boost slots. It navigates complex trade-offs to perfectly maximize your goal (e.g., jump range, weapon damage, or mobility).
* **Advanced AI Learning:** Built on **Machine Learning Inference** from over 16,000 historical grid layouts.
* **Meticulous Layout Refinement:** The **Advanced Simulated Annealing** process ensures every possible percentage point of performance is extracted from your equipment.

## Why Use This **NMS Calculator**?

Stop the endless trial-and-error! Unlock your gear's true potential whether you’re building a max-damage **Starship build**, the longest-range **Freighter layout**, a powerful **Corvette build**, the ultimate scan range with a perfect **Multitool layout**, an optimized **Exocraft**, or a robust **Exosuit**.

This **optimizer** demystifies the complex rules of **adjacency bonuses** and **supercharged slot** interactions, providing a clear, efficient way to plan every upgrade with confidence. If you’ve ever wondered how to best use your limited **supercharged slots**, this tool provides the definitive answer.

## Tech Stack

* **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
* **Backend Solver:** Python, Flask, TensorFlow, NumPy, Rust-based custom simulated annealing and heuristic scoring
* **Testing:** Vitest, Python Unittest
* **Deployment:** Heroku (Hosting), Cloudflare (DNS and CDN), Docker
* **Automation:** GitHub Actions (CI/CD)
* **Analytics:** Google Analytics

## Repositories

* Web UI: [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
* Backend: [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Frequently Asked Questions

### Q: What is an adjacency bonus in No Man's Sky?
A: An **adjacency bonus** is a significant performance boost gained when compatible technology modules are placed next to each other in your inventory grid. The NMS Optimizer calculates the optimal arrangement to maximize these bonuses across all your technologies for maximum effect.

### Q: How do supercharged slots work?
A: **Supercharged slots** are rare (usually 4 per grid) and provide a massive ~25–30% boost to any module placed in them. They are strategically vital. The optimizer helps you decide whether to place a core technology or its best upgrades in these slots to maximize overall performance.

### Q: What equipment does the optimizer support?

A: The optimizer supports all major **No Man’s Sky** gear:

* **Starships:** Standard, Exotic, Sentinel, Solar, Living
* **Corvettes:** including unique reactor and cosmetic modules
* **Multitools:** Standard, Exotic, Atlantid, Sentinel, Staves
* **Exocraft:** all types including Minotaur
* **Exosuits**
* **Freighters**

### Q: How accurate is the optimizer?

A: It is **extremely accurate**. Using a combination of proven patterns, machine learning on 16,000+ layouts, and simulated annealing refinement, it accounts for **adjacency bonuses**, **supercharged slots**, and module placement rules to find the mathematically **optimal layout** for your configuration.

### Q: Is the optimizer free to use?

A: Yes! The **NMS Optimizer** is completely free, ad-free, and open source (GPL-3.0). No registration or payment is required.

### Q: Can I save and share my builds?

A: Absolutely! You can save optimized layouts as `.nms` files, reload them later, or generate shareable links for friends. All builds are validated for integrity and compatibility.

## Thank You to All My Amazing Supporters!

George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray, and everyone else who has contributed — your support means the world.

Every donation, share, and kind word helps me continue building tools that make your NMS experience better. Thank you for being part of this journey — you rock!

## Some Fun History

Here’s a look at an **early version** of the UI—functionally solid but visually minimal. The current version is a massive upgrade in design, usability, and clarity, helping players quickly find the **best layout** for any ship or tool.

![Early prototype of No Man's Sky layout optimizer user interface](/assets/img/screenshots/screenshot_v03.png)
