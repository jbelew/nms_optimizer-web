## What is the NMS Optimizer?

The NMS Optimizer is a free, web-based tool for No Man's Sky players who want to find the best module placement for their equipment. This tool helps you design and visualize ideal layouts for:

- Starship builds
- Freighter layouts
- Corvette builds
- Multitool layouts
- Exocraft builds
- Exosuit builds

The tool handles the math automatically, accounting for adjacency bonuses (the bonus you get from placing similar technologies next to each other) and supercharged slots. It finds the arrangement that gives you the highest score.

## How Does It Work?

The problem is mathematically enormous: ~8.32 × 10⁸¹ possible permutations (82 digits long). We solve it using pattern recognition, machine learning, and optimization. The tool works in four steps:

1. **Check curated patterns:** Start with hand-tested patterns that give solid adjacency bonuses
2. **Predict with ML:** If your setup includes supercharged slots, a TensorFlow model—trained on 16,000+ real-world grids—predicts the best placement for core technologies
3. **Refine with simulated annealing:** A Rust-based optimizer swaps modules and shifts positions to reach the best possible score
4. **Show you the result:** The tool displays your highest-scoring configuration with score breakdowns

## What It Can Do

- **Handles all slot types:** Standard, supercharged, and inactive slots
- **Understands supercharged slots:** The optimizer decides whether a core technology or its best upgrade should go in these high-value slots. It navigates the trade-offs to maximize your goal
- **Uses ML patterns:** Trained on 16,000+ real layouts to identify high-performing arrangements
- **Refines to perfection:** Simulated annealing extracts every percentage point of performance possible

## Why Use It

Skip the endless trial-and-error. Get the mathematically optimal layout for your max-damage Starship, longest-range Freighter, powerful Corvette, or robust Exosuit. The tool explains adjacency bonuses and supercharged slots instead of leaving you guessing. If you've ever wondered how to best use your limited supercharged slots, this gives you the answer.

## Tech Stack

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Backend Solver:** Python, Flask, TensorFlow, NumPy, Rust-based simulated annealing and scoring
- **Testing:** Vitest, Python Unittest
- **Deployment:** Heroku (Hosting), Cloudflare (DNS and CDN), Docker
- **Automation:** GitHub Actions (CI/CD)
- **Analytics:** Google Analytics

## Repositories

- Web UI: [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Frequently Asked Questions

### Q: What is an adjacency bonus?

A: When compatible technology modules sit next to each other in your grid, they give you a performance boost. The optimizer finds the arrangement that maximizes these bonuses across all your technologies.

### Q: How do supercharged slots work?

A: Supercharged slots (usually 4 per grid) give a ~25–30% boost to anything placed in them. They're rare and valuable. The optimizer helps you decide whether to put a core technology or its best upgrade in these slots.

### Q: What equipment does the optimizer support?

A: All major No Man's Sky gear:

- **Starships:** Standard, Exotic, Sentinel, Solar, Living
- **Corvettes:** Including unique reactor and cosmetic modules
- **Multitools:** All types including Staves
- **Exocraft:**
- **Exosuits**
- **Freighters**

### Q: How accurate is it?

A: Very accurate. It combines proven patterns, machine learning from 16,000+ layouts, and simulated annealing to find the mathematically optimal layout for your configuration.

### Q: Is it free?

A: Yes. The NMS Optimizer is completely free, ad-free, and open source (GPL-3.0). No registration or payment required.

### Q: Can I save and share builds?

A: Yes. You can save optimized layouts as `.nms` files, reload them later, or generate shareable links for friends. All builds are validated for integrity and compatibility.

## Thank You

George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray, and everyone else who has contributed—your support means everything. Every donation, share, and kind word helps me keep building. Thank you.

## Early Version

Here's what the UI looked like in an early version—it worked, but the design was minimal. The current version is a major improvement in design, usability, and clarity.

![Early prototype of No Man's Sky layout optimizer user interface](/assets/img/screenshots/screenshot_v03.png)
