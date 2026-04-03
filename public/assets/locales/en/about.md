# How NMS Optimizer Works

## What Is This?

NMS Optimizer is a free tool that figures out where to place your technology modules in No Man's Sky. You pick your equipment, select your technologies, mark your supercharged slots, and it calculates the layout that scores highest.

It works for starships (standard, sentinel, solar, fighter, living, atlantid), corvettes, multitools, exosuits, all exocraft types, and freighters.

The tool handles adjacency bonuses and supercharged slot placement automatically. In practice, an optimized layout typically scores 15-20% higher than what most players arrange by hand.

## The Problem

No Man's Sky doesn't explain adjacency bonuses well, and doesn't explain supercharged slot strategy at all. Modules of the same type get a stat boost when they share an edge on the grid. Supercharged slots give a ~25-30% multiplier to whatever you put in them. Figuring out the best arrangement means juggling both systems at once, across grids with millions of possible permutations (~8.32 × 10⁸¹ for a full layout).

Nobody is solving that by hand.

## How the Optimizer Solves It

The optimizer runs through four steps:

1. **Pattern matching** — it starts with hand-tested arrangements that reliably score well for common module sets
2. **ML prediction** — if your grid has supercharged slots, a TensorFlow model trained on 16,000+ high-scoring layouts predicts where to place core technologies vs. upgrades
3. **Simulated annealing** — a Rust-based optimizer swaps modules and tests thousands of arrangements in milliseconds, climbing toward the highest possible score
4. **Result display** — you see the top-scoring layout with a full adjacency multiplier breakdown

Each step feeds into the next. The ML model gives simulated annealing a strong starting point, and annealing refines from there.

## What the Optimizer Accounts For

- Standard, supercharged, and inactive slots
- Whether a core technology or its best upgrade belongs in each supercharged slot
- Trade-offs between competing stats (maneuverability vs. speed, damage vs. fire rate)
- Module-specific stat weights and adjacency partner rules

## Tech Stack

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Backend solver:** Python, Flask, TensorFlow, NumPy, Rust (simulated annealing and scoring)
- **Testing:** Vitest, Python Unittest
- **Deployment:** Heroku (hosting), Cloudflare (Hosting/DNS/CDN), Docker
- **CI/CD:** GitHub Actions

## Repositories

- Web UI: [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## FAQ

### What Is an Adjacency Bonus?

When you place compatible technology modules next to each other on the inventory grid, they get a stat boost. Different technologies have different adjacency partners — weapon upgrades bonus off each other, movement tech bonuses off other movement tech, and so on. The optimizer tests all possible arrangements and picks the one where total adjacency bonuses are highest.

### How Do Supercharged Slots Work?

Supercharged slots are rare inventory slots (usually 4 per grid) that give a ~25-30% boost to whatever module sits in them. The tricky part is deciding what goes there. Sometimes it's the core technology, sometimes it's the highest-stat upgrade. The optimizer's ML model is trained specifically on this decision, using 16,000+ real layouts as training data.

### Which Equipment Types Are Supported?

All of them:

- **Starships:** Standard, Exotic, Sentinel, Solar, and Living
- **Corvettes:** Including unique reactor modules and cosmetic technology slots
- **Multitools:** All types including Staves
- **Exocraft:** All vehicle types (Nomad, Colossus, Pilgrim, Roamer, Minotaur, Nautilon)
- **Exosuits:** All technology types
- **Freighters:** Capital ship technology layouts

### Is It Free?

Yes. Free, ad-free, open source (GPL-3.0). No accounts or email required.

### Can I Save and Share Builds?

Yes. You can save builds as `.nms` files, generate shareable links, or share directly to social media. Builds are validated for integrity and equipment compatibility before sharing.

## Thank You

George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray, and everyone else who has contributed — your support means everything. Every donation, share, and kind word helps me keep building. Thank you.

## Early Version

Here's what the UI looked like in an early version—it worked, but the design was minimal. The current version is a major improvement in design, usability, and clarity.
![Early prototype of No Man's Sky layout optimizer user interface](/assets/img/screenshots/screenshot_v03.png)
