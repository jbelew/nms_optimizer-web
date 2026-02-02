# How NMS Optimizer Works: ML-Powered Tech Layout Optimization

## What is the NMS Optimizer?

The NMS Optimizer is the best free, web-based tech layout calculator for No Man's Sky players who want to find the optimal module placement for their equipment. This tool helps you design and visualize ideal layouts for:

- **Starship tech layouts** and starship builds
- **Freighter layouts** and freighter technology placement
- **Corvette technology layouts** and corvette builds
- **Multitool layouts** and multitool builds
- **Exocraft layouts** and exocraft builds
- **Exosuit layouts** and exosuit technology placement

The tool handles the math automatically, accounting for **adjacency bonuses** (the performance boost you get from placing compatible technologies next to each other in your inventory grid) and **supercharged slots** (the rare high-value slots that give ~25-30% boosts). It calculates and finds the arrangement that gives you the highest possible score for your build.

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

## Why Choose the NMS Optimizer Over Manual Planning?

**The problem:** No Man's Sky equipment can have millions of possible technology arrangements, and finding the optimal layout by trial-and-error takes hours.

**The solution:** The NMS Optimizer uses machine learning and advanced algorithms to:
- Find your best technology layout in seconds
- Maximize adjacency bonuses automatically
- Optimize supercharged slot placement
- Show you the exact score breakdown
- Work for all equipment types (starships, corvettes, multitools, exosuits, exocraft, freighters)
- Update in real-time as you adjust your technology selections

Instead of guessing, you get the mathematically optimal arrangement—every time.

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

A: An **adjacency bonus** in No Man's Sky is the performance boost you receive when placing compatible technology modules next to each other in your inventory grid. Different technologies have different adjacency partners—for example, weapon upgrades often give bonuses when placed near each other. The NMS Optimizer analyzes your selected technologies and finds the arrangement that maximizes all adjacency bonuses across your entire grid, ensuring you get the best possible performance multipliers.

### Q: How do supercharged slots work?

A: **Supercharged slots** are rare, high-value inventory slots (usually 4 per grid) that provide a ~25–30% boost to anything placed in them. They're one of the most valuable real estate on your grid. The challenge is deciding which technologies should go in these limited slots. The optimizer uses machine learning trained on 16,000+ real layouts to decide whether to place a core technology or its best upgrade in each supercharged slot, maximizing your overall performance.

### Q: How does the NMS technology placement optimizer work?

A: The NMS Optimizer uses three methods working together:
1. **Pattern matching** – It starts with hand-tested, proven technology layout patterns that deliver solid adjacency bonuses
2. **Machine learning prediction** – A TensorFlow neural network trained on 16,000+ real-world grids predicts the best placement for your core technologies
3. **Simulated annealing refinement** – A Rust-based optimizer fine-tunes the layout by testing thousands of position swaps to reach the absolute best score possible

This three-layer approach solves what would otherwise be an impossibly complex problem (~8.32 × 10⁸¹ permutations).

### Q: Which No Man's Sky equipment does the optimizer support?

A: The NMS Optimizer supports all major No Man's Sky equipment:

- **Starships:** Standard, Exotic, Sentinel, Solar, Living, and MT (multi-tool focused) variants
- **Corvettes:** Including unique reactor modules and cosmetic technology slots
- **Multitools:** All types including Staves
- **Exocraft:** All vehicle types (Nomad, Pilgrim, Roamer, Minotaur, Nautilon)
- **Exosuits:** All technology types
- **Freighters:** Capital ship technology layouts

### Q: How accurate is the optimizer?

A: Very accurate. The NMS Optimizer combines hand-tested layout patterns, machine learning trained on 16,000+ real-world grids, and a Rust-based simulated annealing algorithm to find the mathematically optimal technology layout for your exact configuration. It accounts for all adjacency bonuses, supercharged slot trade-offs, and inactive slots to maximize your build's performance.

### Q: Can I find the best starship layout, corvette layout, or exosuit layout with this tool?

A: Yes. The NMS Optimizer finds the **best technology layout** for any equipment type:
- **Best starship layouts** considering your weapon and utility technology choices
- **Best corvette layouts** balancing reactor and combat technologies
- **Best exosuit layouts** optimizing utility, defense, and movement tech
- **Best multitool layouts** for maximum damage or utility
- **Best freighter layouts** for storage and utility

Simply select your equipment type, choose your technologies, mark your supercharged slots, and the optimizer calculates the mathematically optimal arrangement.

### Q: Is the NMS Optimizer free?

A: Yes. The NMS Optimizer is completely free, ad-free, and open source (GPL-3.0 license). No registration or payment required. All optimization happens instantly in your browser or on our servers at no cost.

### Q: Can I save and share my builds?

A: Yes. You can:
- **Save builds** as `.nms` files to your computer and reload them later
- **Generate shareable links** to send your technology layout to friends
- **Share your build directly** via social media or messaging
All builds are validated for integrity and equipment compatibility before sharing.

## Thank You

George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray, and everyone else who has contributed—your support means everything. Every donation, share, and kind word helps me keep building. Thank you.

## Early Version

Here's what the UI looked like in an early version—it worked, but the design was minimal. The current version is a major improvement in design, usability, and clarity.

![Early prototype of No Man's Sky layout optimizer user interface](/assets/img/screenshots/screenshot_v03.png)
