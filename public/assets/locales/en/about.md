# About NMS Optimizer: The Ultimate No Man's Sky Tech Layout Calculator

NMS Optimizer is a 100% free, ad-free tool designed to figure out exactly where to place your technology modules in _No Man's Sky_. You pick your equipment, select your S-Class or X-Class upgrade modules, mark your supercharged slots, and our calculator almost instantly generates the layout that maximizes your in-game stats.

By perfectly balancing game mechanics, an optimized layout typically scores **15-20% higher** than what most players can arrange by hand.

## The Problem: Maximizing Adjacency Bonuses & Supercharged Slots

_No Man's Sky_ doesn't explicitly explain adjacency bonuses, and offers no guidance on supercharged slot strategy. Maximizing your starship's maneuverability or your multi-tool's damage means juggling two complex systems:

- **Adjacency Bonuses:** When you place compatible technology modules next to each other on the inventory grid, they get a stat boost. Different technologies have different adjacency partners—weapon upgrades boost each other, movement tech boosts other movement tech, and the more shared edges you create, the bigger the cumulative bonus.
- **Supercharged Slots:** These rare inventory slots (usually up to 4 per grid) give a massive ~25-30% stat multiplier to whatever module is placed inside them.

Figuring out the absolute best arrangement means testing combinations across millions of possible permutations—up to roughly 8.32 × 10⁸¹ for a fully expanded grid. Nobody is solving that by hand.

## How the Layout Optimization Engine Works

We don't rely on guesswork. The NMS Optimizer engine uses a sophisticated four-step pipeline to automatically find your best build:

1.  **Pattern Matching:** The solver starts with hand-tested, community-proven arrangements that reliably score well for common module sets.
2.  **Machine Learning (AI):** If your grid has unique supercharged slots, a TensorFlow machine learning model—trained on over 16,000 high-scoring layouts—predicts the smartest placements for your core technologies versus your upgrade modules.
3.  **Simulated Annealing:** Our core optimization engine, built in Rust, rapidly swaps modules and tests thousands of arrangements in milliseconds to climb toward the absolute highest possible score.
4.  **Result Display:** You immediately see the winning layout alongside a full adjacency multiplier breakdown.

## Supported Equipment

The NMS Optimizer provides dynamic solving for every major platform in the game:

- **Starships:** Standard, Exotic, Sentinel Interceptor, Solar, Fighter, Living, and Atlantid ships.
- **Multi-Tools:** All weapon and mining variants, including Staves.
- **Exosuits & Exocraft:** All Exosuit technologies and vehicle types (Nomad, Colossus, Pilgrim, Roamer, Minotaur, Nautilon).
- **Freighters:** Capital ship hyperdrive and fleet coordination technology.
- **Corvettes:** Support for complex layouts, including unique reactor modules and cosmetic technology slots.

## Frequently Asked Questions (FAQ)

**What should I put in my supercharged slots?**
It depends on your layout! Sometimes it's best to supercharge your core technology, and other times it's better to supercharge your highest-rolled upgrade. Our AI model was trained on 16,000+ real layouts specifically to make this decision for you.

**Is the NMS Optimizer free?**
Yes. It is 100% free, ad-free, and open-source (GPL-3.0). You do not need to create an account or provide an email.

**Can I save and share my layouts?**
Yes! You can save your favorite builds locally as `.nms` files, generate shareable links to send to friends, or share high-quality layout screenshots directly to social media. Builds are validated for integrity before sharing.

**Why does the tool not show in-game stats?**
The tool intentionally avoids calculating standard in-game metrics like DPS or Light Year range. Because exact numbers require hidden ship seeds inaccessible without a save editor, the optimizer relies on a "percentage of maximum" score instead.

**Why doesn't the optimized layout include my specific Expedition module?**
The NMS Optimizer fully supports all **Expedition and Expedition-Redux Rewards** offered after the _Worlds Part I_ update. However, because not all players possess these rare items, these optional modules are not included by default into your solves. You can easily activate them for your build by opening the **Module Selection interface**.

## Under the Hood: Our Tech Stack

For the developers and data nerds, here is the technology stack powering the NMS Optimizer:

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Backend Solver:** Python, Flask, TensorFlow, NumPy, Rust (powers the simulated annealing and scoring engine)
- **Testing:** Vitest, Python Unittest
- **Deployment & Hosting:** Heroku (API hosting), Cloudflare (DNS/CDN), Docker
- **CI/CD:** GitHub Actions

### Open Source Repositories

Want to contribute? The NMS Optimizer is fully open-source.

- Web UI: [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## A Huge Thank You to the Community

This project wouldn't be possible without the incredible _No Man's Sky_ community. A special thank you to George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray, and everyone else who has contributed. Your support, donations, shares, and kind words mean everything and help keep this project alive.

## A Look Back: Early Versions

![Early prototype of No Man's Sky layout optimizer user interface](/assets/img/screenshots/screenshot_v03.png)
If you were with us in the beginning, you might remember what the UI looked like in its early alpha stages. It worked, but the design was minimal. The current version represents a major, ongoing improvement in design, mobile usability, and overall clarity.
